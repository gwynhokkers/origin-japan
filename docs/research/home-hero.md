# Home hero research

Research for the Origin Japan home hero (`src/components/public/brochure/Opening.astro`). Gathered 15 Oct 2026 from award listings, the live award-recognised sites (inspected in a browser, with media URLs, durations and file sizes read from the DOM and HTTP headers), and the stock libraries' own clip pages.

## Summary

**Recommendation: Option A, a full-bleed still of the dusk car row with a one-time slow "settle", a left-weighted scrim, and a thin carbon-fibre facts strip under it.**

- It is the pattern used by the most relevant award-recognised dealer site, Classic Ford Broncos (a single still photo hero, 277 KB at 2000px wide), and by Lucid's current home hero (full-bleed still, left-aligned serif headline, facts row, two CTAs). Sources: [classicfordbroncos.com](https://www.classicfordbroncos.com/), [lucidmotors.com](https://lucidmotors.com/).
- It uses a real photo of the kind of cars Origin Japan actually sells, which stock video cannot guarantee (see Pitfalls).
- It is CSS only, keeps LCP to one image, and needs no new assets.
- Video is a credible second phase, but only as a progressive enhancement over this same still, capped at about 2.5 MB. The old hero video is 24.5 MB and shows a daytime suburban road with cones (measured below).

| Rank | Option | One line |
| --- | --- | --- |
| 1 | A. Full-bleed still + settle + facts strip | Most tasteful per byte; reuses `home-dusk-row` |
| 2 | B. Refined split layout (keep carbon) | Smallest change; editorial label, bleed-off photo, scroll parallax |
| 3 | C. Crossfading real stills | Shows breadth (JDM, kei, estate) with four owned photos |
| 4 | D. Muted background video loop | Most atmospheric, most risk and bytes |

## 1. Reference sites

Each entry links the award listing and the live site. Hero details were read from the live page on 15 Oct 2026; note that some awards are for earlier versions of a site.

### Spyker Cars (Awwwards Honorable Mention, 12 Sep 2026)
- Award: [awwwards.com/sites/spyker-cars](https://www.awwwards.com/sites/spyker-cars), date from [awwwards.com/websites/cars](https://www.awwwards.com/websites/cars/). Live: [spykercars.com](https://www.spykercars.com/).
- Media: full-bleed muted looping video, 25 s, 1920 wide, streamed (blob source), `preload="metadata"`, WebP poster. Footage is a slow macro pass over the headlight and bodywork, not a driving shot.
- Type: tiny uppercase eyebrow ("The beginning of XXV") over a centred condensed uppercase Futura PT headline at 56px, weight 500.
- CTA: one white rectangular button with dark uppercase label, centred under the headline.
- Tasteful because: one idea, very slow camera, no text animation fireworks; the detail shot reads as craftsmanship rather than speed.

### 363 Car & Social Club (Awwwards Honorable Mention, 11 May 2026)
- Award: [awwwards.com/sites/363-car-social-club](https://www.awwwards.com/sites/363-car-social-club). Live: [363sudbury.com](https://363sudbury.com/).
- Media: full-bleed `autoplay loop muted playsinline` MP4, 10 s, 1920 wide, 4.08 MB, no poster. A dark car in a storage hall, heavily dimmed.
- Type: 13px letter-spaced uppercase eyebrow, then a large centred sans headline ("Where passion takes the wheel") and a two-line lede.
- CTA: no button in the hero; a bright lime bottom bar ("Explore") and an underlined "Member Login" text link. A small weather widget sits top right.
- Tasteful because: heavy grey scrim keeps the video as texture; one strong accent colour does the CTA work.

### Hispano Suiza (Awwwards Honorable Mention, 11 Nov 2024)
- Award: [awwwards.com/sites/hispano-suiza-cars](https://www.awwwards.com/sites/hispano-suiza-cars), date from [awwwards.com/websites/cars](https://www.awwwards.com/websites/cars/). Live: [hispanosuizacars.com](https://www.hispanosuizacars.com/).
- Media: four-slide video slider. Slide 1 is a 20.6 s clip of a car's rear lights at dusk; separate desktop (8.59 MB) and mobile (2.80 MB) files chosen by script from `data-desktop-src` / `data-mobile-src` attributes.
- Type: thin, widely tracked uppercase display serif ("The No Manifesto"), centred.
- CTA: red outlined pill ("Watch full video") and pagination dots.
- Tasteful because: near-black grade, one red accent shared by lights and UI. Gimmick risk: the slider and the 8.6 MB desktop file.

### Selected Car Group (Awwwards Honorable Mention, 11 Jun 2025)
- Award: [awwwards.com/sites/selected-car-group](https://www.awwwards.com/sites/selected-car-group); agency case study confirms the award: [checkmate.dk](https://checkmate.dk/en/cases/selected-car-group-case/). Live: [scgroup.dk](https://www.scgroup.dk/).
- Context: Danish group selling and leasing premium, classic and investment cars, so the closest business model to a dealer in this list.
- Media: stacked muted autoplay loops, one per brand (9 s, 12 s, 15 s), each about 4.9 MB despite "LOW-RES" in the filename, crossfading behind the text.
- Type: small uppercase eyebrow, then an 80px Freight Display serif headline ("Mærk mere") with a smaller rotating word beneath (Leasing, Race, and so on) that changes with the clip.
- CTA: none in the hero; navigation carries it.
- Tasteful because: serif type and documentary footage feel editorial. Weakness: bytes, and no CTA above the fold.

### Classic Ford Broncos (Awwwards Honorable Mention; CSS Nectar feature 2017)
- Award: [awwwards.com/sites/classic-ford-broncos](https://www.awwwards.com/sites/classic-ford-broncos), [cssnectar.com](https://cssnectar.com/css-gallery-inspiration/classic-ford-broncos/). Live: [classicfordbroncos.com](https://www.classicfordbroncos.com/). The live site is now a Shopify build (asset paths under `/cdn/shop/`), so it is likely a later version than the awarded one.
- Context: an independent restorer and seller, the nearest analogue to Origin Japan in scale and model.
- Media: a single still photo (`cfb-homepage-header.jpg`, 277 KB at 2000px), soft-focus foreground grass framing a blue Bronco on a coastal track. A video loop appears further down the page, not in the hero.
- Type: no text on the image at all (the `h1` is visually hidden). A centred serif heading "Life, Well-Driven" and short lede sit on white directly below the photo.
- CTA: "Buy Now" stock carousel immediately follows.
- Tasteful because: the photo does the work, there is nothing to read over the image, and stock is one scroll away. Weakness: an email capture modal pops over the hero on load.

### Lucid Motors (Awwwards Site of the Day, 10 Jul 2021)
- Award: [awwwards.com/sites/lucid-motors](https://www.awwwards.com/sites/lucid-motors). Live: [lucidmotors.com](https://lucidmotors.com/). The 2021 award predates the current hero.
- Media: full-bleed still photograph (no video element in the hero today), lifestyle shot of the car with people, darkened towards the bottom left.
- Type: left-aligned 64px Lucid Serif headline, weight 400, with a two-line lede.
- Layout: a facts row of three short stats separated by thin vertical rules, then two CTAs: solid white "View inventory" and outlined "Build & order".
- Tasteful because: a still, quiet serif, and useful facts in place of decoration. This is the most transferable pattern for a dealer.

### Rivian (Awwwards Site of the Day, 3 Dec 2018)
- Award: [awwwards.com/sites/rivian-automotive](https://www.awwwards.com/sites/rivian-automotive), date from [awwwards.com/websites/automotive](https://www.awwwards.com/websites/automotive/). Live: [rivian.com](https://rivian.com/). The current hero postdates the award.
- Media: muted autoplay loop, 34 s, 7.17 MB, shown inside a rounded portrait card in the centre, with oversized pale "R2" letters behind it.
- CTA: two pills at the bottom of the card ("Meet R2", amber "Get R2 updates").
- Relevance: the inset card with large type behind is a stylish way to frame a single photo, which maps onto Origin Japan's current framed image.

### Turah (Web Excellence Awards winner, Automotive Website)
- Award: [we-awards.com/winner/turah](https://we-awards.com/winner/turah/). Live: [turah.com](https://www.turah.com/).
- Context: classic Mercedes restorer and seller with an inventory page.
- Media: full-bleed muted loop, 29.6 s, 1280 wide, 10.0 MB, a slow macro of chrome bumper and tail lamp under dark grading.
- Tasteful because: detail footage of the product, slow, desaturated. Weakness: 10 MB for 1280px, plus cookie and newsletter overlays on arrival.

### Size check on what these heroes ship

| Site | Hero media | Bytes |
| --- | --- | --- |
| Classic Ford Broncos | JPEG still, 2000w | 277 KB |
| Hispano Suiza (mobile) | MP4 | 2.80 MB |
| 363 Car & Social Club | MP4, 10 s | 4.08 MB |
| Selected Car Group | MP4, 9 s, one of three | 4.86 MB |
| Rivian | MP4, 34 s | 7.17 MB |
| Hispano Suiza (desktop) | MP4, 20.6 s | 8.59 MB |
| Turah | MP4, 29.6 s, 1280w | 10.0 MB |
| Old Origin Japan hero | MP4, 1080p60 | 24.5 MB |

Sizes are `Content-Length` values from the media URLs listed above; the old hero is [17433879-hd_1920_1080_60fps.mp4](https://originjapan.co.uk/wp-content/uploads/2024/10/17433879-hd_1920_1080_60fps.mp4).

## 2. Patterns and ranked options

### Recurring tasteful patterns
- **One slow subject, darkened.** Spyker, Hispano Suiza and Turah all use slow detail footage under a dark grade rather than fast driving. Sources: [spykercars.com](https://www.spykercars.com/), [hispanosuizacars.com](https://www.hispanosuizacars.com/), [turah.com](https://www.turah.com/).
- **Small tracked eyebrow, then one big line.** Spyker, 363 and Selected Car Group all put a tiny uppercase label above the headline. Sources: [spykercars.com](https://www.spykercars.com/), [363sudbury.com](https://363sudbury.com/), [scgroup.dk](https://www.scgroup.dk/).
- **A still can be the whole hero.** Classic Ford Broncos and Lucid both lead with a photograph, not video. Sources: [classicfordbroncos.com](https://www.classicfordbroncos.com/), [lucidmotors.com](https://lucidmotors.com/).
- **Facts instead of decoration.** Lucid's stat row under the headline. Source: [lucidmotors.com](https://lucidmotors.com/).
- **One CTA, high contrast.** Spyker (single white button), 363 (single lime bar). Sources as above.
- **Gimmicks to avoid:** sliders with dots (Hispano Suiza), multi-megabyte loops, and modals over the hero (Classic Ford Broncos, Turah).

### Option A (recommended): full-bleed still, one-time settle, facts strip
**Looks like:** `home-dusk-row` fills the hero edge to edge, cropped so the cars sit lower right and the dusk sky sits upper left. A left-to-right and bottom-to-top dark scrim. Text bottom left: a small Syncopate uppercase eyebrow (for example "Japanese imports, Newport"), the existing Poppins headline, one-line lede, the orange "Current Stock" button plus a quiet text link ("How importing works"). On load the photo scales from 1.06 to 1.0 over about 2.4 s, once. Below the photo, a slim `carbon-band` strip carries three facts in Lucid's style (for example "Hand-picked at Japanese auction", "Grade sheets translated", "UK registered and ready"), which keeps the carbon material without making it the whole hero.

**Assets:** existing `home-dusk-row-1000.jpg` (174 KB) and `home-dusk-row-2000.jpg` (491 KB). Re-export as AVIF or WebP to cut bytes. Images in `public/` are never optimised by Astro, so either pre-encode them or move the source into `src/` and use `<Picture>` ([docs.astro.build](https://docs.astro.build/en/guides/images/)).

**Implementation:** render the photo as an `<img>` (not a CSS background) so it is discoverable early; web.dev lists "the LCP element requires a CSS background image" as a cause of late discovery ([web.dev/articles/optimize-lcp](https://web.dev/articles/optimize-lcp)). Add `fetchpriority="high"` ([web.dev/articles/fetch-priority](https://web.dev/articles/fetch-priority)). `PageBanner.astro` currently renders a `div` with a CSS background, so the home hero would need its own `img`.

```astro
<section class="home-hero" aria-labelledby="home-title">
  <picture>
    <source type="image/avif" srcset="/images/home-dusk-row-1000.avif 1000w, /images/home-dusk-row-2000.avif 2000w" sizes="100vw" />
    <img class="home-hero-media" src="/images/home-dusk-row-2000.jpg"
      srcset="/images/home-dusk-row-1000.jpg 1000w, /images/home-dusk-row-2000.jpg 2000w" sizes="100vw"
      width="2000" height="1500" alt="" fetchpriority="high" />
  </picture>
  <div class="home-hero-copy"><!-- eyebrow, h1, lede, CTA --></div>
</section>
```

```css
.home-hero { position: relative; isolation: isolate; overflow: hidden; display: grid; align-items: end; min-height: min(86svh, 52rem); }
.home-hero-media { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; object-position: 68% 62%; }
.home-hero::after { content: ""; position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(90deg, rgb(8 10 12 / 0.78), rgb(8 10 12 / 0.3) 50%, transparent 78%),
              linear-gradient(0deg, rgb(8 10 12 / 0.7), transparent 45%); }
@media (prefers-reduced-motion: no-preference) {
  .home-hero-media { animation: hero-settle 2.4s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
}
@keyframes hero-settle { from { transform: scale(1.06); } }
```

Animate `transform` only. Do not fade the photo in from `opacity: 0`, because web.dev states that elements with an opacity of 0 are not LCP candidates ([web.dev/articles/lcp](https://web.dev/articles/lcp)).

**Performance:** one image request; roughly 120 to 250 KB for a 2000w AVIF or WebP (the JPEG is 491 KB today). No JavaScript.
**Reduced motion:** the `@media (prefers-reduced-motion: no-preference)` guard means the photo simply appears ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)).
**Over-the-top risk:** low. The one thing to tune is scrim strength so the headline passes 4.5:1 (3:1 for large text) against the brightest part of the sky ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).

### Option B: refined split layout on carbon
**Looks like:** today's layout, made more editorial. The photo grows and bleeds off the right edge of the viewport instead of sitting in a ring frame; a small museum-style caption plate sits on its lower edge ("Skyline R32 and R34, Supra. Japan, dusk."); a Syncopate eyebrow above the headline; optionally oversized, very low-contrast "ORIGIN" lettering in Syncopate behind the photo, after Rivian's large "R2" behind its inset card ([rivian.com](https://rivian.com/)). A gentle parallax as the user scrolls.

**Assets:** existing photos only.
**Implementation:** CSS grid change in `Opening.astro`; parallax via a scroll-driven animation (`animation-timeline: view()`), which is CSS only and simply does nothing where unsupported ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline/view), [caniuse](https://caniuse.com/mdn-css_properties_animation-timeline_view)). Wrap it in the same reduced-motion query.
**Performance:** same as today (one image, plus the carbon texture), no JavaScript.
**Reduced motion:** no parallax; static layout.
**Over-the-top risk:** low. Lowest effort, but the least change in feel.

### Option C: crossfading real stills
**Looks like:** Option A's layout, but the background slowly crossfades between four owned photos: dusk row, Skylines at Fuji, AE86, and the Suzuki Carry at sunset. That shows the range (sports cars and kei) honestly. Selected Car Group's rotating word under the headline is a nice optional touch if each photo gets a one-word label ([scgroup.dk](https://www.scgroup.dk/)).

**Assets:** `home-dusk-row`, `import-skylines-fuji`, `grade-trueno`, `suzuki-carry-sunset` (all in `public/images/`).
**Implementation:** stack four `<img>` elements; the first is the LCP image with `fetchpriority="high"`, the rest get `fetchpriority="low"`. A single CSS keyframe cycles opacity over about 28 s (7 s per photo, 1.2 s fades). The first image must stay at `opacity: 1` at time zero so it remains the LCP candidate ([web.dev/articles/lcp](https://web.dev/articles/lcp)).
**Accessibility:** automatically moving content that lasts more than five seconds needs a way to pause it ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)), so add a small pause button (a few lines of vanilla JS toggling `animation-play-state`).
**Performance:** about 4 images at 120 to 250 KB each in modern formats, so roughly 0.5 to 1 MB total, with only the first on the LCP path.
**Reduced motion:** show the first photo only.
**Over-the-top risk:** medium. With more than four slides, dots or arrows, it quickly reads as a 2012 carousel (compare Hispano Suiza's slider dots).

### Option D: muted background video over the same still
**Looks like:** Option A, but once the page is idle a short, dark, slow clip replaces the still. Footage references: Spyker's macro detail, Turah's chrome close-up ([spykercars.com](https://www.spykercars.com/), [turah.com](https://www.turah.com/)).

**Assets:** one stock clip from section 3, trimmed to 8 to 12 s, re-encoded without audio.
**Implementation:** keep the Option A `<img>` as the LCP element and visual fallback. A tiny script inserts the `<video>` only if `prefers-reduced-motion` is not set, Save-Data is off, and the viewport is wide enough; it pauses the video when the hero leaves the viewport with `IntersectionObserver` ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)). Use separate mobile and desktop files, as Hispano Suiza does (2.80 MB versus 8.59 MB, above). Provide a visible pause control ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).
**Performance:** target under about 2.5 MB desktop and under about 1 MB mobile. That is lighter than every award site measured above except Classic Ford Broncos, which uses a still.
**Reduced motion / Save-Data:** the still from Option A, no video request at all.
**Over-the-top risk:** medium to high. See Pitfalls; the main risk is footage of cars that are not Origin Japan's.

## 3. Video candidates

All pages below were opened in a browser on 15 Oct 2026 and returned HTTP 200 with the stated metadata (Pexels and Pixabay return 403 to plain `curl`, so they were checked through the browser). Durations, resolutions and frame rates come from each page's own metadata.

### The old hero, for comparison
- [Pexels 17433879, "A van driving on a road with cones in the middle"](https://www.pexels.com/video/a-van-driving-on-a-road-with-cones-in-the-middle-17433879/) by Huu Huynh. 33 s, 3840x2160. Pexels describes it as a highway in Okazaki, Japan. The thumbnail shows a daytime suburban road, traffic cones and a red Mazda SUV, which explains why it felt only so-so: nothing in it says sports car, import or enthusiast. The site served a 24.5 MB 1080p60 version.

### Candidates

| # | Clip | Licence | Length | Resolution / fps | Why it works | Watch out |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [Pexels 16815340, white sport compact in pouring rain](https://www.pexels.com/video/a-white-sport-compact-car-parked-in-the-pouring-rain-16815340/) by Erik Mclean | Pexels | 18 s | 3840x1608 (2.39:1), 24 fps | Japanese performance car (Pexels: "White Subaru STI") from behind, rain, wet reflections, very dark: lots of room for text, cinematic and calm | Shot outside Japan with a non-Japanese plate; crop 2.39:1 to 16:9 loses height |
| 2 | [Pexels 16815342, headlight close-up in the rain](https://www.pexels.com/video/close-up-view-of-a-car-with-lights-on-in-the-pouring-rain-16815342/) by Erik Mclean | Pexels | 11 s | 3840x1608, 24 fps | Same series. Macro detail in the Spyker and Turah style; abstract enough that it does not promise a specific car in stock | Visible aftermarket badge on the bumper; crop it out |
| 3 | [Pexels 18073204, "tokyo"](https://www.pexels.com/video/tokyo-18073204/) by Toshinori Nakamura | Pexels | 6 s | 3840x2160, 30 fps | Night timelapse of a Tokyo expressway beneath an overpass, blue and amber light: instantly reads as Shuto, without featuring a car you do not sell | Only 6 s, so check the loop seam; timelapse motion is busier than real time |
| 4 | [Pexels 29215133, night traffic in urban Japanese street](https://www.pexels.com/video/night-traffic-in-urban-japanese-street-29215133/) by Huu Huynh | Pexels | 82 s | 3840x2160, 59.94 fps | Static overhead shot of a Japanese road at night with kanji road markings; authentic, calm, and the dark upper half suits text | Ordinary traffic, not JDM; re-encode at 24 or 30 fps to save bytes |
| 5 | [Pexels 39419698, red sports car in rainy driveway](https://www.pexels.com/video/sleek-red-sports-car-in-rainy-driveway-39419698/) by Erik Mclean | Pexels | 13 s | 3840x2160, 24 fps | A Toyota 86 nose in the rain; the orange-red paint sits close to the site accent `#f29559` | The 86 was sold new in the UK, so it is not an import story; windscreen sticker text needs cropping |
| 6 | [Pixabay 213815, Tokyo bay at dusk](https://pixabay.com/videos/tokyo-capital-gulf-region-213815/) by Kanenori | Pixabay Content License | about 20 s | 3840x2160, 60 fps | Wide timelapse of Rainbow Bridge and the Tokyo skyline under a heavy dusk sky; sense of place, no cars to misrepresent | Pure location shot; reduce to 24 or 30 fps |

Also considered: [Mixkit 4451, quiet Tokyo street at night](https://mixkit.co/free-stock-video/quiet-tokyo-street-at-night-4451/) (22 s, 1920x1080, Mixkit Stock Video Free License): warm neon signage and pedestrians, good atmosphere, but it is about people rather than cars. Pexels portrait clips such as [36024207](https://www.pexels.com/video/night-drive-through-city-streets-in-urban-japan-36024207/) (2160x3840) are only usable as a mobile-only source.

**Pick:** clip 2 (headlight in rain) or clip 3 (Tokyo expressway) for Option D. Both are slow or abstract enough not to look like a car advert for a model Origin Japan may not have.

### Licence notes
- Pexels: free to use, attribution not required, but "Don't imply endorsement of your product by people or brands on the imagery" ([pexels.com/license](https://www.pexels.com/license/)).
- Pixabay: free, no attribution, but "If Content contains any recognisable trademarks, logos or brands, you cannot use that Content for commercial purposes in relation to goods and services" ([pixabay.com/service/license-summary](https://pixabay.com/service/license-summary/)). That matters for car footage on a car sales site, so prefer clips without legible badges.
- Mixkit: the Stock Video Free License allows commercial use ([mixkit.co/license/modal/videoFree](https://mixkit.co/license/modal/videoFree/)); third-party trademarks in an item may not be cleared ([mixkit.co/terms](https://mixkit.co/terms/)).
- Coverr was also searched for Tokyo and Japan; results were general travel scenes (sushi, subway, park) with no car footage ([coverr.co/stock-video-footage/tokyo](https://coverr.co/stock-video-footage/tokyo)).

### Background video best practice
- **Attributes:** `autoplay muted loop playsinline`. Chrome: "Muted autoplay is always allowed" ([developer.chrome.com/blog/autoplay](https://developer.chrome.com/blog/autoplay)). iOS Safari: muted video may autoplay, and on iPhone `playsinline` is required to avoid fullscreen ([webkit.org](https://webkit.org/blog/6784/new-video-policies-for-ios/)). Autoplay can still be refused, so handle the rejected `play()` promise and keep the still visible ([MDN autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)).
- **Poster and LCP:** for `<video>`, LCP uses "the poster image load time or first frame presentation time ... whichever is earlier" ([web.dev/articles/lcp](https://web.dev/articles/lcp)). Keep the poster small and identical to the first frame, or keep a real `<img>` as the hero and add the video later (Option D).
- **Formats:** offer WebM and MP4 sources, as web.dev recommends for looping background video ([web.dev/articles/replace-gifs-with-videos](https://web.dev/articles/replace-gifs-with-videos)). Strip the audio track.
- **Size:** aim for 8 to 12 s, 24 or 30 fps, 1920w desktop and 960 to 1280w mobile, under about 2.5 MB and 1 MB respectively. For context, the award sites above ship 2.8 to 10 MB (table in section 1).
- **Pause offscreen:** `IntersectionObserver` to pause when the hero scrolls away ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)).
- **Reduced motion:** do not load the video under `prefers-reduced-motion: reduce` ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)).
- **Save-Data:** skip video when `navigator.connection.saveData` is true; the API has limited availability, so treat absence as "unknown" and fall back to viewport rules ([MDN saveData](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData), [MDN Save-Data header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Save-Data)).
- **Pause control:** motion lasting more than five seconds alongside other content needs a pause mechanism ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## 4. Pitfalls

- **Cars you do not sell.** Stock footage shows whatever the videographer had: a Subaru in Canada, a UK-market Toyota 86 (candidates 1 and 5). On a dealer site visitors read the hero as "this is what we sell". Prefer abstract details or places (candidates 2, 3, 6), or the owner's own photos (Options A to C). Pexels also forbids implying endorsement by brands shown ([pexels.com/license](https://www.pexels.com/license/)).
- **Trademarks in commercial use.** Pixabay's licence specifically restricts commercial use of content with recognisable brands ([pixabay.com/service/license-summary](https://pixabay.com/service/license-summary/)). Badges and grilles are exactly that, so crop or choose badge-free clips.
- **Bytes.** The old 24.5 MB hero is roughly ten times the budget above and about fifty times the Classic Ford Broncos still. Mobile visitors on data pay for it.
- **Autoplay is not guaranteed.** Browser policy and user settings can block it ([MDN autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)), so the still must look finished on its own.
- **Contrast over moving footage.** A brief bright frame (headlights, a streetlamp passing) can drop text below 4.5:1 ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)). Use a fixed scrim strong enough for the brightest frame, as 363 does with its heavy grey overlay ([363sudbury.com](https://363sudbury.com/)).
- **Overlays on arrival.** Classic Ford Broncos and Turah both cover their heroes with email or cookie modals on load ([classicfordbroncos.com](https://www.classicfordbroncos.com/), [turah.com](https://www.turah.com/)), which wastes the hero. Keep any newsletter prompt out of the first screen.
- **Awards age.** Lucid (2021), Rivian (2018) and Classic Ford Broncos (2017 feature) were recognised for earlier versions of their sites; the descriptions above are of the live sites today ([awwwards.com/sites/lucid-motors](https://www.awwwards.com/sites/lucid-motors), [awwwards.com/sites/rivian-automotive](https://www.awwwards.com/sites/rivian-automotive), [cssnectar.com](https://cssnectar.com/css-gallery-inspiration/classic-ford-broncos/)).
