export type NavPage = "stock" | "personal-import" | "grade-sheets" | "contact" | "sold";

export const navItems: readonly { href: string; label: string; page: NavPage }[] = [
  { href: "/stock", label: "Current Stock", page: "stock" },
  { href: "/personal-import", label: "Personal Import Service", page: "personal-import" },
  { href: "/grade-sheets", label: "Grade Sheets", page: "grade-sheets" },
  { href: "/contact", label: "Contact", page: "contact" },
  { href: "/sold", label: "Sold Stock", page: "sold" },
];
