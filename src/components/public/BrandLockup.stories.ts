import BrandLockup from "./BrandLockup.astro";

export default {
  title: "Public/Atoms/Brand lockup",
  component: BrandLockup,
  parameters: { layout: "centered" },
};

export const Carbon = { args: { tone: "carbon", class: "h-16" } };

export const Ground = { args: { tone: "ground", class: "h-16" } };
