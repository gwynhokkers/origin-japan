import SiteHeader from "./SiteHeader.astro";

export default {
  title: "Public/Site header",
  component: SiteHeader,
};

export const Stock = {
  args: { currentPath: "/showroom" },
};
