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
    image: { src: "/images/suzuki-carry-sunset-1400.jpg", alt: "A white Suzuki Carry kei truck at sunset" },
    linkLabel: "Personal Import Service",
    linkHref: "/personal-import",
  },
};

export const TextOnly = {
  args: { heading, body },
};
