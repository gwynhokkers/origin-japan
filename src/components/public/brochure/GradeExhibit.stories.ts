import GradeExhibit from "./GradeExhibit.astro";

export default {
  title: "Public/Sections/Grade exhibit",
  component: GradeExhibit,
};

export const DefaultCaption = {};

export const CustomCaption = {
  args: { caption: "A custom caption for the Volvo V70 exhibit sheet." },
};
