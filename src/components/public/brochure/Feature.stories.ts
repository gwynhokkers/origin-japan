import Feature from "./Feature.astro";

const heading = "Personal imports";
const body = "We bid at the Japanese auctions for you.";

export default {
  title: "Public/Sections/Feature",
  component: Feature,
};

export const WithImage = {
  args: {
    heading,
    body,
    image: { src: "/images/home-dusk-row-2000.jpg", alt: "A row of imported cars at dusk" },
    linkLabel: "Personal Import Service",
    linkHref: "/personal-import",
  },
};

export const TextOnly = {
  args: { heading, body },
};
