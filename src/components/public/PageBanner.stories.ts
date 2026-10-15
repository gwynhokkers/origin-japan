import PageBanner from "./PageBanner.astro";

export default {
  title: "Public/Sections/Page banner",
  component: PageBanner,
};

export const Home = { args: { name: "home", class: "aspect-[16/10] w-[40rem] max-w-full" } };

export const Import = { args: { name: "import", class: "aspect-[16/10] w-[40rem] max-w-full" } };

export const Grades = { args: { name: "grades", class: "aspect-[16/10] w-[40rem] max-w-full" } };

export const Contact = { args: { name: "contact", class: "aspect-[16/10] w-[40rem] max-w-full" } };
