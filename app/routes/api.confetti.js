import { authenticate } from "../shopify.server";
import prisma from "../db.server";

/**
 * GET /api/confetti?shop=example.myshopify.com
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return new Response(
      JSON.stringify({ error: "Shop parameter required" }),
      { status: 400 }
    );
  }

  const activeConfetti = await prisma.confettiConfig.findFirst({
    where: {
      shopDomain: shop,
      active: true,
    },
  });

  return new Response(
    JSON.stringify({ success: true, data: activeConfetti }),
    { headers: { "Content-Type": "application/json" } }
  );
};

/**
 * POST /api/confetti
 * body: { action: "activate" | "deactivate", ... }
 */
export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const body = await request.json();

  const { action } = body;

  // ─────────────────────────────
  // ACTIVATE
  // ─────────────────────────────
  if (action === "activate") {
    const { confettiId, config, triggerEvent } = body;

    await prisma.confettiConfig.update({
      where: { id: confettiId },
      data: { active: true },
    });

    const shopRes = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopRes.json();
    const shopId = shopJson.data.shop.id;

    await admin.graphql(
      `
      mutation SetConfetti($shopId: ID!, $config: String!, $trigger: String!) {
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
          shopId,
          config: JSON.stringify(config),
          trigger: triggerEvent,
        },
      }
    );

    return new Response(JSON.stringify({ success: true }));
  }

  // ─────────────────────────────
  // DEACTIVATE
  // ─────────────────────────────
  if (action === "deactivate") {
    const { confettiId } = body;

    await prisma.confettiConfig.update({
      where: { id: confettiId },
      data: { active: false },
    });

    const shopRes = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopRes.json();
    const shopId = shopJson.data.shop.id;

    await admin.graphql(
      `
      mutation ClearConfetti($shopId: ID!) {
        metafieldsSet(metafields: [
          {
            ownerId: $shopId
            namespace: "confetti_maker"
            key: "active_config"
            type: "json"
            value: "{}"
          },
          {
            ownerId: $shopId
            namespace: "confetti_maker"
            key: "trigger_event"
            type: "single_line_text_field"
            value: "none"
          }
        ]) {
          userErrors { message }
        }
      }
      `,
      { variables: { shopId } }
    );

    return new Response(JSON.stringify({ success: true }));
  }

  return new Response(
    JSON.stringify({ error: "Invalid action" }),
    { status: 400 }
  );
};
