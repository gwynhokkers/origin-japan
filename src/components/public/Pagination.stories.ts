import Pagination from "./Pagination.astro";

export default {
  title: "Public/Atoms/Pagination",
  component: Pagination,
  parameters: { layout: "centered" },
};

export const FirstPage = { args: { base: "/stock", page: 1, pages: 5 } };

export const MiddlePage = { args: { base: "/stock", page: 3, pages: 5 } };

export const LastPage = { args: { base: "/stock", page: 5, pages: 5 } };

export const ManyPages = { args: { base: "/stock", page: 6, pages: 12 } };
