import Opening from "./Opening.astro";

const title = "Japanese cars, bought properly";
const body = "Cars already in the UK, and personal imports from Japan.";

export default {
  title: "Public/Sections/Opening",
  component: Opening,
};

export const Home = {
  args: { page: "home", title, body },
};

export const InteriorPage = {
  args: { page: "personal-import", title, body },
};

export const WithLink = {
  args: {
    page: "personal-import",
    title,
    body,
    linkLabel: "Current stock",
    linkHref: "/showroom",
  },
};
