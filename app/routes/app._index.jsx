import { useLoaderData } from "@remix-run/react";
import {prisma} from "../db.server"
import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";
import ConfettiSetupBanner from "../src/components/ConfettiOnboarding";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  // session.shop = "example.myshopify.com"
  const shop = session.shop;

  return { shop };
};

export default function AppIndex() {
  const { shop } = useLoaderData();

  return (
    <ShopProvider>
      <div className="p-6 max-w-5xl mx-auto">

        {/* ⭐ Always displayed onboarding + deep link */}
        <ConfettiSetupBanner shop={shop} />

        {/* Your full app */}
        <ConfettiApp />
      </div>
    </ShopProvider>
  );
}
