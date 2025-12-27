import { unauthenticated } from "../shopify.server";

export const runtime = "nodejs";

import { unauthenticated } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { shop, topic } = await unauthenticated.webhook(request);

    console.log(`[COMPLIANCE] ${topic} for ${shop}`);

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("Webhook auth/HMAC failed (compliance)", err);
    return new Response("Unauthorized", { status: 401 });
  }
};
