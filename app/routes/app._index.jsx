import React, { useEffect, useState } from "react";
import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";

export default function AppIndex() {
  const [shop, setShop] = useState(null);

  // Fetch shop domain from API (server-side)
  useEffect(() => {
    fetch("/api/shop-domain")
      .then((r) => r.json())
      .then((data) => setShop(data.shop))
      .catch((err) => console.error(err));
  }, []);

  // Build deep link for theme editor
  const deepLink = shop
    ? `https://admin.shopify.com/store/${shop}/themes/current/editor?context=apps&activateAppBlockId=confetti_maker/confetti-launcher`
    : null;

  return (
    <ShopProvider>
      <div className="p-6 max-w-5xl mx-auto">

        {/* ⭐⭐ INLINE SETUP BANNER (NO EXTRA FILE) ⭐⭐ */}
        {shop && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow mb-8">
            <h2 className="text-xl font-bold text-slate-900">
              Install Confetti Launcher in your Theme
            </h2>

            <p className="text-slate-600 text-sm mt-2">
              To display confetti on your storefront, you must add and enable the
              <strong> Confetti Launcher App Block</strong> in your theme.
            </p>

            <ol className="list-decimal list-inside text-slate-700 text-sm mt-4 space-y-1">
              <li>Open your theme editor</li>
              <li>Click <strong>Add app block</strong></li>
              <li>Select <strong>Confetti Launcher</strong></li>
              <li>Enable it, then click <strong>Save</strong></li>
              <li>Refresh your storefront to view confetti</li>
            </ol>

            <a
              href={deepLink}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow"
            >
              Open Theme Editor
            </a>
          </div>
        )}

        {/* MAIN APP */}
        <ConfettiApp />
      </div>
    </ShopProvider>
  );
}
