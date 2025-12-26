import { AppProvider as PolarisProvider } from "@shopify/polaris";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import "@shopify/polaris/build/esm/styles.css";

import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";

export default function AppIndex() {
  const params = new URLSearchParams(window.location.search);

  const appBridgeConfig = {
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
    host: params.get("host"),
    forceRedirect: true,
  };

  // 🔴 Without host → Shopify WILL show blank screen
  if (!appBridgeConfig.host) {
    return null;
  }

  return (
    <AppBridgeProvider config={appBridgeConfig}>
      <PolarisProvider i18n={{}}>
        <ShopProvider>
          <ConfettiApp />
        </ShopProvider>
      </PolarisProvider>
    </AppBridgeProvider>
  );
}
