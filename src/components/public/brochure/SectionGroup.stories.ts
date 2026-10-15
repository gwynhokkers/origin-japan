import SectionGroup from "./SectionGroup.astro";

const sections = [
  { heading: "Already in the UK", paragraphs: ["These cars are here and ready to view."] },
  { heading: "Personal imports", paragraphs: ["We bid at the Japanese auctions for you."] },
];

export default {
  title: "Public/Sections/Section group",
  component: SectionGroup,
};

export const HomeColumns = { args: { page: "home", sections } };

export const DocumentPage = { args: { page: "grade-sheets", sections } };
