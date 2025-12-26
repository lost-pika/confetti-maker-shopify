import { AppProvider as PolarisProvider } from "@shopify/polaris";
import { AppBridgeProvider } from "@shopify/app-bridge-react";
import "@shopify/polaris/build/esm/styles.css";

import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";

export default function AppIndex() {
  const params = new URLSearchParams(window.location.search);

  const config = {
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
    host: params.get("host"),
    forceRedirect: true,
  };

  if (!config.host) return null;

  return (
    <AppBridgeProvider config={config}>
      <PolarisProvider i18n={{}}>
        <ShopProvider>
          <ConfettiApp />
        </ShopProvider>
      </PolarisProvider>
    </AppBridgeProvider>
  );
}
