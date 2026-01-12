// app/routes/api/theme-info.jsx
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  // → retrieve shop
  const shop = session.shop;

  // → get current published theme
  const response = await admin.rest.resources.Theme.all({
    session,
  });

  const mainTheme = response.data.find((t) => t.role === "main");

  return Response.json({
    shop,
    themeId: mainTheme ? mainTheme.id : null,
  });
}
