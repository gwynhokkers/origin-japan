import { createRequire } from "node:module";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";

const require = createRequire(import.meta.url);
const jsoncParser = require.resolve("jsonc-parser");

export default defineConfig({
  output: "server",
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: "jsonc-parser-cjs",
        enforce: "pre",
        resolveId(id) {
          if (id === "jsonc-parser" || id.includes("jsonc-parser/lib/esm/")) {
            return jsoncParser;
          }
        },
      },
    ],
  },
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
    }),
  ],
  devToolbar: { enabled: false },
});
