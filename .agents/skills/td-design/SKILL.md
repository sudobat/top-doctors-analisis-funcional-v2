---
name: td-design
description: Use this skill to generate well-branded interfaces and assets for Top Doctors (the doctor-facing backoffice and related medical-SaaS surfaces), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. The `colors_and_type.css` file is the source of truth for design tokens — import it. The `ui_kits/backoffice/` folder contains JSX components you can copy into a new HTML page.

If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Brand color**: cyan `#1abadf` with darker accent `#009ee2` and lighter end `#2ccdde`. Sidebar uses left-to-right gradient across all three.
- **Voice**: Spanish, formal *usted*, addresses the doctor ("Estimado doctor"), instructional and clinical.
- **Layout**: 60px fixed cyan-gradient sidebar; off-white workspace `#f2f6f8`; white cards with hairline borders + soft shadow; centered page title in header band.
- **Type**: Open Sans (substituted — confirm real font with user).
- **Icons**: outline, ~1.5px stroke, white on sidebar. Lucide-style substitutes used in the kit.

See README.md for everything else.
