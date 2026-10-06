# Irene Ellis Art — Project Context

## Project
Static portfolio website for Irene Ellis, an artist, motivational speaker,
and Master of Ceremony. The whole site is ONE ring-bound sketchbook, open
flat on a dark board, whose pages TURN instead of scrolling. It shows her
work and takes workshop bookings, messages and "tell me about new dates"
emails (all saved to Supabase — see "Database tables"). No e-commerce.

## Tech
- Plain HTML, CSS, and vanilla JavaScript. No frameworks, no libraries.
- index.html, style.css at the project root. The scripts each do one job:
  book.js (the book: which pages show, the page turn, the tabs, the coil,
  the booking slip dialog), plates.js (draws every plate and its label from
  gallery-data.js, and the "loose print" dialog), content.js (dates from the
  database), signup.js (the booking form), notify.js (the email list),
  contact.js (the message form). config.js holds the Supabase address.
  showcase.css + showcase.js are now used by the ADMIN page only (its
  Preview panel); the public site does not load them.
- Built and previewed with Live Server in VS Code.

## Fonts — three roles, as CSS variables (use these, never a font name)
- `--font-display` Pinyon Script — ONLY the wordmark "Irene Ellis Art" and
  the spread titles ("The artist", "Programme", the album names, "Get in
  touch", "Book your place"). Nowhere else.
- `--font-serif` Libre Caslon Text — everything that is read: the offer line,
  the story, the dates, the "Untitled" lines. Caslon is the book face that
  has set gallery catalogues for a century. (EB Garamond did this before.)
- `--font-ui` Libre Franklin — labels, folios, tabs, fields and buttons. A
  Franklin Gothic is what museum wall labels are set in. (Inter before.)
- The Google Fonts request in index.html only asks for the weights used.
- Also in `:root`: a type scale measured in `--u` (one hundredth of the
  book's height, so type grows with the page like print, inside clamps), a
  4px spacing scale (`--space-1` … `--space-8`), `--page-pad` (a page's
  margin) and `--gutter-pad` (extra room at the coil). Reach for these
  before typing a new number.

## Brand palette (defined as CSS variables in style.css)
- Pink #eed0c8 — the right-hand pages
- Blush #f1dfd6 — the left-hand pages
- Rose #e6b8ab — the endpaper: the cover's rim around the pages
- Tan #f4efe4 — fore-edges, the index tabs, the paper slips
- White #fdfdfd — form fields
- Text #2c2c2c — dark charcoal, all readable copy
- Accent #8f5f50 — the dusty-rose for RULES and big numerals only.
  (It was #bb8b79, which measured under 2.5:1 on the pinks — too faint to
  read. Even the new one is 3.7–4.7:1 on the papers: fine for lines and
  large text, not for small text.) `--color-accent-ink` #6e4336 is the same
  rose deep enough for SMALL text — plate numbers, day numbers, labels
  (5.8:1 on pink). Two soft charcoals for captions, both checked to pass
  4.5:1: `--color-ink-soft` and `--color-ink-muted`. `--color-error` #8c2f41
  is the rose-red deep enough to read (the brighter #a8465a `--color-red` is
  only for focus rings, the pin and the close X).
- Dark #2A2826 — the board the book lies on (`--color-dark`); #38332f is its
  lighter tone for hover on dark buttons. Text on the board is blush.
Aesthetic: soft watercolour, dandelion motif, feminine, calm — and now an
exhibition catalogue's grammar: plate numbers, small label blocks, hairline
rules, wide margins.

## The world (design direction — decided 2026-10-06, do not redo)
- One book, seen once, at one scale, from one point of view. The dark board
  fills the window; the book is an A4 landscape spread (two A4 pages) that
  fills what is left. Dandelion seeds are the ONLY ornament (static, drawn
  in the margin — they do not drift).
- The earlier ideas are gone and are not to come back: the scrolling page
  with a hero and sections, the fanned card stacks, the dark FLIP showcase
  panel, the sticky page stack (stack.js), the drifting contact landscape,
  the crumpled-paper balls, three.js/GSAP.
- Controls are catalogue furniture: fore-edge TABS down the right of the
  book, FOLIOS at every page foot, a lifted page CORNER that turns the page,
  and a pinned paper SLIP for the primary action. No pill buttons, no eyebrow
  labels above headings, no icon tiles, no cards-in-cards.

## The spreads (index.html, in order; each has a #hash)
1. `#title` — L: wordmark (the single h1), the three roles in small caps,
   one line of offer, the pinned slip "Book a workshop". R: Plate I, the
   frontispiece (first picture of the first album) with its label.
2. `#artist` — L: Irene's portrait hung like a plate (images/irene-ellis.jpg)
   with its label. R: "My art story", every sentence of her bio, scrolling
   inside the page if it is long.
3. `#programme` — L: intro copy, the venue/cost line, "What to expect".
   R: `#workshop-dates` with the four months of date buttons, then the
   "Be the first to hear" email form.
4–6. `#plates-1` `#plates-2` `#plates-3` — one spread per album. L: the
   album's name (script), its one-line description, its first picture large.
   R: "Plates II to V", the album's other pictures in a group, each labelled.
7. `#contact` — L: "Get in touch", the message form. R: Facebook and
   Instagram, a line back to the Programme, the colophon (© 2026, the
   typefaces, a quiet Admin link).
Old links still land: #about, #workshop-dates, #portfolio and #hero are
aliases (the `ALIASES` map in book.js).

## The book — sheets, faces, pages (how the HTML is shaped)
- `<section class="spread" id="…" data-spread data-title="…">` is a pair of
  facing pages; inside it `<article class="page page--left">` and
  `page--right`. The SAME HTML serves computers and phones: on a computer
  a spread's two pages sit side by side; on a phone (≤720px) each page is
  the whole book and shows on its own, in the same order. book.js calls
  what is on show a "view": a spread on a computer, a page on a phone.
- Inside a page: `.page__body` holds the content (add `page__body--scroll`
  for a page that may run long: it scrolls inside the page, its last lines
  fade while there is more below, and the scrollbar is themed);
  `page__body--plate` centres a single picture. book.js adds the folio
  (`.folio`: number, running title) and the turn shade to every page.
- Headings: the title page's h1; every other page has one h2 (`.spread-title`
  in script on left pages, `.page-title` tracked caps on right pages) with
  tabindex="-1" so focus can land on it after a turn.
- Pages not on show have `data-state="off"` (not drawn) or `"staged"` (laid
  out invisibly so their pictures load first); both are inert and
  aria-hidden. The page on show is `"on"`.
- The rose `.book` is the cover's rim; `.book__pages::before/::after` are
  the tan fore-edge stripes; the `.coil` overlay runs down the gutter with
  `<use>` copies of `#coilRing` (phones: `#bindRing` mirrored to the left
  edge). The two `.corner` buttons are the lifted corners.
- A `.plate-slot` is filled by plates.js — see "Images & assets".
- Without JavaScript (`html` lacks the `js` class the inline head script
  adds) the pages stack down the screen as readable content; the tabs
  become plain links. Nothing is fetched to show a page.

## The page turn — book.js, and its knobs
- A turn is two flat pages rotating in 3D about the gutter, one after the
  other: the lifting page from flat to standing on its edge (0 → 90°), then
  the landing page from its edge down to flat. At the hand-over both are
  edge-on and invisible (the 3D "eye" sits on the gutter), so the swap
  cannot be seen. Each page wears a shade that darkens as it stands up, and
  two `.cast` layers throw a soft shadow across the pages beneath. All of it
  is sampled from ONE easing curve into keyframes and played with
  `element.animate()` (the browser's own engine, no library), so every part
  moves in step. `will-change` and the z-lift apply only to the two pages in
  motion, only during the turn.
- Knobs at the top of book.js: `TURN_MS` 720 (computer) and
  `TURN_MS_SINGLE` 520 (phone); `TURN_SNAP` 5 and `TURN_SNAP_SINGLE` 3 (the
  exponential ease-out; bigger = snappier start — at 5 the page stands on
  its edge about a fifth of the way through); `SWIPE_MIN` 48px;
  `WHEEL_MIN` 160 and `WHEEL_LOCK` 1100ms; the `ALIASES` map.
- What turns a page: the corners and arrows (`[data-turn]`), the tabs and
  any `a[href="#spread"]` (the slip, the folio wordmark, "Turn to the
  Programme"), ArrowLeft/Right, PageUp/PageDown, Home/End (never while
  typing in a field or while a slip/print dialog is open), a sideways swipe
  (finger or pen; vertical is left to the page's own scrolling), a
  deliberate wheel/trackpad gesture (a page whose text can still scroll
  keeps the wheel; at its end there is a half-second pause before a
  continued scroll turns the page), and the browser's Back/Forward.
- Navigation honesty: every turn is `history.pushState` with the spread's
  hash; loading a hash opens that spread; `popstate` turns back. On first
  load the address is NOT given a hash (adding one during load makes the
  browser start Tab from that spread instead of the skip link).
- After a turn: focus moves to the new page's heading, the `aria-live`
  announcer says "Page 3 of 7, Programme", the tab of the spread on show
  gets `aria-current`, arrows/corners at either end are disabled/hidden.
- `prefers-reduced-motion: reduce` → the page changes instantly, no 3D.

## The index — tabs, arrows, slip
- `.tabs` (nav#book-index, the skip link's target): four tabs About ·
  Programme · Plates · Contact, each an `<a href="#spread">`. On a computer
  they stick out of the book's right fore-edge (vertical text, ≥44px); on a
  phone the `.index` becomes a slim tan strip along the bottom with the
  arrows at its ends. `.turnbar` holds the arrows and the "3 / 7" count
  (count hidden on phones; the folios do that job).
- `.slip` is the primary action: a tan paper slip with a pin, linking to
  `#programme`. Keep it unmistakably a button (shadow with offset and blur,
  hover lift, arrow). It lives on the title page.

## Images & assets
- All images live in `images/`, referenced with relative paths.
- Portrait: `images/irene-ellis.jpg` (562×1000), shown whole on the artist
  spread. The file must be placed there by hand.
- Portfolio artwork: `images/portfolio/Category 1/`, `Category 2/`,
  `Category 3/` — the FOLDERS keep those names; the albums are named for what
  is in them: "Pastel & Gold" (1), "Flora & Fauna" (2), "Graphite Studies"
  (3). Those names are the GALLERY keys and the `data-plate-album` /
  `data-title` values on the plate spreads in index.html AND the
  data-category values in admin/index.html — change them everywhere together
  or a spread comes up empty.
- ONE source of truth for the pictures: the `GALLERY` map in
  `gallery-data.js` (loaded by the site AND the admin page). plates.js reads
  it and fills every `.plate-slot`: `data-plate-role="frontispiece"` (title
  spread), `"hero"` (an album's first picture, large) and `"group"` (the
  rest, from `data-plate-from`). Plate numbers run straight through the book
  in album order (I–V, VI–X, XI–XV) as Roman numerals. Every label says
  "Untitled" because Irene has not titled her pieces; the album's medium
  line is `data-medium` on its spread section (no sizes or years — unknown).
  `GALLERY_SIZES` lists each picture's real width/height so the page lays out
  once; add a line when adding a picture.
- TO ADD A PLATE: drop the file in its folder, add it to the album's list in
  gallery-data.js and its size to GALLERY_SIZES. It appears in the group on
  the right page (which scrolls if it runs long) and in the admin preview.
- TO ADD A SPREAD: copy a `<section class="spread">` block in index.html with
  a new id, data-title and two pages (each with a heading carrying
  tabindex="-1"); give it a tab in `.tabs` if it should be in the index.
  book.js numbers the folios and counts the views itself. Keep the book at
  ten spreads or fewer.
- Plate I is also named in a `<link rel="preload">` in the head so it loads
  first; change it if the first picture of the first album changes.
- Pressing a plate opens the "loose print": the `[data-print]` dialog with
  the picture large on the board, its label, and arrows through the album.
  Escape puts it back; focus returns to the plate.

- The label grammar is plate number, "Untitled", and (frontispiece and
  loose print only) the album name. There is deliberately NO medium line:
  Irene has not confirmed what each piece is made with, and the old
  per-album guess was visibly wrong for several plates. When she does,
  add data-medium per plate and re-enable the line in plates.js.

## Workshop Dates — the Programme spread
- Each date ("18 Saturday 14:00 · Watercolour basics") is a real
  `button.workshop` drawn as a ruled catalogue line; pressing it opens the
  BOOKING SLIP (`dialog[data-booking]`, a native <dialog>: Tab stays
  inside, Escape closes, focus returns to the date). signup.js keys off
  `.signup`, `.signup__submit`, `[data-category-open][data-category=
  "workshop"]`, `.workshops__month`, `.workshops__month-name`,
  `.workshop__day/weekday/time/topic`; the row it saves is exactly name,
  surname, phone, attendees, workshop_month, workshop_date, workshop_topic.
  "Done" and "Book another date" press `[data-booking-close]`.
- content.js injects months into `#workshop-dates .workshops__grid` and
  dispatches `content:updated`. index.html ships NO dates: the grid holds one
  honest line (`.workshops__empty`, "Irene has not announced the next dates
  yet") that stays when nothing is saved and is reworded to "could not be
  loaded" when the request fails. Never type sample dates into index.html.
- The intro copy is written; VENUE AND COST are not known yet. The line
  "Venue and cost are confirmed with you when you book" has an HTML comment
  above it marking where to fill them in once Irene decides.

## Contact spread
- Left page: the message form (`[data-contact-form]`, contact.js) with
  visible labels. Right page: Facebook and Instagram with the profile
  pictures, "Turn to the Programme", and the colophon with © 2026 Irene
  Ellis Art, the typefaces and the quiet Admin link.
- The drifting landscape SVG that used to sit here is gone (it was 256 KB
  of hand-tuned paths the new world has no use for).

## Content rules
- Readable font for: the story, the offer line, the dates, the labels and
  contact details. The script is decoration for titles only.
- Contact email placeholder: ireneellisart613@gmail.com (may change
  to sales@ireneellisart.co.za later — placeholder for now).
- Ignore the old Wix link entirely; it's not part of this site.
- Nothing is invented: no testimonials, prices, venue, sizes or years.

## Head / meta
- The canonical link and the og:url / og:image tags spell out the FULL
  address (https://xellis-cs.github.io/stiaan-irene-site/) — sharing
  previews are built by other servers, so they cannot be relative. If the
  site ever moves to a custom domain or another host, change all four.
- theme-color is the board's dark #2a2826 so phone browser bars match.

## Admin page (/admin) — content editor
- Reached at `/admin`; Supabase login gates it (see admin/ files). Dark
  #2A2826 background, tan (#f4efe4) section panels, white month/album cards.
  Out of scope for the redesign: it is unchanged and must keep working.
- Portfolio section: each album's **Preview** button opens the dark display
  panel from `showcase.css` + `showcase.js` (now admin-only), reading the
  SAME `gallery-data.js` images the site's plates use.
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

## Keyboard and screen readers
- The skip link is the first Tab stop and goes to the page index (the tabs).
  Every control shares one rose-red :focus-visible ring (style.css, BASE).
  Visible controls are ≥44px. Pages not on show are inert. Dialogs are
  native <dialog>s (focus trapped, Escape closes, focus returns).

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
- PRODUCT.md holds the product facts; `.impeccable/surfaces/index-html.md`
  holds the surface brief with the direction contract this build follows.

## How I want you to work with me
- I am a beginner learning as I build. Explain choices simply.
- Work one section or one concern at a time. Do not build ahead.
- Before committing to anything ambiguous, ask me to clarify first.
