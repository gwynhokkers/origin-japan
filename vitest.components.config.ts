import { createRequire } from "node:module";
import tailwindcss from "@tailwindcss/vite";
import { getViteConfig } from "astro/config";

const require = createRequire(import.meta.url);

/**
 * Public-component tests only. `configFile: false` keeps Cloudflare, EmDash,
 * and their wasm bindings out of this runner. The alias sends `jsonc-parser`
 * to its CommonJS build so Node never loads the extensionless ESM entry.
 */
export default getViteConfig(
  {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "jsonc-parser": require.resolve("jsonc-parser"),
      },
    },
    test: {
      environment: "node",
      include: ["src/components/public/**/*.test.ts"],
    },
  },
  { configFile: false },
);
