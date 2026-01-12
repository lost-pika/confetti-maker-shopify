import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  const shop = session.shop;

  // fetch main theme
  const themes = await admin.rest.resources.Theme.all({ session });
  const main = themes.data.find((t) => t.role === "main");

  return Response.json({
    shop,
    themeId: main.id,
  });
}
