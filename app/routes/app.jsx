// app/routes/app.jsx
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

export const loader = async ({ request }) => {
  console.log("🟢 APP LOADER HIT");

  const { authenticate } = await import("../shopify.server");
  const { session } = await authenticate.admin(request);

  console.log("🟢 SESSION SHOP:", session?.shop);

  return {
    apiKey: process.env.SHOPIFY_API_KEY,
    shop: session.shop,
  };
};

export default function App() {
  console.log("🔵 APP COMPONENT RENDERED");

  const { apiKey } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (args) => boundary.headers(args);
