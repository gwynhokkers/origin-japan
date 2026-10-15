# Storybook coverage for public components

## Goal

Every public UI component has a Storybook story beside it. Buttons appear as their own story of the existing `.btn` and `.btn-ghost` classes. Pages keep using those classes. No new button component is introduced into the site.

## Current state

Storybook loads `src/components/public/**/*.stories.ts`. Three stories exist: site header, stock card, and vehicle enquiry. Their titles stay as they are.

The other components in `src/components/public` have no stories. Buttons are CSS classes in `src/styles/public.css`.

## Story files

One `*.stories.ts` file sits next to each component. Each story passes that component’s real props as `args`. Sample copy, photo URLs, and vehicles live in that file. Stories do not call the catalogue, the brochure loader, or the network.

Preview stays fullscreen. Button and atom stories set `parameters.layout` to `centered`. Section stories inherit fullscreen.

Empty renders are omitted. A gallery or photo list with no photos is not a story.

### Buttons

`src/components/public/Buttons.astro` exists only so Storybook can render the classes. No page imports it.

It takes `variant: "solid" | "ghost"` and renders one link and one button with `.btn` or `.btn-ghost`.

| Title | Stories |
| --- | --- |
| Public/Buttons | Solid, Ghost |

### Atoms

| File | Title | Stories |
| --- | --- | --- |
| `Badge.stories.ts` | Public/Atoms/Badge | Default |
| `BrandLockup.stories.ts` | Public/Atoms/Brand lockup | Carbon (`tone: "carbon"`), Ground (`tone: "ground"`) |
| `Pagination.stories.ts` | Public/Atoms/Pagination | First page (`page: 1`, `pages: 5`), Middle page (`page: 3`, `pages: 5`), Last page (`page: 5`, `pages: 5`), Many pages (`page: 6`, `pages: 12`, which shows a gap). All use `base: "/stock"`. |
| `SortControls.stories.ts` | Public/Atoms/Sort controls | Unsorted (`base: "/stock"`, no `current`), A sort selected (`current` set to one stock sort) |
| `SiteFooter.stories.ts` | Public/Atoms/Site footer | Default |

### Sections

| File | Title | Stories |
| --- | --- | --- |
| `PageBanner.stories.ts` | Public/Sections/Page banner | Home, Import, Grades, Contact |
| `CopyBlocks.stories.ts` | Public/Sections/Copy blocks | Heading and paragraph |
| `Reviews.stories.ts` | Public/Sections/Reviews | Two reviews |
| `VehicleGallery.stories.ts` | Public/Sections/Vehicle gallery | Several photos, One photo |
| `brochure/Opening.stories.ts` | Public/Sections/Opening | Home (`page: "home"`), Interior page (`page: "personal-import"`, body, no link), With link (`page: "personal-import"`, `linkLabel` set, `linkHref: "/stock"`) |
| `brochure/Feature.stories.ts` | Public/Sections/Feature | With image, Text only |
| `brochure/SectionGroup.stories.ts` | Public/Sections/Section group | Home columns (`page: "home"`), Document page (`page: "grade-sheets"`) |
| `brochure/GradeExhibit.stories.ts` | Public/Sections/Grade exhibit | Default caption (omit `caption`), Custom caption |
| `brochure/ContactDetails.stories.ts` | Public/Sections/Contact details | Default |
| `brochure/ImportPhotos.stories.ts` | Public/Sections/Import photos | Several photos |
| `brochure/StockPreview.stories.ts` | Public/Sections/Stock preview | In stock, with its own Levorg-shaped vehicle |
| `brochure/Brochure.stories.ts` | Public/Sections/Brochure | Home |

The Home brochure story passes `page: "home"`, a title, and blocks for an opening, a section, a feature, stock, and reviews. It also passes one Levorg-shaped vehicle, two reviews, a Google reviews URL, and `photos: []`.

## Error handling

These components have no error view. Stories do not add one.

## Testing

No new Vitest files. The existing site header, stock card, and vehicle enquiry tests stay unchanged. A story is checked by opening it in Storybook.

## Out of scope

- Extracting a `Button` component used by pages
- Retitling the three existing stories
- Stories for empty lists that render nothing
- Changing Storybook config, preview CSS, or page markup
