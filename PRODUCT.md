# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing: plain HTML, CSS and vanilla JavaScript with no build step, hosted on
GitHub Pages (https://xellis-cs.github.io/stiaan-irene-site/; Stiaan's own copy
at stiaankoegelenberg.github.io/irene-ellis-art). Data goes to Supabase over its
REST API with the publishable key; row rules are the security. The maintainer is
a beginner (see CLAUDE.md), so code stays readable and explained.

## Users

- Primary (confirmed): adults in South Africa, mostly new to painting, deciding
  whether to book one of Irene's watercolour workshops. Inferred, not confirmed:
  most arrive on a phone from a WhatsApp, Facebook or Instagram link, curious but
  a little intimidated by "art".
- Secondary (confirmed as secondary): people who want to look at Irene's
  artwork; event organisers interested in Irene as a motivational speaker or
  Master of Ceremony. Both are served by the portfolio and the contact form, not
  by their own sales pages.

## Product Purpose

Show Irene's work, let a visitor book a place on a workshop date, leave her a
message, and ask to be told when new dates are announced. Success is a booking
submitted for a real date. A notify sign-up or a message is a secondary success.

## Positioning

A working artist teaching beginners in small groups, in her own voice, with her
own paintings as the material of the site. The story ("all I have ever really
wanted to be is an artist", painting since 2017, faith as part of the journey)
is hers and is not to be flattened into template copy.

## Operating Context

- Workshops are in person; Irene sets the dates (up to four months ahead) in
  /admin, which saves to the `site_content` table and the site redraws from it.
  The dates written into index.html are a fallback.
- Venue and cost are told to the visitor when they book; neither is on the site
  yet (undecided, not to be invented).
- A date button opens the booking form; a booking is a row in `signups`
  (name, surname, phone, attendees, workshop_month, workshop_date,
  workshop_topic). The contact form writes `messages`; the notify form writes
  `notify_list`. Irene reads all three lists in /admin.
- South African conventions: 24-hour times, day-first dates, English copy.

## Capabilities and Constraints

- Static hosting, relative paths (the site is served under a sub-path on
  GitHub Pages), no frameworks, no build step, no third-party JS libraries.
- Supabase row shapes above are fixed; the admin page (/admin) keeps working
  unchanged and is out of scope for the redesign.
- Navigation decision (confirmed 2026-10-06): the site turns pages between
  sections instead of scrolling, on phones as well as desktop; long pages scroll
  inside the page; users who prefer reduced motion get an instant page change;
  every section stays reachable by keyboard and by URL hash.
- Undecided product facts: venue, cost, whether payment is ever taken (none is
  taken through the site today), the three album names (currently a reading of
  the pictures: "Pastel & Gold", "Flora & Fauna", "Graphite Studies"), and the
  maximum people per booking (currently 6).

## Brand Commitments

Binding (confirmed 2026-10-06 by the project owner):
- The brand palette in style.css (pink #eed0c8, blush #f1dfd6, rose #e6b8ab,
  tan #f4efe4, white #fdfdfd, charcoal #2c2c2c, accent #8f5f50, dark #2A2826).
- The dandelion-seed motif.
- The wordmark "Irene Ellis Art" in Pinyon Script.
- The ring-bound sketchbook metaphor: the site is Irene's sketchbook.
Everything else in the current build (fanned card stacks, the FLIP gallery, the
sticky page stack, the layout) may be rebuilt.
Voice: warm, plain, personal, first person where Irene speaks; faith is part of
her story and stays.

## Evidence on Hand

- 16 artworks in images/portfolio/Category 1–3 (JPEG, ~450–800 × 750–1000 px),
  listed in gallery-data.js; one portrait images/irene-ellis.jpg (562 × 1000);
  Facebook and Instagram profile pictures in images/.
- Irene's bio text and the three roles (Artist, Motivational Speaker, Master of
  Ceremony) in index.html.
- Absent, never to be fabricated: testimonials, student work, photographs of a
  workshop in progress, prices, a venue, press.

## Product Principles

1. Her hand is the material: the paintings lead, the interface recedes.
2. Booking is one gesture away from every page.
3. Beginners feel welcome and never judged; copy explains, never assumes.
4. It works on a phone held in one hand, opened from a chat link.
5. Stiaan can maintain it: plain code, each choice explained in a comment.

## Accessibility & Inclusion

WCAG 2.2 AA contrast for all text; page turning operable by keyboard (arrow
keys, Tab to the controls) and by swipe; `prefers-reduced-motion` turns the flip
into an instant change; hidden pages are inert to screen readers; forms keep
their visible labels and live status regions.
