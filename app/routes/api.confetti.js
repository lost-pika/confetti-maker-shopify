import { authenticate } from "../shopify.server";
import prisma from "../db.server";

/**
 * GET /api/confetti?shop=example.myshopify.com
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return new Response(JSON.stringify({ error: "Shop required" }), {
      status: 400,
    });
  }

  const activeConfigs = await prisma.confettiConfig.findMany({
    where: {
      shopDomain: shop,
      active: true,
    },
  });

  return new Response(
    JSON.stringify({
      success: true,
      data: activeConfigs,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};


/**
 * POST /api/confetti
 * body: { action: "activate" | "deactivate", ... }
 */
export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const body = await request.json();

  const { action, confettiId, config, triggerEvent } = body;

  // =====================================================
  // ACTIVATE
  // =====================================================
  if (action === "activate") {
    const trigger = triggerEvent.event;
    const date = triggerEvent.date || null;

    // STEP 1: find or create shop
    let shop = await prisma.shop.findUnique({
      where: { shopifyShopId: session.shop },
    });

    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          name: session.shop,
          shopifyShopId: session.shop,
          accessToken: session.accessToken,
        },
      });
    }

    // STEP 2: create or update confetti config
    let record = await prisma.confettiConfig.findUnique({
      where: { id: confettiId },
    });

    if (!record) {
      record = await prisma.confettiConfig.create({
        data: {
          id: confettiId,
          shopDomain: session.shop,
          shopId: shop.id,
          title: config.title,
          type: config.type,
          config,
          triggerEvent,
          active: true,
        },
      });
    } else {
      record = await prisma.confettiConfig.update({
        where: { id: confettiId },
        data: {
          active: true,
          config,
          triggerEvent,
        },
      });
    }

    // STEP 3: get Shopify shop id
    const shopRes = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopRes.json();
    const shopId = shopJson.data.shop.id;

    // STEP 4: get existing metafield
    const existingRes = await admin.graphql(`
      query {
        shop {
          metafield(namespace: "confetti_maker", key: "active_configs") {
            value
          }
        }
      }
    `);

    const existingJson = await existingRes.json();

    let activeConfigs = [];

    if (existingJson.data.shop.metafield?.value) {
      activeConfigs = JSON.parse(existingJson.data.shop.metafield.value);
    }

    // STEP 5: remove existing config with same trigger
    activeConfigs = activeConfigs.filter((c) => c.trigger !== trigger);

    // STEP 6: add new config
    activeConfigs.push({
      config,
      trigger,
      date,
    });

    // STEP 7: save metafield
    await admin.graphql(
      `
      mutation SetConfetti($shopId: ID!, $configs: String!) {
        metafieldsSet(metafields: [
          {
            ownerId: $shopId
            namespace: "confetti_maker"
            key: "active_configs"
            type: "json"
            value: $configs
          }
        ]) {
          userErrors { message }
        }
      }
    `,
      {
        variables: {
          shopId,
          configs: JSON.stringify(activeConfigs),
        },
      },
    );

    return new Response(JSON.stringify({ success: true }));
  }

  // =====================================================
  // DEACTIVATE
  // =====================================================
  if (action === "deactivate") {
    await prisma.confettiConfig.updateMany({
      where: { id: confettiId },
      data: { active: false },
    });

    const shopRes = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopRes.json();
    const shopId = shopJson.data.shop.id;

    const existingRes = await admin.graphql(`
      query {
        shop {
          metafield(namespace: "confetti_maker", key: "active_configs") {
            value
          }
        }
      }
    `);

    const existingJson = await existingRes.json();

    let activeConfigs = [];

    if (existingJson.data.shop.metafield?.value) {
      activeConfigs = JSON.parse(existingJson.data.shop.metafield.value);
    }

    activeConfigs = activeConfigs.filter((c) => c.config.id !== confettiId);

    await admin.graphql(
      `
      mutation SetConfetti($shopId: ID!, $configs: String!) {
        metafieldsSet(metafields: [
          {
            ownerId: $shopId
            namespace: "confetti_maker"
            key: "active_configs"
            type: "json"
            value: $configs
          }
        ]) {
          userErrors { message }
        }
      }
    `,
      {
        variables: {
          shopId,
          configs: JSON.stringify(activeConfigs),
        },
      },
    );

    return new Response(JSON.stringify({ success: true }));
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
  });
};
