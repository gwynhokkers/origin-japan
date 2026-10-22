# Public pages are Astro components

Buyer-facing pages are Astro pages and components. Styling uses Tailwind where a utility covers it, and ordinary CSS where Tailwind has no utility by default. The look from the tightened public pages stays: a dark ground, Syncopate and Poppins, and `#F29559` as the only accent. Storybook, through the Astro framework at storybook-astro.org, is the workshop for those public components and can test a component on its own. The EmDash admin stays React and stays out of Storybook. A buyer test still requests a page or submits a form and asserts what the buyer sees. A story does not replace that test. Storybook runs for the developer and is not a public page.

**Amended 22 Oct 2026:** the site first had a light ground with a system dark mode and a theme toggle. Adam chose dark only on 21 Oct 2026 (INK-298), so the light theme and the toggle were removed.
