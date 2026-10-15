import type { StorybookConfig } from "@storybook-astro/framework";

const config: StorybookConfig = {
  stories: ["../src/components/public/**/*.stories.ts"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook-astro/framework",
    options: {},
  },
};

export default config;
