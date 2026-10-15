import SortControls from "./SortControls.astro";

export default {
  title: "Public/Atoms/Sort controls",
  component: SortControls,
  parameters: { layout: "centered" },
};

export const Unsorted = { args: { base: "/stock" } };

export const SortSelected = { args: { base: "/stock", current: "price" } };
