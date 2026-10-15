import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { Window } from "happy-dom";

type StoryArgs = {
  args?: Record<string, unknown>;
};

let container: Promise<AstroContainer> | undefined;

/** Renders a story's component and args. The site adapter is not loaded. */
export async function renderPublicStory(component: unknown, story: StoryArgs) {
  container ??= AstroContainer.create();
  const html = await (await container).renderToString(
    component as Parameters<AstroContainer["renderToString"]>[0],
    { props: story.args ?? {} },
  );
  const window = new Window();
  window.document.body.innerHTML = html;
  globalThis.document = window.document as unknown as Document;
}
