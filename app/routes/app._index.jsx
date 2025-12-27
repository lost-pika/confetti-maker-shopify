// app/routes/app._index.jsx
import { json, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const activeItem = await prisma.confettiConfig.findFirst({
    where: {
      shopDomain: session.shop,
      active: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return json({
    activeItems: activeItem ? [activeItem] : [],
  });
};


export default function AppIndex() {
  const { activeItems } = useLoaderData();

  return (
    <ShopProvider>
      <ConfettiApp initialActiveItems={activeItems} />
    </ShopProvider>
  );
}
