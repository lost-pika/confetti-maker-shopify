import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  // 🔴 ONLY ACTIVE ITEMS
  const activeItems = await prisma.confettiConfig.findMany({
    where: {
      shopDomain: session.shop,
      active: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return json({ activeItems });
};

export default function AppIndex() {
  const { activeItems } = useLoaderData();

  return (
    <ShopProvider>
      <ConfettiApp initialActiveItems={activeItems} />
    </ShopProvider>
  );
}
