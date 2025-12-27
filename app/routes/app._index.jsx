import { json } from "@react-router/node";
import { useLoaderData } from "react-router";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";

import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);

    if (!session?.shop) {
      return json({ activeItems: [] });
    }

    const activeItems = await prisma.confettiConfig.findMany({
      where: {
        shopDomain: session.shop,
        active: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return json({ activeItems });
  } catch (err) {
    // 🔥 CRITICAL: never crash on refresh
    console.error("[app._index] loader failed safely:", err);
    return json({ activeItems: [] });
  }
};

export default function AppIndex() {
  const { activeItems } = useLoaderData();

  return (
    <ShopProvider>
      <ConfettiApp initialActiveItems={activeItems} />
    </ShopProvider>
  );
}
