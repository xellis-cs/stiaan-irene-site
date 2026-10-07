---
name: Irene Ellis Art
description: One ring-bound sketchbook, open flat on a dark board, paged like an exhibition catalogue.
colors:
  pink-page: "#eed0c8"
  blush-page: "#f1dfd6"
  rose-endpaper: "#e6b8ab"
  tan-paper: "#f4efe4"
  paper-edge: "#dcc7bb"
  field-white: "#fdfdfd"
  charcoal-ink: "#2c2c2c"
  ink-soft: "rgba(44, 44, 44, 0.8)"
  ink-muted: "rgba(44, 44, 44, 0.72)"
  dusty-rose: "#8f5f50"
  rose-ink: "#6e4336"
  rose-red: "#a8465a"
  error-rose: "#8c2f41"
  placeholder: "#6f6460"
  board-dark: "#2a2826"
  light-on-board: "#f1dfd6"
  light-on-board-muted: "rgba(241, 223, 214, 0.72)"
  rule-soft: "rgba(44, 44, 44, 0.16)"
  rule: "rgba(44, 44, 44, 0.24)"
  rule-strong: "rgba(44, 44, 44, 0.4)"
  coil-wire: "#3a322d"
  coil-highlight: "#6b615b"
typography:
  wordmark:
    fontFamily: "Pinyon Script, Pinyon Fallback, Times New Roman, serif"
    fontSize: "clamp(2.9rem, calc(var(--u) * 8.4), 6rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "normal"
  display:
    fontFamily: "Pinyon Script, Pinyon Fallback, Times New Roman, serif"
    fontSize: "clamp(2.2rem, calc(var(--u) * 5.8), 4.2rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  headline:
    fontFamily: "Libre Franklin, Franklin Fallback, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(12.5px, calc(var(--u) * 1.6), 15.5px)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.14em"
  title:
    fontFamily: "Libre Caslon Text, Caslon Fallback, Georgia, serif"
    fontSize: "clamp(19px, calc(var(--u) * 2.7), 28px)"
    fontWeight: 400
    lineHeight: 1.38
    letterSpacing: "normal"
  numeral:
    fontFamily: "Libre Caslon Text, Caslon Fallback, Georgia, serif"
    fontSize: "clamp(22px, calc(var(--u) * 3.4), 34px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
    fontFeature: "tabular-nums lining-nums"
  body:
    fontFamily: "Libre Caslon Text, Caslon Fallback, Georgia, serif"
    fontSize: "clamp(16px, calc(var(--u) * 2.05), 21px)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  small:
    fontFamily: "Libre Caslon Text, Caslon Fallback, Georgia, serif"
    fontSize: "clamp(12.5px, calc(var(--u) * 1.6), 15.5px)"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "normal"
  label:
    fontFamily: "Libre Franklin, Franklin Fallback, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(12px, calc(var(--u) * 1.35), 13.5px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.14em"
  button:
    fontFamily: "Libre Franklin, Franklin Fallback, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(12.5px, calc(var(--u) * 1.6), 15.5px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  none: "0"
  slip: "1px"
  sheet: "2px"
  field: "3px"
  cover: "4px"
  tab: "0 5px 5px 0"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  page-pad: "clamp(22px, calc(var(--u) * 5.6), 56px)"
  gutter-pad: "30px"
components:
  button-tab:
    backgroundColor: "{colors.tan-paper}"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.field}"
    padding: "0 24px"
    height: "44px"
  button-tab-hover:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.charcoal-ink}"
  button-tab-on-slip:
    backgroundColor: "{colors.pink-page}"
    textColor: "{colors.charcoal-ink}"
  button-tab-on-slip-hover:
    backgroundColor: "{colors.blush-page}"
    textColor: "{colors.charcoal-ink}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.field}"
    padding: "0 24px"
    height: "44px"
  slip-pinned:
    backgroundColor: "{colors.tan-paper}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.slip}"
    padding: "0 clamp(20px, calc(var(--u) * 2.8), 36px)"
    height: "clamp(52px, calc(var(--u) * 6.5), 76px)"
  field:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
    height: "44px"
  index-tab:
    backgroundColor: "{colors.tan-paper}"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.tab}"
    padding: "12px 0"
    width: "44px"
    height: "108px"
  index-tab-hover:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.charcoal-ink}"
  index-tab-current:
    backgroundColor: "{colors.pink-page}"
    textColor: "{colors.charcoal-ink}"
  page-left:
    backgroundColor: "{colors.blush-page}"
    textColor: "{colors.charcoal-ink}"
    rounded: "2px 0 0 2px"
    padding: "{spacing.page-pad}"
  page-right:
    backgroundColor: "{colors.pink-page}"
    textColor: "{colors.charcoal-ink}"
    rounded: "0 2px 2px 0"
    padding: "{spacing.page-pad}"
  booking-sheet:
    backgroundColor: "{colors.tan-paper}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.sheet}"
    padding: "38px 32px 32px"
    width: "min(92vw, 540px)"
  workshop-line:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 4px 8px 0"
    height: "48px"
---

# Design System: Irene Ellis Art

## Overview

**Creative North Star: "The Artist's Sketchbook, Paged Like a Catalogue"**

The whole site is one object: a ring-bound sketchbook lying open on a dark board. There is no page that scrolls; the visitor turns pages, and anything longer than a page scrolls inside that page. The sketchbook supplies the materials (blush and pink paper, tan fore-edges, a rose endpaper, a charcoal wire coil, dandelion seeds in a margin) and the exhibition catalogue supplies the grammar: Roman plate numbers, small label blocks under every picture, hairline rules, wide margins, folios at every page foot, one picture to a page at full size.

The density is a printed page's, not a web page's. Every measurement on the paper is taken in `--u`, one hundredth of the book's height, so type, margins and pictures grow together like print, inside clamps that keep body text at 16px or more. The interface recedes into catalogue furniture: fore-edge tabs for the index, folio numbers, a lifted page corner that turns the page, and one pinned paper slip for the primary action. The paintings are the only strong colour on the paper.

Confirmed rejections, from the build and the direction contract: the scrolling portfolio (hero, grid, form), card stacks and cards-in-cards, a dark showcase panel, drifting ornament, pill buttons, icon tiles, and dark slab buttons on the paper.

**Key Characteristics:**
- One book at one scale: an A4 landscape spread that fills what the board leaves, a single portrait page on phones
- Three paper colours with jobs (blush left, pink right, tan for anything that is a separate piece of paper)
- Three type roles with hard borders: script for titles, Caslon for everything read, Franklin for everything scanned
- Hairline rules at exactly three strengths; tracked capitals at exactly two trackings
- Depth is physical (paper over paper, light from above), never decorative
- Motion is the page turn and small hover shifts; nothing drifts

## Colors

A warm, low-saturation paper palette on a near-black board; the only reds are the pin, the focus ring and an error.

### Primary
- **Dusty Rose** (`dusty-rose`): the accent for RULES and large numerals only, and the edge of every form field and paper-tab button. It measures 3.7–4.7:1 on the papers, enough for a line or a 22px+ numeral, not for small text.
- **Rose Ink** (`rose-ink`): the same rose, deep enough for SMALL text (5.8:1 on pink): plate numbers, the workshop day numbers, the date arrow, a field's hover edge, a button's hover edge.

### Secondary
- **Rose-Red** (`rose-red`): the pin's head, the keyboard focus ring, the close X on a dialog, a field's focused edge, the text caret. It is a marker colour and never sets text.
- **Error Rose** (`error-rose`): the rose-red deepened to read as text (5.6:1 on pink): error hints and the invalid field's edge.

### Neutral
- **Charcoal Ink** (`charcoal-ink`): all readable copy, headings in every face, button labels.
- **Ink Soft** / **Ink Muted** (`ink-soft`, `ink-muted`): captions, field labels, the roles line, the folio, the workshop topic; both pass 4.5:1 on every paper.
- **Blush Page** (`blush-page`): the left-hand page. **Pink Page** (`pink-page`): the right-hand page. A page's paper colour is also the wash that fades a scrolling page's last lines.
- **Tan Paper** (`tan-paper`): anything that is a separate piece of paper laid on or cut into the book: the fore-edge stripes, the index tabs, the pinned slip, the booking sheet, the skip link, the submit buttons.
- **Field White** (`field-white`): form fields, the print's mount, and the hover state of tan tabs and buttons.
- **Rose Endpaper** (`rose-endpaper`): the cover's rim showing around the page block; also the text-selection colour.
- **Paper Edge** (`paper-edge`): the shade between the stacked page edges on the fore-edge.
- **Board Dark** (`board-dark`): the board under the book, the coil's holes, the browser theme colour. **Light on Board** / **Light on Board Muted** (`light-on-board`, `light-on-board-muted`): the only text that sits on the board (the arrows, the page count, the print's close X).
- **Rule Soft** / **Rule** / **Rule Strong** (`rule-soft`, `rule`, `rule-strong`): the three hairline strengths. Soft between list items and dates; plain under a label block and around a signup chip; strong under a page heading and as the edge of a quiet button.
- **Coil Wire** / **Coil Highlight** (`coil-wire`, `coil-highlight`): the wire of the ring binding and its catch-light.

### Named Rules
**The Two Roses Rule.** Dusty Rose draws lines and big numerals; Rose Ink sets small text. Never set a 12–16px word in Dusty Rose: it measures under 4.5:1 on every paper.

**The Three Hairlines Rule.** A rule is `rule-soft`, `rule`, or `rule-strong`, always 1px. A fourth strength is not added; six slightly different lines read as uneven, three read as a system.

**The Paper Is The Colour Rule.** Surfaces are paper colours only. The paintings are the only saturated colour on a page; no tint, gradient or coloured panel competes with them.

## Typography

**Display Font:** Pinyon Script (with a metric-matched local Times New Roman Italic fallback)
**Body Font:** Libre Caslon Text 400/700, italic 400 (with a metric-matched local Times New Roman fallback)
**Label Font:** Libre Franklin 400/500/600 (with a metric-matched local Arial fallback)

**Character:** A gallery catalogue's voice. Caslon has set catalogues for a century and carries everything that is read; a Franklin Gothic is what museum wall labels are set in and carries everything that is scanned; the script is the artist's hand on the cover and the chapter titles, and nowhere else. The fallbacks are `size-adjust`ed so the title page does not jump as the web fonts arrive.

### Hierarchy
- **Wordmark** (Pinyon 400, `wordmark` size, 1.02): "Irene Ellis Art", the single h1, at most 7em wide.
- **Display** (Pinyon 400, `display` size, 1): the spread titles on left pages ("The artist", "Programme", the album names, "Get in touch"). Its ampersand is set at 1.35em with zero line-height.
- **Headline** (Franklin 600, `headline` size, 1.3, 0.14em, UPPERCASE): the right-hand page titles, ruled beneath with `rule-strong`.
- **Small Title** (Franklin 500, `label` size, 1.3, 0.14em, UPPERCASE, `ink-soft`): a subheading inside a page ("What to expect", "Be the first to hear", a month name).
- **Title / Lead** (Caslon 400, `title` size, 1.38): the one-line offer on the title page, the story's lead; the booking sheet's heading uses the same size at 500/1.2. Measure 15.4em.
- **Numeral** (Caslon 700, `numeral` size, 1, tabular lining figures, `rose-ink`): the day number on each workshop line and on the signup chip.
- **Body** (Caslon 400, `body` size, 1.5): the story, the intro, the dates, the colophon. Never under 16px.
- **Small** (Caslon 400 or italic, `small` size, 1.35): the label block's "Untitled" line (italic), field labels (italic, `ink-soft`), the album description.
- **Label** (Franklin 400–600, `label` size, 1–1.3, 0.14em, UPPERCASE): plate numbers (600, `rose-ink`), folios, index tabs, the page count, the signup chip's topic line.
- **Button** (Franklin 600, `button` size, 1, 0.08em, UPPERCASE): paper-tab buttons, the pinned slip (whose own clamp runs 12.5–18px), the skip link.
- **Roles** (Caslon capitals at 0.78 of body, 1.7, 0.1em, `ink-soft`): the one line of real capitals under the wordmark, separated by accent-coloured dots. Not small caps: the served Caslon has none.

### Named Rules
**The Script Is For Titles Rule.** Pinyon Script sets the wordmark and the spread titles only. A form heading, a dialog heading, a label or a sentence is never in script.

**The Two Trackings Rule.** Tracked capitals are 0.14em (`--track-label`); buttons are 0.08em (`--track-button`); sentence case is never tracked. The phone index strip's 0.02em is the recorded exception, forced by four words in 204px.

**The One Leading Rule.** Everything read is set at 1.5; labels and titles at 1 to 1.3. No third body leading.

## Layout

The board (`board-dark`) is fixed and fills the window, with 28px above the book, 72px at each side for the tabs and 64px at the foot for the arrows and page count. The book is an A4 landscape spread (ratio 1.414) sized to whatever the board leaves: `--book-h` is the smaller of the free height and the free width over 1.414, and `--u` is one hundredth of it. The spread is two absolutely positioned pages, each 50% wide; a page's margin is `--page-pad` (5.6u, 22–56px) and the gutter side adds `--gutter-pad` (30px) so the coil never sits on words. The page body is the box inside those margins; the folio sits at half a margin from the foot, spanning the margin-to-margin width.

Inside a page there is one column. Long copy scrolls within `.page__body--scroll` with a themed 3px scrollbar and a wash of the page's own paper over its last lines while more remains. A picture page (`.page__body--plate`) centres a single plate whose height is capped at 70u (the portrait, which shares its page with a title, at 58u) and further shrunk by a room formula so its label never slides under the folio at 150–200% zoom.

Vertical rhythm on the paper is in `--u` for anything that should scale with the page (a title's margin below is 1.6u, a page title's 2.4u, a small title sits 3.4u below what precedes it) and in the 4px scale for anything that should not (gaps in a form, a label's 12px above the hairline, 8px below it).

**Breakpoints.** One line, written identically in style.css and book.js: `(max-width: 720px), (max-width: 1024px) and (orientation: portrait)`. Below it each page is the whole book, shown one at a time in the same order; the board margins drop to 10px, `--page-pad` to 16–22px with the coil side holding 38px, the wordmark clamps to 2.8rem–4rem (15vw) and the spread title to 2.1rem–3rem (11vw); the index becomes a 64px tan strip along the foot with the arrows at its ends. Under 820px tall the Programme's left page tightens its rhythm so the email form stays in view at 1366×768. The print stylesheet lays every page on white, one spread per sheet.

## Elevation & Depth

Depth is physical. Every shadow is light from above falling from one piece of paper onto another: it always has a downward offset and a soft blur, never a hard edge, never a glow. Surfaces that are part of the page (buttons, fields, rules, label blocks) are flat on the paper; only things that are their own sheet of paper lift: the pinned slip, the index tabs, the plates (which are photographs laid on the page), the booking sheet, the loose print, and the book itself on the board. Depth is also conveyed by material: the page block's layered edge stripes, the coil's holes punched through to the board, and during a turn a shade that darkens the standing page plus two cast shadows across the pages beneath.

### Shadow Vocabulary
- **Paper** (`box-shadow: 0 6px 14px -4px rgba(0,0,0,0.38), 0 1px 2px rgba(0,0,0,0.16)`): the pinned slip at rest, the skip link.
- **Paper lift** (`box-shadow: 0 12px 22px -6px rgba(0,0,0,0.42), 0 2px 4px rgba(0,0,0,0.18)`): the slip on hover and focus.
- **Plate** (`box-shadow: 0 10px 20px -10px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.18)`): a photograph on the page; hover deepens to `0 16px 28px -12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.18)`.
- **Tab** (`box-shadow: 3px 2px 6px -1px rgba(0,0,0,0.45), inset 1px 0 0 rgba(0,0,0,0.06)`): an index tab standing out of the fore-edge; the current tab deepens to `4px 3px 8px -1px rgba(0,0,0,0.5)`. The sideways offset is the tab's own geometry: it sticks out to the right.
- **Sheet** (`box-shadow: 0 30px 60px -16px rgba(0,0,0,0.7), 0 6px 14px -4px rgba(0,0,0,0.4)`): the booking sheet over the book. The loose print uses the same fall as a `drop-shadow` filter so its mount's silhouette casts it.
- **Book** (`box-shadow: 0 40px 70px -24px rgba(0,0,0,0.7), 0 14px 28px -8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)`): the book on the board.
- **Field inset** (`box-shadow: inset 0 1px 2px rgba(0,0,0,0.07)`): a form field's slight recess.
- **Backdrop** (`rgba(20, 16, 14, 0.62)`): the dim over the book behind a dialog.

### Named Rules
**The One Lifted Thing Rule.** On a page, the pinned slip is the only lifted control. A button is a paper tab glued flat to the page and throws no shadow.

**The Light From Above Rule.** Every shadow has a positive y-offset and a blur at least as large as its offset. No hard offset shadows, no glows, no inner shadows except the field's 1px recess.

## Shapes

Paper is cut square. Pages are 2px-cornered on their fore-edge side only; the pinned slip is 1px; the booking sheet 2px; fields, the stepper and the paper-tab buttons barely rounded at 3px (`--radius-field`); the cover's rim 4px. The index tabs are rounded on their outer edge only (`0 5px 5px 0`). The only circles are things that are round in the world: the pin's head, the social profile pictures, the 44px hit areas of the arrows and the close X (transparent at rest, so no circle shows). The pinned slip hangs at -1.6° with its pin turned back +1.6° to stand upright; it straightens to -1° on hover. Every line icon (arrows, X, plus and minus) is a 16–24px stroke at 1.6 with round caps; the workshop line's arrow is an SVG mask filled with `rose-ink`.

## Components

### Buttons
- **Shape:** a paper tab, barely rounded (3px), 44px tall, 24px side padding, a 1px `dusty-rose` hairline edge.
- **Paper tab (submit):** `tan-paper` ground, `charcoal-ink` label in Franklin 600 at 0.08em uppercase. On the tan booking sheet it is cut from `pink-page` instead so it does not vanish into the sheet.
- **Hover / Active:** ground lightens (tan to white; pink to blush on the sheet), edge deepens to `rose-ink`; pressed it sits down 1px. Disabled: 60% opacity with a progress cursor. No shadow in any state.
- **Quiet:** transparent ground with a `rule-strong` edge; hover tints the ground 6% charcoal. Used for "Book another date".
- **Pinned slip (primary action):** a separate sheet of `tan-paper` hung at -1.6° from a rose-red pin, 52–76px tall, label in Franklin 600 at 12.5–18px, with a trailing 1.2em arrow. Carries the Paper shadow; on hover and focus it straightens to -1°, rises 2px, takes the Paper-lift shadow and the arrow moves 3px right. It appears exactly twice: the title page's foot and the back page. It is the only lifted control on a page.
- **Arrows:** 44px circles, transparent, 22px 1.6-stroke chevrons in `light-on-board` under the book (12% blush tint on hover, 30% opacity when disabled) and in the loose print's nav.

### Cards / Containers
There are no cards. The containers are pieces of paper:
- **Page:** `blush-page` on the left, `pink-page` on the right, 2px corners on the fore-edge side, `--page-pad` margins, the folio at the foot.
- **Booking sheet:** `tan-paper`, 2px corners, 32px padding (38px at the top for the pin), the Sheet shadow, at most 540px wide, with a rose-red X written in its corner.
- **Print mount:** the loose print sits on `field-white` with 10px of mount around the picture and the label and count printed on the mount below a `rule` hairline.
- **Label block:** every picture's caption: a `rule` hairline 12px below the picture, 8px of air, then the plate number (Franklin 600, 0.14em caps, `rose-ink`), "Untitled" in Caslon italic, and on the frontispiece and the print the album name in Franklin `ink-muted`. The plate number is the page's h2.

### Inputs / Fields
- **Style:** `field-white` ground, 1px `dusty-rose` edge, 3px corners, 44px minimum, 10px 12px padding, Franklin at 16px or more, a 1px inset recess. Labels are Caslon italic in `ink-soft`, sentence case, above the field; an optional marker in `ink-muted`.
- **Hover / Focus:** edge deepens to `rose-ink` on hover; on keyboard focus the edge turns `rose-red` and the shared focus ring appears at 1px offset.
- **Error:** edge and a 1px inset ring in `error-rose`; the hint line turns `error-rose`.
- **Stepper:** the attendees count is a white box with a 44px minus and plus either side, edges in `dusty-rose`, hover tints blush.
- **Status line:** Franklin `small` in `ink-soft` under the form, 1.4em reserved so the layout does not jump.

### Navigation
- **Index tabs (computer):** four tan tabs standing 38px out of the book's right fore-edge, 44×108px, vertical text in Franklin 500 label caps at 0.14em, the Tab shadow, rounded on the outer edge. Hover slides 3px right and lightens to white; the tab of the section on show is `pink-page`, Franklin 600, slid 5px out with the deeper Tab shadow.
- **Index strip (phone):** a 64px `tan-paper` strip along the foot carrying the four tabs as flat horizontal text at 0.02em with the arrows at its ends; the current tab is a 2px-cornered `pink-page` cell; no shadows on the tabs, the strip throws `0 -4px 12px -4px rgba(0,0,0,0.5)` upward onto the page.
- **Folios:** Franklin label caps at 0.14em in `ink-muted`, page number on the outer side, running title and the wordmark link on the inner; "· continues" appears while a page has more below. The Admin link lives on the last page's folio.
- **Corners:** a 76px lifted paper corner at each page's lower outer edge that turns the page; corners at either end of the book hide.
- **Skip link:** a tan paper tab with the Paper shadow dropping in from the top-left on focus, sentence case, no tracking.
- **Focus ring (every control):** `outline: 2px solid rose-red; outline-offset: 3px; box-shadow: 0 0 0 5px rgba(253,253,253,0.85)`, keyboard focus only. Headings that take focus after a turn show no ring.

### The Workshop Line (signature)
A date is a ruled catalogue line: a full-width transparent button, 48px minimum, with a `rule-soft` hairline beneath. The day number in Caslon 700 numeral size, tabular, `rose-ink`, in a 2.1em column; the weekday in Caslon body; the time in Franklin 500 small `ink-soft`; the topic on a second line in Franklin small `ink-muted`; an 18px `rose-ink` arrow at the right end at 45% opacity that moves 3px and goes to full strength on hover or focus. Hover washes the line 42% white. Pressing it opens the booking sheet, whose chip restates the day, time and topic between two `rule` hairlines.

### The Page Turn (signature)
Two flat pages rotate in 3D about the gutter one after the other, the lifting page 0° to 90° then the landing page 90° to 0°, sampled from one exponential ease-out (`(1 - 2^(-k t)) / (1 - 2^(-k))`, k = 3.5 on a computer, 3 on a phone) into 40 keyframes and played with `element.animate()`: 720ms on a computer, 600ms on a phone. The eye sits at 50 book widths so the standing page stays inside the cover's rim; a shade darkens each page as it stands and two cast layers throw a soft shadow across the pages beneath. Hover transitions elsewhere are 150–200ms ease-out. Under `prefers-reduced-motion: reduce` the page changes instantly and every hover transition is removed; the slip stays at its resting angle.

## Do's and Don'ts

### Do:
- **Do** measure anything on the paper in `--u` (one hundredth of the book's height) inside a clamp, and anything that must not scale in the 4px spacing scale.
- **Do** set every rule at 1px in one of the three hairline strengths, and every tracked line of capitals at 0.14em (labels) or 0.08em (buttons).
- **Do** make a new control out of catalogue furniture: a ruled line, a paper tab, a folio, a label block, a pinned slip.
- **Do** keep body text at 16px or more and check every small colour against the paper it sits on (Rose Ink, Ink Soft, Ink Muted and Error Rose are the four small-text colours that pass).
- **Do** give every control a 44px hit area and the one shared rose-red focus ring.
- **Do** caption every picture with the label block: hairline, plate number, "Untitled", nothing invented.

### Don't:
- **Don't** set anything but the wordmark and the spread titles in Pinyon Script.
- **Don't** put Dusty Rose on small text; it is for rules, field edges and numerals 22px and larger.
- **Don't** lift a button. The pinned slip is the only lifted control on a page; submit buttons are flat paper tabs with no shadow.
- **Don't** add a card, a panel, a pill, an icon tile, a coloured band or a gradient to a page; the paper colours are the only surfaces.
- **Don't** add ornament that moves. The dandelion seeds are static and drawn in the title page's margin; the page turn and small hover shifts are the whole motion vocabulary.
- **Don't** add a fourth hairline strength, a third tracking, a second body leading, or a dark-slab button.
- **Don't** put an eyebrow or kicker line above a heading. The plate number under a picture is the page's heading, not a kicker.
