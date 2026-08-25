# Handoff: Turtle Labs Website

## Overview
A complete marketing website for Turtle Labs (a brand & design studio): a home page with a lead-generating brand-score quiz, a works/portfolio section with case studies, a journal (blog), a services section, testimonials, a booking flow, and two lead-magnet capture flows (Brand Strategy Workbook + Sustainable Brand Playbook). Plus a demo admin CMS for editing all content.

## About the Design Files
The files in this bundle are **design references built in HTML/CSS/JavaScript** (React rendered by a small runtime, `support.js`). They are complete, interactive prototypes showing the intended look and behavior. They are **not** meant to be shipped verbatim.

The task is to **recreate these designs in the target production environment** using its established patterns and libraries. If no codebase exists yet, choose an appropriate modern framework (Next.js/React or Astro are good fits for this content-driven, largely static site) and implement the designs there. Preserve the exact visual design, copy, and interactions documented below.

Every `.dc.html` file is one page. To view them, serve the folder over a local static server (see "Running locally") — do not double-click, because the pages load a shared `support.js` and relative assets.

### Running locally
```
cd design_handoff_turtle_labs_site
python3 -m http.server 8000
# open http://localhost:8000/Turtle%20Labs%20Landing.dc.html
```

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, copy, animations and interactions. Recreate the UI pixel-accurately. All content is data-driven from a single file (`tl-content.js`) — treat that file's shape as the content schema.

## Content Architecture (read this first)
All four pages read content from **one file: `tl-content.js`**, which exports `TL_CONTENT` with these keys:
- `works[]` — portfolio items (see schema below)
- `featured[]` — ordered array of work `id`s shown on the homepage (max 6)
- `journal[]` — blog articles
- `services[]` — services list
- `reviews[]` — testimonials
- `logos[]` — client logos
- `sectors[]`, `stats[]`, `journalCategories[]`, `journalIndustries[]`

In production, replace this static file with an API call of the **same shape** (a backend + database). The `Developer Handoff.dc.html` file in this bundle contains the full backend/hosting/go-live plan (Supabase recommended).

### `works[]` item schema
```
{
  id: 'w-smw',                 // stable slug, used in URL hash for deep links
  cat: 'identity',             // filter category key
  tag: 'Brand Identity',       // display label
  title: 'The SMW Group - Fintech Branding',
  initials: 'SMW', accent: '#EC3013', tagBg: 'rgba(...)',
  grad: 'linear-gradient(...)',// card background when no thumb
  weeks: '8 weeks', loc: 'London, UK',
  thumb: 'assets/works/...jpg',thumbFit:'cover', thumbBg:'#000',
  desc: 'lead paragraph',
  media: [ {kind:'image|video|pdf', src, bg, caption} ],  // case-study gallery
  stats: [ {value:'40+', label:'Brand assets'} ],
  story: [ {n:'01', head:'The Challenge', body:'...'} ],  // 8-part case study
  outcomes: ['...','...']
}
```

### `journal[]` item schema
```
{
  id:'j-logo', category:'Strategy', industry:'Retail',
  tag:'Positioning', tagBg, tagFg,
  grad:"url('assets/journal/..png') center/cover, var(--card)",
  date:'Aug 25, 2026', readTime:'9 min read', author:'Aditya, Founder',
  title:'...', excerpt:'...',
  body:[ 'paragraph', '## Heading', '- list item', '> quote', 'text with **bold**, *italic*, [link](url)' ]
}
```
`body[]` supports lightweight **markdown** rendered by the article view: `## ` heading, `- ` list, `> ` quote, inline `**bold**`, `*italic*`, `[text](url)`.

## Screens / Views

### 1. Home — `Turtle Labs Landing.dc.html`
Single scrolling page, fixed blurred header, sections in order:
- **Hero** (`#hero`): headline, two CTAs (Find Your Score → `#score-quiz`; secondary → `#work-samples`), trust pill.
- **Score Quiz** (`#score-quiz`): "Start My Score" opens a path chooser (quick vs detailed), then a 10-question quiz, score result, weak-area breakdown, email capture.
- **Silent Leak** (`#silent-leak`), **Selected Works** (`#work-samples`): filter tabs (All/Video/Brand/Web/Packaging) + 6 cards; "All" shows the `featured` set, a category shows all matching works. Clicking a card opens a **work modal** (media panel + details, "Start a project", "View case study" → `Works.dc.html#<id>`, "Expand" → lightbox, prev/next).
- **Methodology** (`#measured`), **Services** (`#services`): accordion rows from `services[]`.
- **Before/After** slider (`#before-after`), **Testimonials** (`#testimonials`) carousel, **Framework** (`#framework`), **Sectors** (`#expertise`).
- **Playbook** (`#playbook`): green panel, email form → downloads PDF + "sent" confirmation.
- **Impact** (`#impact`), **Journal preview** (`#journal`): 3 latest articles → link to `Journal.dc.html`.
- **Book Call** (`#book-call`): dynamic calendar (future weekdays only, weekends disabled) + "Schedule on Calendly".
- **Global overlays:** on-load welcome popup (once per session, 1.4s) offering Audit / Workbook / Book a Strategy Call / See works; right-side floating "BRAND STRATEGY WORKBOOK · FREE" tab + bottom banner → workbook email-capture popup (downloads PDF, confirms emailed); proposal modal; media lightbox.

### 2. Works — `Works.dc.html`
- **List view:** filter tabs, grid of work cards, pagination (6/page).
- **Case-study view** (opened by `#<work-id>` on load, or in-page nav): back button, tag/meta, title, lead, **media gallery** (images/video/pdf, click to open lightbox), facts row (category/location/timeline), stats grid, 8-part story (Challenge→Impact), outcomes, CTA, prev/next between works, and a horizontal "More work" thumbnail slider.

### 3. Journal — `Journal.dc.html`
- **List view:** category filter tabs (Industry tabs exist in data but are hidden), view toggle (thumbnail/list/text), article cards, pagination (6/page).
- **Article view:** back button, hero, tag/meta, title, body rendered from markdown (see schema).

### 4. Admin CMS — `TurtleLabs CMS.dc.html` (demo, in-memory)
Sidebar: Dashboard, Works, Featured, Journal, Reviews, Client logos. Edit drawers with text fields, a **markdown formatting toolbar** on textareas (B/I/H/list/quote/link), single-file **Thumbnail** dropzone + multi-file **Images** gallery dropzone (drag-drop, in-browser image compression to WebP). Featured screen: pick/reorder up to 6 homepage works. Demo login accepts anything; all writes are in-memory only.

## Design Tokens
Defined as CSS variables in each page's `<helmet><style>` (dark theme default, light theme via toggle). Core values:
- **Accent green:** `--green:#34C759`, ink `--green-ink:#04170B`, bright `--greent:#4ADE80`
- **Accents:** `--red:#FF6B6B`, `--orange:#FF8A5C`, `--amber:#FFB35C`, `--blue:#60A5FA`, `--cyan:#67E8F9`
- **Surfaces (dark):** `--bg`, `--bg2`, `--card`, `--line`, `--line2`, `--text`, `--muted`, `--faint`, `--header-bg` (blurred)
- **Brand accent (SMW/print/DS):** `#EC3013` / `#C8261A`
- **Type:** headings `'Outfit'` (700–900), body `'Inter'` (400–700), both from Google Fonts.
- **Radius:** pill `999px` for buttons/tags, `16–28px` for cards/panels.
- **Note:** the bound design system for this project is "Modernist" (flat, Archivo, red-on-white, 0 radius, 2px rules) — the site itself uses its own dark theme above; follow whichever the team standardizes on.

## Interactions & Behavior
- **Deep links:** works/journal items are addressable by URL hash (`#w-smw`). On load, the page reads the hash and opens that case study/article. Home re-scrolls to any hash target after layout settles (250/700/1300ms) so cross-page anchors like `#services` land correctly.
- **Lightbox:** images + video only (no text), arrow + keyboard nav, counter "n / total", Esc to close.
- **Theme toggle:** persists to `localStorage['tl-theme']`.
- **Welcome popup:** once per session via `sessionStorage['tl-proposal-shown']`.
- **Booking calendar:** generates a 2-week window from today, disables past days and weekends, prefills the chosen date (and email) into Calendly (`calendly.com/turtlelabsdesign/30min`).
- **Animations:** section reveal on scroll (`data-reveal`, CSS `animation-timeline: view()`), modal fade/rise keyframes.

## State Management
Per-page React class state (see each file's logic class). Key state: theme, navOpen, filter, workIdx (open modal), caseId (case study), page (pagination), lbIdx/lbItems (lightbox), welcomeOpen/workbookOpen/proposalOpen/pathModalOpen, quiz state (stage/index/answers/score), booking (selDateISO/booked), lead email. Content is loaded once via `import('./tl-content.js')` in `componentDidMount`.

## Known items to resolve (also in Developer Handoff.dc.html §5)
- Filenames contain spaces → rename to slugs (`index.html`, `works.html`, `journal.html`, `admin.html`) and update inter-page links.
- Escape does not close the Workbook popup (✕/backdrop do) — add `workbookOpen` to the Escape handler.
- Modals can stack — enforce one-at-a-time.
- Forms show "sent" but do not actually email — wire to EmailJS or a backend + Resend/SendGrid.
- CMS is in-memory — needs a database + real auth (Supabase recommended).
- Add legal pages, per-page SEO/OG tags, and analytics before launch.

## Assets
`assets/` contains all images, logos, client marks, one video (`assets/video/...`), and the workbook PDF (`assets/brand-strategy-workbook.pdf`). Work thumbnails/gallery live in `assets/works/`, journal thumbnails in `assets/journal/`. All are referenced by relative path from `tl-content.js`.

## Files in this bundle
- `Turtle Labs Landing.dc.html` — home page
- `Works.dc.html` — works list + case-study view
- `Journal.dc.html` — journal list + article view
- `TurtleLabs CMS.dc.html` — demo admin CMS
- `tl-content.js` — **all site content (the schema to model your DB on)**
- `support.js` — the render runtime (reference only; do not port)
- `Developer Handoff.dc.html` — full backend / hosting / go-live plan (open in a browser)
- `doc-page.js` — supports the handoff doc's print layout
- `assets/` — all media
- `screenshots/` — reference captures: `01-home.png`, `02-works.png`, `03-journal.png`, `04-cms.png`
