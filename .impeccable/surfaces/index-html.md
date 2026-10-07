---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: the site (index.html)

Scope: the whole public site, one surface, Persuade mode (the visitor decides to book a workshop). The admin page is out of scope.

Audience and job: adults in South Africa, mostly new to painting, arriving on a phone from a chat link, deciding whether to book one of Irene's watercolour workshops. Secondary visitors want to see the paintings or contact Irene as a speaker or MC.

Action and proof: book a date (the `signups` row), or leave an email for new dates (`notify_list`), or send a message (`messages`). Proof is Irene's own paintings (16 plates in three albums), her portrait, and her story in her words. No testimonials, prices, or venue exist; none may be invented.

Constraints: static HTML, CSS and vanilla JS, no libraries, no build step, relative paths (GitHub Pages sub-path); the three Supabase forms and `content.js` keep working; `/admin` unchanged; pinned brand (palette, dandelion seeds, Pinyon Script wordmark, the ring-bound sketchbook); pages turn instead of scrolling, on phones too; WCAG AA; reduced motion is an instant page change; every page reachable by keyboard and by URL hash.

Unresolved: venue, cost, album names, max people per booking, plate titles (Irene has not named the paintings; labels say "Untitled" with a plate number until she does).

## Direction contract

THESIS: Irene's sketchbook, paged like an exhibition catalogue. The visitor turns the pages of a real artist's book and books a seat from inside it. It refuses the scrolling portfolio (hero, grid, form) and the scrapbook of stickers and tape.

OWN-WORLD: One ring-bound book, open flat on a dark #2A2826 board that fills the viewport edge; pages in blush and pink paper with tan deckled fore-edges, rose endpapers, the charcoal wire coil in the gutter; dandelion seeds are the only ornament. Catalogue grammar on the paper: plate numbers, small label blocks (album · medium · size · year unknown), hairline rules, wide margins, one or two works per spread at real scale. Pinyon Script for the wordmark and spread titles only; a text serif and a label sans chosen for a catalogue voice and recorded in DESIGN.md. Controls are catalogue furniture: fore-edge tabs for the index, folio numbers, a lifting page corner, a pinned booking slip.

STORY: Understands: a working artist, beginners welcome, these dates are real. Believes: I could sit at that table. Does: turns to the Programme and books a date, or leaves an email for new dates.

FIRST VIEWPORT: The book open on its title spread, sized like an A4 sketchbook filling the viewport. Left page: "Irene Ellis Art" large in script, the three roles in small caps under it, one line of offer, and at the foot a pinned slip that is the primary action, "Book a workshop", unmistakably a button. Right page: plate I full to its margins with its label beneath. Down the right fore-edge: tabs About · Programme · Plates · Contact. A folio at each foot and a lifted corner on the right page that reads "turn". Phones: one portrait page at a time, same order (title page, then the plate), tabs become a slim index along the bottom, swipe or tap turns the page.

FORM: Exhibition catalogue, candidate 6 of 7 on the ordered grounded list (the sketchbook world is user-pinned; the catalogue supplies pacing, labels, index and ritual). Seed key 7cc2705e. Signature interaction: the page turn, a CSS 3D flip about the gutter with a soft moving shadow, 600–800 ms, triggered by click, arrow keys, swipe or the tabs; `prefers-reduced-motion` swaps pages instantly; content longer than a page scrolls inside that page.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
