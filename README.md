# Trapezoid Calculator

A small React (Vite) dashboard reproducing the two calculators from Rain Consulting's
"Trapezoid areas volumes" spreadsheet:

- **Channel Flow Calculator** — trapezoidal channel capacity via Manning's equation
  (capacity, velocity, top width, hazard, shear stress), with a live cross-section diagram
  and Excel export.
- **Stage Storage Calculator** — depth-vs-volume stage storage table for a trapezoidal pit
  or basin, including a "target storage" solver equivalent to the spreadsheet's Goal Seek
  on base length.

All calculations run client-side and mirror the original workbook's formulas exactly (values
cross-checked against the source `.xlsx`).

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs a static site in `dist/` — deployable to any static host (Railway, Vercel, GitHub Pages, etc.).
