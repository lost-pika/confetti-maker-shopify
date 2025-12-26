import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  try {
    // 1️⃣ AUTH
    const { admin, session } = await authenticate.admin(request);

    // 2️⃣ BODY
    const body = await request.json();
    const { confettiId, config, triggerEvent } = body;

    if (!confettiId || !config) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing confettiId or config" }),
        { status: 400 }
      );
    }

    // ✅ ALWAYS STRING
    const trigger =
      typeof triggerEvent === "string"
        ? triggerEvent
        : triggerEvent?.event || "page_load";

    // 3️⃣ SHOP INFO FROM SHOPIFY
    const shopRes = await admin.graphql(`
      {
        shop {
          id
          myshopifyDomain
        }
      }
    `);

    const shopJson = await shopRes.json();
    const shopGid = shopJson?.data?.shop?.id;
    const shopDomain = shopJson?.data?.shop?.myshopifyDomain;

    if (!shopGid || !shopDomain) {
      throw new Error("Failed to fetch shop info");
    }

    // 4️⃣ UPSERT SHOP
    const shop = await prisma.shop.upsert({
      where: { shopifyShopId: shopGid },
      update: {
        name: shopDomain,
        accessToken: session.accessToken,
      },
      create: {
        shopifyShopId: shopGid,
        name: shopDomain,
        accessToken: session.accessToken,
      },
    });

    // 5️⃣ DEACTIVATE OLD
    await prisma.confettiConfig.updateMany({
      where: { shopId: shop.id },
      data: { active: false },
    });

    // 6️⃣ UPSERT CONFETTI (🔥 FIXED)
    const record = await prisma.confettiConfig.upsert({
      where: { id: confettiId },
      update: {
        title: config.title,
        type: config.type,
        config,
        triggerEvent: trigger, // ✅ STRING
        active: true,
      },
      create: {
        id: confettiId,
        title: config.title,
        type: config.type,
        config,
        triggerEvent: trigger, // ✅ STRING
        active: true,
        shopId: shop.id,
        shopDomain,
      },
    });

    // 7️⃣ METAFIELDS FOR THEME EXTENSION
    const metafieldRes = await admin.graphql(
      `
      mutation SetConfetti(
        $shopId: ID!,
        $config: String!,
        $trigger: String!
      ) {
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
      }
      `,
      {
        variables: {
          shopId: shopGid,
          config: JSON.stringify({
            id: record.id,
            ...record.config,
          }),
          trigger,
        },
      }
    );

    const metaJson = await metafieldRes.json();
    const errors = metaJson?.data?.metafieldsSet?.userErrors || [];
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
