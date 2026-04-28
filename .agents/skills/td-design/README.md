# Top Doctors Backoffice — Design System

A design system for the **Top Doctors** doctor-facing backoffice — a Spanish-language SaaS that medical professionals use to configure their clinics, services, schedules, and visibility on the Top Doctors marketplace.

## Sources

This system was reconstructed from six baseline screenshots provided by the user. **No codebase or Figma file was attached** — every token, component, and layout decision below was sampled or inferred from these PNGs:

| File | Surface |
|---|---|
| `uploads/services-01-estado-inicial.png` | Servicios — initial state, mixed enabled/disabled service rows |
| `uploads/services-02-filtro-busqueda-podologia.png` | Servicios — search filter applied (`podología`) |
| `uploads/services-03-desplegable-consultas.png` | Servicios — clinic-selector dropdown open (multi-tenant context) |
| `uploads/office-save-01-baseline.png` | Datos de la consulta — view (read-only) state with Editar CTA |
| `uploads/office-save-02-change-pre-save.png` | Datos de la consulta — edit state, color picker open |
| `uploads/office-save-03-after-save.png` | Datos de la consulta — saved state |

Re-attach a codebase or Figma URL for higher-fidelity recreations of components I had to reconstruct from pixels (icon set, exact spacing scale, hover/press states, focus rings).

## Product context

**Top Doctors** is a healthcare marketplace and SaaS suite. The screenshots are from the **doctor backoffice**: where individual practitioners (and their staff) manage:

- **Servicios** — the catalog of consultation types they offer (e.g. *Primera consulta Acupuntura*, *Consulta seguimiento Podología*). Each service can be toggled active/inactive, color-tagged per clinic, set to show/hide on the public Top Doctors profile, and configured for duration + price across channels (in-person, telemedicine).
- **Consultas / Despachos** — the clinics or practice locations themselves. *Datos de la consulta* is the form for editing one: name, color tag, address, phone, email, weekly schedule, accepted insurances, child-visit settings.
- **Multi-tenant**: a doctor can belong to multiple clinics ("Con agenda", "Consulta Antonio Wallet", "Ofimedic") and switch between them via a top-right selector. Specialty rows show colored dots indicating which clinics offer that service.

The voice of the product addresses the doctor directly with respectful Spanish ("Estimado doctor, en base a sus especialidades…"). It uses **usted** form throughout — formal, professional, clinical.

---

## Index

| File / folder | What it is |
|---|---|
| `README.md` | This file. Start here. |
| `SKILL.md` | Agent-Skills compatible entry-point. Read when invoked as a skill. |
| `colors_and_type.css` | All design tokens: colors, type scale, spacing, radii, shadows. Import this. |
| `preview/` | 15 small HTML cards rendered in the Design System tab — colors (brand / neutral / status), typography, spacing, radii, shadows, buttons, inputs, toggles, banners, service row, sidebar, header, dropdown — plus reference screenshots of the reconstructed screens. |
| `ui_kits/backoffice/` | The single product's UI kit. `index.html` is a click-thru prototype combining Servicios and Datos de la consulta. JSX files: `Icon`, `Layout`, `Components`, `ServiciosScreen`, `DatosConsultaScreen`, `App`. See `ui_kits/backoffice/README.md`. |
| `fonts/` | (empty — Open Sans is loaded from Google Fonts as a flagged substitute) |
| `assets/` | (empty — no logo / icon set was provided by the user; Lucide-style SVGs are used inline as substitutes) |

---

## Content fundamentals

The Top Doctors backoffice copy is **formal, clinical, and instructional** — written by the platform *to* the doctor, not the patient.

**Voice & tone**

- **Address**: always *usted* (formal you). Never *tú*. Salutations include "Estimado doctor".
  - Example: *"Estimado doctor, en base a sus especialidades Top Doctors le asigna por defecto una serie de servicios estándar."*
- **Self-reference**: the platform refers to itself in the third person as **"Top Doctors"** (capital T, capital D, two words). Never *we / nosotros*.
- **Imperative for actions**: short, polite imperatives in third-person formal: *"Actívelo y configúrelo"*, *"Asocie dichos servicios"*, *"Indique la duración y precio"*.
- **Tone**: helpful, slightly verbose, clinical. Never playful, never punny, no humor. Every banner explains the *why* before the *what*.

**Casing & punctuation**

- **Section headings**: Title-case Spanish (only first word + proper nouns capitalized): *"Datos de la consulta"*, *"Asignar seguros médicos a esta consulta"*, *"Visita niños"*.
- **Page titles**: single Spanish noun, capitalized: *"Servicios"*.
- **Labels**: capitalized first word only: *"Nombre"*, *"Tratamientos"*, *"Código postal"*, *"Correo electrónico"*.
- **Buttons**: imperative single verb, capitalized: *"Editar"*, *"Guardar"*. (Inferred — only Editar is visible.)
- **Diacritics are mandatory**: *Podología*, *teléfono*, *código*, *electrónico*, *días* — never stripped.
- **Punctuation**: full stops on banner sentences. Inline-emphasized actions inside warnings are bolded but **not** quoted: *"Este servicio está desactivado. **Actívelo y configúrelo**."*

**No emoji.** No unicode pictograms. The product uses only its own line-icon set.

**Domain vocabulary** (preserve verbatim)

| Term | Meaning |
|---|---|
| *Consulta* | A clinic / practice location. Also: a consultation appointment. |
| *Servicio* | A bookable service (e.g. first visit, follow-up). |
| *Especialidad* | Medical specialty (Acupuntura, Podología, etc.). |
| *Agenda* | Calendar / schedule. *Con agenda* = clinics that have a calendar. |
| *Telemedicina* | Telehealth. |
| *Seguros médicos* | Medical insurances accepted. |
| *Despacho* | Office/practice (used interchangeably with *consulta*). |
| *Tratamientos* | Treatments offered at a consulta. |

---

## Visual foundations

**Overall vibe**: clean, clinical, unmistakably Spanish-medical-SaaS. Bright cyan/turquoise sidebar against an almost-white workspace. Generous white cards with soft shadows, lots of breathing room, thin 1-2px borders, no hard edges, no skeuomorphism. Reads as "trustworthy hospital admin software" rather than "playful consumer app".

### Color

Primary identity is **bright cyan**, paired with a deep **brand blue** for accents and a near-black **navy** for header bars. The sidebar uses a horizontal cyan gradient.

| Token | Hex | Use |
|---|---|---|
| `--brand-cyan` | `#1abadf` | Sidebar mid-tone, headings on cyan |
| `--brand-cyan-dark` | `#009ee2` | Sidebar left edge, primary accent, links, info-icon, color-picker arrow, "Con agenda" specialty dot |
| `--brand-cyan-light` | `#2ccdde` | Sidebar right edge, button gradient end |
| `--brand-cta` | linear-gradient(`#24c4df` → `#1abadf`) | "Editar" / primary buttons |
| `--header-navy` | `#112233` | Top dark utility bar (Datos de la consulta header) |
| `--text-primary` | `#272727` | Body text, page titles |
| `--text-secondary` | `#5b7a81` | Secondary labels, muted |
| `--page-bg` | `#f2f6f8` | App background, sidebar inactive icon area |
| `--surface` | `#ffffff` | Cards, inputs, white sidebar icon-active area |
| `--banner-info-bg` | `#d4ebf4` | Informational banner background (light cyan) |
| `--banner-warn-bg` | `#f3efda` | Warning banner / yellow callout |
| `--banner-warn-accent` | `#fdc007` | Warning icon / accent yellow |
| `--success` | `#34b154` | Toggle-on, green check |
| `--success-light` | `#a1d100` | Specialty dot (Ofimedic / lime) |
| `--danger` | `#ff3c52` | Specialty dot (red), destructive |
| `--border-soft` | `#e6e6e6` | Card border, divider |
| `--border-input` | `#cccccc` | Input border |

The sidebar is rendered with `linear-gradient(to right, #009ee2 0%, #1abadf 50%, #2ccdde 100%)`. The "Editar" CTA is a similar but vertical/diagonal gradient.

### Type

The screenshots use a humanist sans-serif. **No font file was provided**, so this system substitutes **Open Sans** (Google Fonts) — a free, near-pixel match for the original. Flag: please share the real font (likely Open Sans, Source Sans 3, or PT Sans) so this can be confirmed.

- **Display / page title**: 28–32px, weight 700, color `--text-primary`. Examples: *Servicios*.
- **Section heading**: 18–20px, weight 700. Examples: *Datos de la consulta*.
- **Row title (service name)**: 14–15px, weight 700. Examples: *Primera consulta Acupuntura*.
- **Body**: 14px, weight 400, line-height 1.55.
- **Banner body**: 14px, weight 700 (bold throughout), color `--brand-cyan-dark`.
- **Label (form field)**: 12–13px, weight 700, color `--text-primary`. Always sits above its input.
- **Helper / muted**: 12px, weight 400, color `--text-secondary`.

No italic, no all-caps, no letter-spacing tricks. Numbers are tabular when in tables (assumed, not visible).

### Spacing

A **4px base grid**. Common steps: 4, 8, 12, 16, 20, 24, 32, 48.
- Card-to-card vertical gap: **12px**.
- Card padding: **16px** vertical, **20px** horizontal.
- Form field gap (vertical): **16px**.
- Form field gap (horizontal between siblings in a row): **12px**.
- Section gap (between titled groups): **32px**.
- Sidebar icon vertical gap: **24–28px**.
- Sidebar width: **60px**.

### Backgrounds

- **Workspace**: flat `#f2f6f8` — a barely-tinted off-white. No textures, no patterns, no gradients.
- **Cards / inputs**: pure `#ffffff`.
- **Sidebar**: cyan **horizontal gradient** (`#009ee2` → `#2ccdde`). The only gradient in regular use.
- **Top utility bar** (on edit screens): solid `#112233`.
- **No hand-drawn illustrations, no full-bleed imagery, no photo backgrounds.** This is a utility tool.

### Borders & corners

- **Border radius scale**: `4px` (inputs, small buttons), `6px` (cards, banners), `12px` (toggle pill), `999px` (round pills like "Con agenda", color dots).
- **Borders**: hairline `1px solid #e6e6e6` on cards; `1px solid #cccccc` on inputs. Cards have **no border + soft shadow** alternative (visible in service rows). Banners have no border.

### Shadows

Two shadows in use:

- **Card resting**: `0 1px 2px rgba(17, 34, 51, 0.06)` — barely there, feels like a slight lift on the off-white bg.
- **Card hover / dropdown**: `0 4px 16px rgba(17, 34, 51, 0.10)` — used by the "Seleccionar consulta" dropdown.

No inset shadows. No glow rings (focus inferred as a 2px cyan outline).

### Hover, press, focus

Inferred from typical SaaS conventions of this era — confirm with codebase:
- **Hover** on cards / list rows: subtle `background: #fafcfd` shift; cursor pointer.
- **Hover** on icons: opacity 1 → keeps full color, but white icons in sidebar gain a subtle white-overlay highlight square (visible on the active hamburger icon: white square bg behind it).
- **Press**: scale 0.98 on buttons; deeper shadow inset.
- **Focus**: 2px outline `--brand-cyan-dark` with 2px offset on inputs. Inputs also lift their label color.
- **Disabled**: opacity 0.5, cursor not-allowed.

### Animation

Minimal. Toggles slide horizontally in ~150ms ease-out. Dropdowns fade+slide-down 200ms. No bounces, no decorative motion.

### Transparency & blur

Not used. Surfaces are flat and opaque. No glassmorphism, no scrims with blur — modal backdrops (assumed) would be plain `rgba(17,34,51,0.4)`.

### Layout rules

- **Fixed left sidebar** (60px) on every page.
- **Hamburger / collapse trigger** sits at top-left of the content pane.
- **Page header band** spans full content width with the centered page title; right side holds primary tool (search) and context selector (clinic).
- **Banners** sit directly under the header, full content-width.
- **Content** is a single-column stack of cards. No multi-column dashboards visible.

### Imagery / iconography vibe

- **Icons**: thin-stroke (~1.5px) line icons in pure white on the cyan sidebar; in `#272727` or `#5b7a81` inline. Rounded line caps. Outline style — no fills, no duotone.
- **Color flag** (Spain) appears as a circular flag emoji-style image inside the phone-prefix input. Real circular flag image, not emoji.
- **No photos, no illustrations** in the surfaces shown.

---

## Iconography

The screenshots show a consistent **outline icon system** in the sidebar — single-weight strokes, ~1.5px, rounded caps, no fills. Identifiable glyphs (in order): briefcase/calendar, pill/medication, hospital/building, people-group, star, megaphone, document, bar-chart, speech-bubble, user-avatar with red dot indicator, cog. Inline icons in the content area follow the same style.

**Origin not provided.** No icon font, sprite, or SVG file was attached. After comparing stroke weight and corner radii against common open libraries, I'm using **Lucide** (loaded via CDN) as a substitute — its line weight, rounded caps, and proportions are the closest off-the-shelf match.

> **Substitution flagged**: Please share the actual icon set (icon font name, SVG sprite, or a folder of SVGs) and we'll swap Lucide out throughout the kit.

**Rules**

- **Always outline**, never filled.
- **Stroke 1.5px** at 24px, 1.25px at 16px.
- **Color**: white on cyan sidebar; `--text-primary` (`#272727`) inline; `--text-secondary` (`#5b7a81`) when secondary.
- **Section icons** (next to "Datos de la consulta", "Asignar seguros médicos…", "Visita niños") sit left of the heading at 20px, same color as the heading.
- **Active sidebar item** is indicated by a **white square pill** behind the icon (visible on the top hamburger).
- **Active user / notification** is a small filled red dot on top-right of the user avatar icon.

**No emoji. No unicode-character icons.** The Spanish flag in the phone field is a real raster image, not 🇪🇸.

---

## Caveats & open questions

1. **No codebase / no Figma** — every component below is a pixel reconstruction. Real spacing, hover, and focus states need confirmation.
2. **Font is substituted** — Open Sans stands in until you share the real one.
3. **Icon set is substituted** — Lucide stands in until you share the original SVGs / icon font name.
4. **Only two screens were sampled**. Buttons (other than Editar), modals, tables, calendar, charts, login, and empty states are all *assumed* in the UI kit.
5. **Dark-mode**: not present in the screenshots; not designed.
