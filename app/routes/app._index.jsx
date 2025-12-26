// app/routes/app._index.jsx
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

import ConfettiApp from "../src/components/ConfettiApp";
import { ShopProvider } from "../src/context/ShopContext";

export default function AppIndex() {
  return (
    <PolarisProvider i18n={{}}>
      <ShopProvider>
        <ConfettiApp />
      </ShopProvider>
    </PolarisProvider>
  );
}
