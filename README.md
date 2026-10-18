# mansli7.github.io

Static Jekyll site for the Mansli7 Bible study portal.

## Current Structure

- `/` is the default English home page.
- Entry pages use a one-language-at-a-time experience controlled by shared language state.
- Study-question book content remains split under `/bs/sq/en/` and `/bs/sq/zh/`.
- Annual reading plan table pages remain split under `/bs/ar/2026-en` and `/bs/ar/2026-zh`.
- The calendar page at `/bs/ar/2026-calendar` follows the shared site language preference.

## Language Switching

- Site-wide language preference is stored in `localStorage` under `mansli7-site-lang`.
- Shared language logic lives in `assets/js/site-lang.js`.
- The default layout sets `html[data-site-lang]` before render to avoid flashing the wrong language.
- Entry pages use `.card-en` and `.card-zh` blocks, with layout CSS showing only the active language.
- Global language controls are wired through `data-lang-switch` buttons in the nav and homepage hero.
- On study-question book pages and annual-plan table pages, switching language also localizes the route when an equivalent page exists.

## Key Files

- `_layouts/default.html`: early language initialization, global language CSS gating, shared scripts, and homepage widgets.
- `_includes/nav.html`: desktop and mobile navigation plus global language switch controls.
- `assets/js/site-lang.js`: storage, switch syncing, event dispatch, and route localization.
- `index.md`: homepage hero language controls and single-language entry content.
- `bs/ar/index.md`: annual reading-plan hub.
- `bs/ar/2026-calendar.md`: shared-language calendar experience.
- `bs/sq/index.md`: study-question hub that links into existing `en` and `zh` book trees.

## Editing Notes

- When adding a new study-question book, update the book links on `bs/sq/index.md` and the slug maps used by the layout/home widgets.
- If a new page should obey the site-wide language switch, prefer `.card-en` and `.card-zh` blocks instead of duplicating routes.
- Keep raw downloads under `assets/downloads/`.

## Styling (Tailwind CSS)

- Tailwind is **prebuilt and committed** at `assets/css/tailwind.css` — the site no longer
  loads `cdn.tailwindcss.com` at runtime (that CDN prints a "not for production" warning and
  ships the whole engine to every visitor). GitHub Pages serves the committed file directly.
- After changing Tailwind classes in any `.html`/`.md`/`.js`, rebuild the CSS and commit it:
  ```bash
  npm install      # first time only
  npm run build:css
  ```
  Use `npm run watch:css` while editing to rebuild on save.
- Config lives in `tailwind.config.js` (`primary` color + Inter font stack, content globs
  covering all templates). The input file is `src/tailwind.css`. The `<link>` must stay
  **after** `style.css`, because the old CDN injected itself at runtime and therefore won
  the cascade against rules like `.container`.
- `node_modules/`, `package*.json`, `tailwind.config.js`, and `src/` are excluded from the
  published site via `_config.yml`.