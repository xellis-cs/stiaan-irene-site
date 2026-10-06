# Irene Ellis Art — Project Context

## Project
Single-page static portfolio website for Irene Ellis, an artist,
motivational speaker, and Master of Ceremony. The site shows her work and
takes workshop bookings, messages and "tell me about new dates" emails
(all saved to Supabase — see "Database tables"). No e-commerce.

## Tech
- Plain HTML, CSS, and vanilla JavaScript. No frameworks, no libraries.
- index.html, style.css, script.js at the project root. The smaller scripts
  each do one job: content.js (dates from the database), signup.js (the
  booking form), notify.js (the email list), contact.js (the message form),
  showcase.js + stack.js (see below). config.js holds the Supabase address.
- Built and previewed with Live Server in VS Code.

## Fonts — three roles, as CSS variables (use these, never a font name)
- `--font-display` Pinyon Script — the name and the section titles.
- `--font-serif` EB Garamond — everything that is read: the story, the
  tagline, month names, the small-caps pills. (Cormorant Garamond and the
  never-loaded "Sabon" used to share these jobs; both are gone.)
- `--font-ui` Inter — controls, captions, forms.
- The Google Fonts request in index.html only asks for the weights used.
- Also in `:root`: a small type scale (`--text-xs` … `--text-title`), a 4px
  spacing scale (`--space-1` … `--space-8`), section padding and the three
  corner radii (`--radius-pill/card/field`). Reach for these before typing a
  new number.

## Portfolio objects — stacked cards
- Each of the 3 categories is a stack of rounded cards (.cards/.card),
  fanned tight at rest and twisting further open on hover, plus a small
  grow. The pill button stays centred and never moves or grows.
- Each card now carries one artwork image (see "Images & assets"); the front
  card (card--5) shows the category's first image.
- These REPLACED an earlier crumpled-paper-ball idea (hand-generated SVG).
  Don't reinstate the balls.

## Portfolio transition — decided, do not redo
- three.js + GSAP were evaluated for a 3D paper-unfold and REJECTED.
  Prototypes proved a procedural crumple looks like glass shards, not
  paper; a convincing one needs a Blender-baked simulation we don't have.
- The showcase instead grows out of the clicked object and shrinks back
  into it, using FLIP (measure the .category rect -> transform the panel
  onto it -> release) with plain CSS transitions. No animation library.

## Brand palette (defined as CSS variables in style.css)
- Pink #eed0c8 — informational areas, kept readable
- Blush #f1dfd6 — soft rose-cream; About section background
- Rose #e6b8ab — deeper rose; Portfolio section background
- Tan #f4efe4 — decorative edges
- White #fdfdfd — backgrounds
- Text #2c2c2c — dark charcoal, all readable copy
- Accent #8f5f50 — the dusty-rose for rules, day numbers and small accents.
  (It was #bb8b79, which measured under 2.5:1 on the pinks — too faint to
  read. The new one passes WCAG where it is text.) Two soft charcoals for
  small captions, both checked to pass 4.5:1: `--color-ink-soft` (eyebrows)
  and `--color-ink-muted` (times, topics). `--color-dark` is the #2A2826.
- Dark end of the journey / UI accents (used lower down the page):
  Dark display #2A2826 (the portfolio showcase panel), scrollbar track
  #38332f, close-X accent #a8465a (a rose-red).
Aesthetic: soft watercolour, dandelion motif, feminine, calm.

## Palette journey (design direction)
- The page should flow from light at the top to darker toward the
  bottom, ending dark — a seamless, stylish gradient down the site,
  built only from the brand palette. Keep this in mind for every
  section's background as we build downward.

## Content rules
- Readable font for: the about paragraph, personal attributes, and
  contact details. Style can be more decorative elsewhere.
- Contact email placeholder: ireneellisart613@gmail.com (may change
  to sales@ireneellisart.co.za later — placeholder for now).
- Ignore the old Wix link entirely; it's not part of this site.

## Head / meta
- The canonical link and the og:url / og:image tags spell out the FULL
  address (https://xellis-cs.github.io/stiaan-irene-site/) — sharing
  previews are built by other servers, so they cannot be relative. If the
  site ever moves to a custom domain or another host, change all three.

## Sections (single-page, in order)
0. Skip link + sticky header (see "Navigation")
1. Hero — "Irene Ellis Art" title, the three roles, one line on what Irene
   offers, two pills ("Book a workshop", "See the portfolio"), and the nav
   pills along the base (hidden on phones — the header's Menu takes over)
2. About — portrait (images/irene-ellis.jpg) left, roles/services right, bio
3. Workshop Dates — intro copy, a venue/cost line, up to four months of date
   buttons, then "What to expect" and the "Be the first to hear" email form
4. Portfolio — 3 fanned card stacks of artwork; click opens the dark gallery
5. Contact — the message form and the two social boxes over the landscape
6. Footer — one slim row in the ground colour: wordmark, links, socials,
   ©, a quiet Admin link. Keep it slim: stack.js raises the held contact
   boxes by whatever sits under the section on short screens.

## Images & assets
- All images live in `images/`, referenced with relative paths.
- About portrait: `images/irene-ellis.jpg` (a tall portrait; cropped to the
  4:5 frame via object-fit:cover, object-position:center 20%). The file must
  be placed there by hand — the pasted image can't be saved from chat.
- Portfolio artwork: `images/portfolio/Category 1/`, `Category 2/`,
  `Category 3/` — each holds ~4–6 image files. The FOLDERS keep those names;
  the albums are named for what is in them: "Pastel & Gold" (1), "Flora &
  Fauna" (2), "Graphite Studies" (3). Those names are the GALLERY keys and
  every data-category / data-stage on both pages — change them in all places
  or the panel opens empty. Each stack has a one-line description under it
  in index.html. `GALLERY_SIZES` lists each picture's real width/height so
  the gallery wall lays out once; add a line when adding a picture.
- ONE source of truth for the portfolio images: the `GALLERY` map in
  `gallery-data.js` (loaded by BOTH the public site and the admin page) lists
  each category's files. It drives the fanned cards, the site's dark gallery,
  AND the admin preview. To add/remove a piece: drop the file in its folder and
  edit that list. `gallery-data.js` must load before script.js and showcase.js.
  `window.GALLERY_BASE` is how each page reaches the images folder from where it
  sits (site uses the default `images/portfolio/`; admin sets `../images/...`).

## Portfolio showcase — the click-to-open gallery
- Clicking a category grows the panel out of the clicked card (FLIP) into a
  dark #2A2826 "display" panel (the dark end of the palette journey).
- Inside: the album's name and piece count top-left, then a scrollable,
  2-column masonry of that category's images — they keep their own
  sizes/aspect ratios, load lazily, and carry width/height. Shows ALL of a
  category's images (including any beyond the five cards).
- It is a dialog: Escape closes it, Tab stays inside it, and closing puts
  focus back on the thing that opened it. The site header hides while it is
  open.
- A workshop date opens the same panel with the BOOKING FORM instead
  (`.signup` in index.html, signup.js): heading, a chip restating the chosen
  date, labelled fields, a 1–6 people stepper, inline checks, and a
  thank-you that repeats the booking. The row it saves is exactly name,
  surname, phone, attendees, workshop_month, workshop_date, workshop_topic.
- Custom scrollbar: rounded dark #38332f track + soft #f1dfd6 thumb, no arrows.
- Close control = a flat 2D page-fold in the top-right corner: the dark panel's
  corner folds back (curved flap, NO 3D shading) revealing a #eed0c8 triangle
  with a rounded rose-red (#a8465a) X. It's sized to the panel padding so it
  tucks above the scroll track without overlapping. Button has aria-label.
- SHARED CODE: the whole dark display lives in `showcase.css` + `showcase.js`
  (markup is `.showcase` inlined per page). Both the public site and the admin
  page `<link>`/`<script>` these, so they render the IDENTICAL panel — edit
  once, both update. Any element with `[data-category-open]` +
  `[data-category="…"]` opens it (site: category cards + workshop buttons;
  admin: each album's Preview button). Non-`.category` triggers grow from their
  own centre with a uniform scale (so a thin button never opens as a sliver).

## Admin page (/admin) — content editor
- Reached at `/admin`; Supabase login gates it (see admin/ files). Dark
  #2A2826 background, tan (#f4efe4) section panels, white month/album cards.
- Portfolio section: each category label has a **Preview** button that opens the
  SAME shared dark display (above) for that category, reading the SAME
  `gallery-data.js` images — so the admin preview mirrors the live site. Once
  Save is wired (Supabase), both the preview and the site read the saved source.
- Dates and participant counts save to `site_content` (Save changes). Picture
  uploads still only preview locally.
- Three read-only lists load once signed in, all through the shared
  `IEA_loadProtected` helper in admin.js: Workshop participants (names per
  date), Notify list (emails, with "Copy all emails" for a Bcc line) and
  Messages (from Get In Touch, each email a mailto link). Removing a row is
  done in the Supabase table editor.

## Database tables (supabase-setup.sql — run once in the SQL Editor)
- `signups` — bookings. `notify_list` — emails from the "new dates" form
  (one per address; `source` records which form, in case a second is added). `messages` — Get In Touch. All three share one rule:
  anyone may INSERT, only a signed-in admin may SELECT, nobody updates or
  deletes from the web. `site_content` — the dates the editor saves; anyone
  may read, only signed-in may write.
- Every form script sends `Prefer: return=minimal`, never shows the raw
  database error, and says plainly "not set up yet" if its table is missing.
- The notify and message forms carry a hidden bot-trap field named
  `iea_extra_field` (off screen, out of the tab order). A filled trap shows
  success and stores nothing. Never give it a real-sounding name like
  "website" — browsers' autofill fills those in and real people get dropped.
- Admin lists go through `IEA_loadProtected`, which checks the session's
  expiry and, on an expired token (or a 401), clears it and brings the login
  screen back with a message rather than a load error.

## Ring-bound book styling (binding, holes, cascade)
- The whole page reads as the LEFT page of a ring-bound book. A charcoal wire
  coil runs down the RIGHT edge, full document height — script.js fills it with
  <use> copies of one #bindRing SVG symbol and re-runs on resize/height change.
- Bottom-left has cascading page edges + a rounded bottom-left corner (also
  drawn by script.js).
- The punched holes were heavily iterated. CURRENT (keep simple): each hole is
  a plain dark-grey (#4a4644) filled circle with the ink wire extending to its
  bottom. The old "see the pages receding down the hole" depth effect was
  removed — don't reinstate unless asked.
- NOTE: the #bindRing symbol and the contact scene are hand-tuned SVG INLINED
  in index.html (originally built by throwaway Python generators not in the
  repo). Edit that inlined SVG directly.

## Contact section — drifting landscape
- A seamless, looping parallax landscape drifts left→right, scoped to the
  contact section only (built from the brand palette).
- Hill contours span the FULL width (immersive). Trees, plants and dandelion
  seeds are masked to appear only from the LEFT (where the front page begins)
  and fade toward the middle.

## Workshop Dates — date buttons
- Each date line ("18 Saturday 14:00") is a real button with a topic lip;
  clicking one opens the booking form in the dark panel.
- The intro copy is written; VENUE AND COST are not known yet. The line
  "Venue and cost are confirmed with you when you book" has an HTML comment
  above it marking where to fill them in once Irene decides.

## Navigation — sticky header + smooth scroll
- `.site-header` (top of index.html) slides in once the hero has scrolled
  off the screen and hides again while the showcase is open. It sits UNDER
  the binding coil (z 50 vs 60) so the rings still run over it; its right
  padding keeps the links clear of them. On phones the links live behind a
  Menu button (aria-expanded). stack.js starts its title band below the
  header, and the smooth scroll allows for its height.
- stack.js docks the titles (the 55% size it already used on narrow screens)
  whenever the full band would leave under 420px of room — a 900px laptop
  screen, for instance. Tall screens keep the full effect. Knob: `ROOM_FULL`.
- Nav links (and any in-page #anchor) smooth-scroll to their section via JS
  (ease-in-out), instead of jumping. Speed knob: `SCROLL_MS` in script.js.
  Respects prefers-reduced-motion (instant jump for those users).
- Keyboard: a skip link is the first Tab stop; every control shares one
  rose-red :focus-visible ring (style.css, "SHARED BITS").

## Design skill — /impeccable (in .claude/skills)
- The Impeccable design skill (impeccable.style, v4.5.0) is committed under
  `.claude/skills/impeccable/` with its four helper agents in
  `.claude/agents/`, so `/impeccable critique`, `/impeccable audit`,
  `/impeccable polish` and the rest work in every Claude Code session on this
  repo, including cloud sessions. It was copied from the `plugin/skills`
  folder of github.com/pbakaus/impeccable; to update, copy that folder again.
- Its optional engine (detector rules, live browser mode) is a binary the
  launcher downloads from GitHub Releases on first run. Where that host is
  blocked the skill says so and carries on with the written guidance alone.

## How I want you to work with me
- I am a beginner learning as I build. Explain choices simply.
- Work one section or one concern at a time. Do not build ahead.
- Before committing to anything ambiguous, ask me to clarify first.

