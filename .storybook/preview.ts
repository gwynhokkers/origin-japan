import "../src/styles/public.css";
import "./preview.css";

const scheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

function paintTheme(explicit: unknown) {
  if (typeof document === "undefined") return;
  const theme = explicit === "light" || explicit === "dark" ? explicit : scheme();
  document.documentElement.dataset.theme = theme;
}

let lockedTheme: "light" | "dark" | undefined;

if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!lockedTheme) paintTheme(undefined);
  });
}

const preview = {
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  globalTypes: {
    theme: {
      description: "Public site color scheme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      const selected = context.globals?.theme;
      lockedTheme = selected === "light" || selected === "dark" ? selected : undefined;
      paintTheme(lockedTheme);
      return story();
    },
  ],
};

export default preview;
