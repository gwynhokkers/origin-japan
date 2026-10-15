import CopyBlocks from "./CopyBlocks.astro";

export default {
  title: "Public/Sections/Copy blocks",
  component: CopyBlocks,
};

export const HeadingAndParagraph = {
  args: {
    blocks: [
      { kind: "heading", text: "How buying works" },
      { kind: "paragraph", text: "We find the car in Japan, then ship it to Newport." },
    ],
  },
};
