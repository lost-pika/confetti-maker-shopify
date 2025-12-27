import { json, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";

/**
 * Loader runs EVERY time app opens
 * DB is the source of truth
 */
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const items = await prisma.confettiConfig.findMany({
    where: { shopDomain: session.shop },
    orderBy: { updatedAt: "desc" },
  });

  return json({ items });
};

export default function AppIndex() {
  const { items } = useLoaderData();

  return (
    <ShopProvider>
      <ConfettiApp initialItems={items} />
    </ShopProvider>
  );
}
