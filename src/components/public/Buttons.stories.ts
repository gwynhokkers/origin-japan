import Buttons from "./Buttons.astro";

export default {
  title: "Public/Buttons",
  component: Buttons,
  parameters: { layout: "centered" },
};

export const Solid = { args: { variant: "solid" } };

export const Ghost = { args: { variant: "ghost" } };
