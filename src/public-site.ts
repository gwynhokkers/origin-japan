import type { Catalogue } from "./catalogue";

const homePage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Origin Japan</title>
  </head>
  <body>
    <h1>Origin Japan</h1>
  </body>
</html>
`;

export async function requestPublicPage(request: Request, catalogue: Catalogue): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (pathname !== "/") {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  await catalogue.vehicles();
  await catalogue.leads();

  return new Response(homePage, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
