import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  try {
    // ─────────────────────────────
    // 1️⃣ AUTHENTICATE
    // ─────────────────────────────
    const { admin, session } = await authenticate.admin(request);

    // ─────────────────────────────
    // 2️⃣ PARSE BODY
    // ─────────────────────────────
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

    // ─────────────────────────────
    // 3️⃣ GET SHOP INFO FROM SHOPIFY (GID FIRST!)
    // ─────────────────────────────
    const shopRes = await admin.graphql(`
      {
        shop {
          id
          domain
        }
      }
    `);

    const shopJson = await shopRes.json();
    const shopGid = shopJson?.data?.shop?.id;
    const shopDomain = shopJson?.data?.shop?.domain;

    if (!shopGid || !shopDomain) {
      throw new Error("Failed to fetch shop info from Shopify");
    }

    // ─────────────────────────────
    // 4️⃣ UPSERT SHOP (CORRECT UNIQUE KEY)
    // ─────────────────────────────
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

    // ─────────────────────────────
    // 5️⃣ DEACTIVATE OLD CONFETTI
    // ─────────────────────────────
    await prisma.confettiConfig.updateMany({
      where: { shopId: shop.id },
      data: { active: false },
    });

    // ─────────────────────────────
    // 6️⃣ UPSERT ACTIVE CONFETTI
    // ─────────────────────────────
    const trigger =
      typeof triggerEvent === "string"
        ? triggerEvent
        : triggerEvent?.event || "page_load";

    const record = await prisma.confettiConfig.upsert({
      where: { id: confettiId },
      update: {
        config,
        triggerEvent: trigger,
        active: true,
      },
      create: {
        id: confettiId,
        config,
        triggerEvent: trigger,
        active: true,
        shopId: shop.id,
        shopDomain,
      },
    });

    // ─────────────────────────────
    // 7️⃣ WRITE METAFIELDS (THEME EXTENSION USES THIS)
    // ─────────────────────────────
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

    const metafieldJson = await metafieldRes.json();
    const errors = metafieldJson?.data?.metafieldsSet?.userErrors || [];

    if (errors.length) {
      throw new Error(errors.map((e) => e.message).join(", "));
    }

    // ─────────────────────────────
    // ✅ SUCCESS
    // ─────────────────────────────
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Activate failed:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500 }
    );
  }
};
