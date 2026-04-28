# Backoffice UI Kit — Top Doctors

Click-thru recreation of the doctor-facing Top Doctors backoffice. Reconstructed from screenshots — see project-root `README.md` for caveats.

## Files

| File | Role |
|---|---|
| `index.html` | Entry — loads React + Babel and mounts `<App/>` |
| `App.jsx` | App shell: sidebar + screen switcher |
| `Icon.jsx` | Inline SVG icon set (substitute for the real Top Doctors icons) |
| `Layout.jsx` | `Sidebar`, `PageHeader`, `InfoBanner`, `WarningPill` |
| `Components.jsx` | `Toggle`, `Checkbox`, `ColorDot`, `GearButton`, `ServiceRow`, `ClinicDropdown`, `Field`, `TextInput`, `ColorSwatchInput`, `PrimaryButton`, `GhostButton`, `SectionHeading` |
| `ServiciosScreen.jsx` | Servicios page — banner, search, clinic-selector dropdown, service rows with toggles |
| `DatosConsultaScreen.jsx` | Datos de la consulta page — view ↔ edit ↔ saved states with form fields |

## What works (interactive)

- Sidebar: click any icon to switch; only Servicios (idx 1) and Datos de la consulta (idx 2) have screens; others are visual only.
- Servicios: search filters rows live; toggle activates/deactivates a service (warning pill swaps for color dots + checkbox); clinic-selector dropdown opens, multi-select.
- Datos de la consulta: Editar → fields become editable, color picker opens; Guardar persists draft and shows a flash; Cancelar reverts.

## What's intentionally faked

- Icons are Lucide-style hand-drawn substitutes — not the real Top Doctors set.
- The 11-item sidebar shows reasonable guesses for the other 9 sections (Agenda, Pacientes, Marketing…). They are not screens.
- No real backend, no validation, no field formatting (phone, email, postal code).
- "Mostrar en Top Doctors" checkbox is illustrative only.
