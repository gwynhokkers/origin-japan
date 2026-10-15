import tailwindcss from "@tailwindcss/vite";
import { getViteConfig } from "astro/config";

export default getViteConfig(
  {
    plugins: [tailwindcss()],
    test: {
      include: ["tests/**/*.test.ts"],
      environment: "node",
    },
  },
  { configFile: false },
);
