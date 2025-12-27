import { json } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);

    const items = await prisma.confettiConfig.findMany({
      where: { shopDomain: session.shop },
      orderBy: { updatedAt: "desc" },
    });

    return json({ items });
  } catch (err) {
    console.error("🔥 Loader crash:", err);

    // IMPORTANT: NEVER crash the app
    return json({ items: [] });
  }
};

export default function AppIndex() {
  return (
    <ShopProvider>
      <ConfettiApp />
    </ShopProvider>
  );
}
