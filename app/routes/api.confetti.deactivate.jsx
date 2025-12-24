import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { confettiId } = await request.json();

    const shopDomain = session.shop;

    // -------------------------------
    // Mark inactive in DB
    // -------------------------------
    await prisma.confettiConfig.updateMany({
      where: { id: confettiId, shopDomain },
      data: { active: false },
    });

    // -------------------------------
    // Get Shopify Shop GID (FIXED)
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
    // Clear metafields (EMPTY STRING JSON)
    // -------------------------------
    const response = await admin.graphql(
  `
  mutation ClearConfettiMetafields(
    $shopId: ID!,
    $emptyConfig: String!
  ) {
    metafieldsSet(metafields: [
      {
        ownerId: $shopId
        namespace: "confetti_maker"
        key: "active_config"
        type: "json"
        value: $emptyConfig
      },
      {
        ownerId: $shopId
        namespace: "confetti_maker"
        key: "trigger_event"
        type: "single_line_text_field"
        value: "none"
      }
    ]) {
      userErrors { field message }
    }
  }
  `,
  {
    variables: {
      shopId: shopGid,
      emptyConfig: "{}",
    },
  }
);


    const result = await response.json();
    const errors = result.data?.metafieldsSet?.userErrors || [];

    if (errors.length) {
      console.error(errors);
      return new Response(JSON.stringify({ ok: false, errors }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Deactivate failed:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500 }
    );
  }
};
