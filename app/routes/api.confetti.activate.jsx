import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const body = await request.json();

    const { confettiId, config, triggerEvent } = body;

    if (!confettiId || !config) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing confettiId or config" }),
        { status: 400 }
      );
    }

    const shopDomain = session.shop;

    // -------------------------------
    // Normalize trigger event
    // -------------------------------
    const triggerEventValue =
      typeof triggerEvent === "string"
        ? triggerEvent
        : triggerEvent?.event || "page_load";

    // -------------------------------
    // Upsert Shop
    // -------------------------------
    const shop = await prisma.shop.upsert({
      where: { shopifyShopId: session.id },
      update: {
        name: shopDomain,
        accessToken: session.accessToken,
      },
      create: {
        shopifyShopId: session.id,
        name: shopDomain,
        accessToken: session.accessToken,
      },
    });

    // -------------------------------
    // Deactivate ALL previous configs
    // (only one active allowed)
    // -------------------------------
    await prisma.confettiConfig.updateMany({
      where: { shopId: shop.id },
      data: { active: false },
    });

    // -------------------------------
    // Upsert active config
    // -------------------------------
    const record = await prisma.confettiConfig.upsert({
      where: { id: confettiId },
      update: {
        title: config.title,
        type: config.type,
        config,
        triggerEvent: triggerEventValue,
        active: true,
        shopDomain,
        shopId: shop.id,
      },
      create: {
        id: confettiId,
        title: config.title,
        type: config.type,
        config,
        triggerEvent: triggerEventValue,
        active: true,
        shopDomain,
        shopId: shop.id,
      },
    });

    // -------------------------------
    // Get Shopify Shop GID (CORRECT)
    // -------------------------------
    const shopInfoRes = await admin.graphql(`
      query {
        shop { id }
      }
    `);

    const shopInfo = await shopInfoRes.json();
    const shopGid = shopInfo?.data?.shop?.id;

    if (!shopGid) throw new Error("Shop GID not found");

    // -------------------------------
    // Write metafields (JSON AS STRING)
    // -------------------------------
    const configValueString = JSON.stringify({
      id: record.id,
      type: record.type,
      ...config,
    });

    const metafieldRes = await admin.graphql(
      `
      mutation SetConfettiMetafields(
        $shopId: ID!,
        $configValue: String!,
        $trigger: String!
      ) {
        metafieldsSet(metafields: [
          {
            ownerId: $shopId
            namespace: "confetti_maker"
            key: "active_config"
            type: "json"
            value: $configValue
          },
          {
            ownerId: $shopId
            namespace: "confetti_maker"
            key: "trigger_event"
            type: "single_line_text_field"
            value: $trigger
          }
        ]) {
          userErrors { field message }
        }
      }
      `,
      {
        variables: {
          shopId: shopGid,
          configValue: configValueString,
          trigger: triggerEventValue,
        },
      }
    );

    const result = await metafieldRes.json();
    const errors = result.data?.metafieldsSet?.userErrors || [];

    if (errors.length) {
      console.error(errors);
      return new Response(JSON.stringify({ ok: false, errors }), {
        status: 500,
      });
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
