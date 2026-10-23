import type { NavLink, SiteNavigation } from "../catalogue";

export const primaryNav: readonly NavLink[] = [
  { href: "/showroom", label: "Showroom" },
  { href: "/personal-import", label: "Personal Import Service" },
  { href: "/grade-sheets", label: "Grade Sheets" },
  { href: "/contact", label: "Contact" },
  { href: "/sold", label: "Sold Stock" },
];

export const footerNav: readonly NavLink[] = [
  { href: "/sold", label: "Sold Stock" },
  { href: "/privacy", label: "Privacy" },
];

export function siteNavigation(site: SiteNavigation): { primary: readonly NavLink[]; footer: readonly NavLink[] } {
  return { primary: site.primary ?? primaryNav, footer: site.footer ?? footerNav };
}

export function isCurrent(link: NavLink, path: string | undefined): boolean {
  if (!path || !link.href.startsWith("/")) return false;
  const trim = (value: string) => value.replace(/\/+$/, "") || "/";
  return trim(link.href.split(/[?#]/)[0] ?? "") === trim(path);
}

export function linkRel(link: NavLink): string | undefined {
  return link.target === "_blank" ? "noopener noreferrer" : undefined;
}
