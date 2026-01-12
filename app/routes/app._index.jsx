// app/routes/app._index.jsx
import ConfettiApp from "../src/components/ConfettiApp";
import { useEffect, useState } from "react";
import OnboardingInstructions from "../src/components/OnboardingInstructions";
import { ShopProvider } from "../src/context/ShopContext";

export default function AppIndex() {
  const [themeInfo, setThemeInfo] = useState(null);

  useEffect(() => {
    fetch("/api/theme-info")
      .then((r) => r.json())
      .then((data) => setThemeInfo(data));
  }, []);

  return (
    <ShopProvider>
      <ConfettiApp />

      <div className="max-w-4xl mx-auto mt-12">
        {themeInfo && (
          <OnboardingInstructions
            shop={themeInfo.shop}
            themeId={themeInfo.themeId}
          />
        )}
      </div>
    </ShopProvider>
  );
}