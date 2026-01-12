import React, { useEffect, useState } from "react";
import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";
import ConfettiSetupBanner from "../src/components/ConfettiOnboarding";

export default function AppIndex() {
  const [shop, setShop] = useState(null);

  // Fetch shop domain from server at runtime
  useEffect(() => {
    fetch("/api/shop-domain")
      .then((r) => r.json())
      .then((data) => setShop(data.shop))
      .catch((e) => console.error("Failed to load shop domain:", e));
  }, []);

  return (
    <ShopProvider>
      <div className="p-6 max-w-5xl mx-auto">

        {/* Setup banner only after shop domain loads */}
        <ConfettiSetupBanner shop={shop} />

        <ConfettiApp />
      </div>
    </ShopProvider>
  );
}
