import Badge from "./Badge.astro";

export default {
  title: "Public/Atoms/Badge",
  component: Badge,
  parameters: { layout: "centered" },
};

export const Default = { args: { label: "Sold" } };
