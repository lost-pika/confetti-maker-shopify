import React, { createContext, useContext } from "react";

export const ShopContext = createContext({ shop: null });

export function ShopProvider({ children }) {
  // Later you can load real shop data; for now keep a dummy object
  const shop = { id: "demo-shop-id", domain: "example.myshopify.com" };

  return (
    <ShopContext.Provider value={{ shop }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  // Never throw here, so app does not crash if provider is missing
  const ctx = useContext(ShopContext);
  return ctx || { shop: null };
}
