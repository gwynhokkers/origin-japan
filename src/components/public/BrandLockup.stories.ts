import BrandLockup from "./BrandLockup.astro";

export default {
  title: "Public/Atoms/Brand lockup",
  component: BrandLockup,
  parameters: { layout: "centered" },
};

export const Default = { args: { class: "h-16" } };
