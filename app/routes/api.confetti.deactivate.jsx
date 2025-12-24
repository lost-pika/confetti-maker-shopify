import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { confettiId } = await request.json();

    const shopDomain = session.shop;

    await prisma.confettiConfig.updateMany({
      where: { id: confettiId, shopDomain },
      data: { active: false },
    });

    const shopInfoRes = await admin.graphql(`{ shop { id } }`);
    const shopInfo = await shopInfoRes.json();
    const shopGid = shopInfo?.data?.shop?.id;
    if (!shopGid) throw new Error("Shop GID not found");

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
      { variables: { shopId: shopGid } }
    );

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Deactivate failed:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500 }
    );
  }
};
