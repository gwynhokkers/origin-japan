import Pagination from "./Pagination.astro";

export default {
  title: "Public/Atoms/Pagination",
  component: Pagination,
  parameters: { layout: "centered" },
};

export const FirstPage = { args: { base: "/showroom", page: 1, pages: 5 } };

export const MiddlePage = { args: { base: "/showroom", page: 3, pages: 5 } };

export const LastPage = { args: { base: "/showroom", page: 5, pages: 5 } };

export const ManyPages = { args: { base: "/showroom", page: 6, pages: 12 } };
