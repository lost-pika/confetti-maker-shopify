import { useLoaderData } from "react-router";
import { json } from "react-router";

import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";

/**
 * ⚠️ TEMP SAFE LOADER
 * No auth
 * No prisma
 * No crash possible
 */
export const loader = async () => {
  return json({
    activeItems: [],
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
