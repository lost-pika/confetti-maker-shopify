import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON body" }),
        { status: 400 }
      );
    }

    const { confettiId, config, triggerEvent } = body;
    if (!confettiId || !config) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing confettiId or config" }),
        { status: 400 }
      );
    }

    const shopDomain = session.shop;

    const shop = await prisma.shop.upsert({
      where: { shopDomain },
      update: { accessToken: session.accessToken },
      create: {
        shopDomain,
        name: shopDomain,
        accessToken: session.accessToken,
      },
    });

    await prisma.confettiConfig.updateMany({
      where: { shopId: shop.id },
      data: { active: false },
    });

    const record = await prisma.confettiConfig.upsert({
      where: { id: confettiId },
      update: {
        config,
        triggerEvent,
        active: true,
      },
      create: {
        id: confettiId,
        config,
        triggerEvent,
        active: true,
        shopId: shop.id,
        shopDomain,
      },
    });

    const shopRes = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopRes.json();
    const shopGid = shopJson?.data?.shop?.id;
    if (!shopGid) throw new Error("Shop GID not found");

    const metafieldRes = await admin.graphql(
      `mutation SetConfetti($shopId: ID!, $config: String!, $trigger: String!) {
        metafieldsSet(metafields: [
          {
            ownerId: $shopId
            namespace: "confetti_maker"
            key: "active_config"
            type: "json"
            value: $config
          },
          {
            ownerId: $shopId
            namespace: "confetti_maker"
            key: "trigger_event"
            type: "single_line_text_field"
            value: $trigger
          }
        ]) {
          userErrors { message }
        }
      }`,
      {
        variables: {
          shopId: shopGid,
          config: JSON.stringify(record.config),
          trigger: triggerEvent || "page_load",
        },
      }
    );

    const metafieldJson = await metafieldRes.json();
    const errors = metafieldJson.data.metafieldsSet.userErrors;
    if (errors.length) {
      throw new Error(errors.map(e => e.message).join(", "));
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Activate failed:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500 }
    );
  }
};

