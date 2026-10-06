// The book — one open sketchbook whose pages TURN instead of scrolling.
//
// HOW IT IS BUILT
// index.html is a list of spreads (<section class="spread">), each holding
// two pages (<article class="page">). On a computer a spread is on show:
// its left page and its right page side by side, the coil between them. On
// a phone ONE page is on show at a time, in the same order. The same HTML
// serves both — CSS decides whether a page is half the book or all of it,
// and this script works in "views": a view is a spread on a computer and a
// single page on a phone.
//
// THE TURN
// A page turn is two flat pages rotating in 3D about the gutter, one after
// the other: the page that lifts rotates from flat to standing on its edge
// (0 to 90 degrees), and the page that lands rotates from standing on its
// edge down to flat. At the moment of the hand-over both are edge-on and
// invisible, so the swap cannot be seen. Each page carries a shade that
// darkens as it stands up, and a soft shadow is cast on the page below. The
// whole motion is sampled from ONE easing curve (TURN_SNAP) so every part
// moves in step; it is played with the browser's own animation engine
// (element.animate), no library. People who prefer reduced motion get the
// page change with no 3D at all.
//
// WHAT TURNS A PAGE
// The lifted corner, the arrows, the tabs and the pinned slip; the keyboard
// (Left/Right always; PageUp/PageDown and Home/End only once the page's own
// text, if it scrolls, is at its end — before that they scroll the text,
// as they do anywhere); a sideways swipe; a deliberate wheel or trackpad
// gesture (never while a page's own text is scrolling);
// and the browser's Back and Forward buttons, because every spread has its
// own #hash and each turn is written into the browser history.
(function () {
  "use strict";

  var book = document.querySelector("[data-book]");
  if (!book) return;
  var spreads = [].slice.call(book.querySelectorAll("[data-spread]"));
  var pages = [].slice.call(book.querySelectorAll("[data-page]"));
  if (!spreads.length || !pages.length) return;

  // ---- KNOBS ---------------------------------------------------------
  var TURN_MS = 720; // how long a turn takes on a computer
  var TURN_MS_SINGLE = 600; // and on a phone (one page; the low end of the 600–800ms the design asks)
  // The easing is an exponential ease-out: the page leaves fast and settles
  // slowly, like a page let go. Bigger = snappier start. At 3.5 the page is
  // standing on its edge about a quarter of the way through the turn and
  // visibly settles over the last tenth; at 5 it flicked over in the first
  // fifth and then sat still for half a second.
  var TURN_SNAP = 3.5;
  var TURN_SNAP_SINGLE = 3;
  // The hand gets the book back a little before the motion fully ends: the
  // corners fade back in and the dates take clicks while the landing page
  // settles its last few degrees, instead of every press in that window
  // being silently dropped.
  var TURN_RELEASE = 0.85;
  var SWIPE_MIN = 48; // px of sideways travel that counts as a swipe
  var WHEEL_MIN = 160; // accumulated wheel movement that counts as "deliberate"
  var WHEEL_LOCK = 1100; // ms before the wheel may turn another page
  // Old links to the site used these names; they still land on the right spread
  var ALIASES = {
    about: "artist",
    hero: "title",
    main: "title",
    "workshop-dates": "programme",
    workshops: "programme",
    portfolio: "plates-1",
    plates: "plates-1",
    footer: "contact",
  };

  // One page at a time on phones and on tablets held upright. The same
  // query is written in style.css (the PHONES block): keep them identical.
  var SINGLE = window.matchMedia("(max-width: 720px), (max-width: 1000px) and (orientation: portrait)");
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)");

  var announce = document.querySelector("[data-announce]");
  var countEl = document.querySelector("[data-count]");
  var tabs = [].slice.call(document.querySelectorAll(".tab[href^='#']"));
  var casts = {}; // the cast-shadow layers, made below

  var current = 0; // the view on show (spread index, or page index on a phone)
  var turning = false;
  var started = false; // true once the first view has been drawn

  // ---- the model: views, pages, spreads --------------------------------
  function single() {
    return SINGLE.matches;
  }
  function viewCount() {
    return single() ? pages.length : spreads.length;
  }
  function pagesOf(view) {
    if (single()) return pages[view] ? [pages[view]] : [];
    return spreads[view] ? [].slice.call(spreads[view].querySelectorAll("[data-page]")) : [];
  }
  function spreadOf(view) {
    var p = pagesOf(view)[0];
    return p ? p.closest("[data-spread]") : null;
  }
  function clamp(v) {
    return Math.max(0, Math.min(viewCount() - 1, v));
  }
  function sectionOf(spread) {
    return spread ? spread.id.replace(/(-\d+)+$/, "") : "";
  }
  // the first view that shows a given spread
  function viewForSpread(spread) {
    if (!single()) return Math.max(0, spreads.indexOf(spread));
    var first = spread.querySelector("[data-page]");
    return Math.max(0, pages.indexOf(first));
  }
  // The #hash a view is known by. A spread's id, except on a phone, where a
  // right-hand page that carries an id of its own (the dates page is
  // #workshop-dates) is named by that id, so a reload, the Back button or a
  // copied link come back to THAT page and not to the spread's first page.
  function hashFor(view) {
    var s = spreadOf(view);
    if (!s) return "";
    var page = pagesOf(view)[0];
    if (single() && page && page !== s.querySelector("[data-page]")) {
      var own = page.querySelector("[id]:not(input):not(button):not(select):not(textarea):not(form)");
      if (own) return own.id;
    }
    return s.id;
  }
  function viewForHash(hash) {
    var id = (hash || "").replace(/^#/, "");
    if (!id) return 0;
    // an old name only stands in when nothing on the page has that id
    if (!document.getElementById(id) && ALIASES[id]) id = ALIASES[id];
    var spread = document.getElementById(id);
    if (spread && spread.hasAttribute("data-spread")) return viewForSpread(spread);
    // a link to something inside a page (an id on the page) opens that page:
    // on a phone the very page it is on, on a computer its spread
    var inside = spread && spread.closest("[data-spread]");
    if (inside) {
      if (single()) return Math.max(0, pages.indexOf(spread.closest("[data-page]")));
      return viewForSpread(inside);
    }
    return null;
  }

  // ---- page states ------------------------------------------------------
  // "on": shown. "staged": laid out but invisible, so its pictures load
  // before it is turned to. "off": not drawn at all. Pages that are not on
  // show are inert and hidden from screen readers, so a reader hears only
  // the pages a sighted visitor sees.
  function setState(page, state) {
    page.setAttribute("data-state", state);
    var off = state !== "on";
    page.inert = off;
    if (off) page.setAttribute("aria-hidden", "true");
    else page.removeAttribute("aria-hidden");
  }
  function render(view) {
    var on = pagesOf(view);
    var near = pagesOf(view - 1).concat(pagesOf(view + 1));
    pages.forEach(function (p) {
      setState(p, on.indexOf(p) > -1 ? "on" : near.indexOf(p) > -1 ? "staged" : "off");
    });
    var spread = spreadOf(view);
    spreads.forEach(function (s) {
      s.classList.toggle("is-current", s === spread);
    });
    // the index: the tab of the SECTION on show is the open one. A section
    // is a spread's id without its numbers, so plates-1, plates-1-2 and
    // plates-3 are all "plates" and the Plates tab stays out for all of them.
    tabs.forEach(function (t) {
      var v = viewForHash(t.getAttribute("href"));
      var isHere = v !== null && sectionOf(spreadOf(v)) === sectionOf(spread);
      if (isHere) t.setAttribute("aria-current", "page");
      else t.removeAttribute("aria-current");
    });
    // arrows and corners have nothing to do at either end of the book
    var atStart = view === 0;
    var atEnd = view === viewCount() - 1;
    document.querySelectorAll("[data-turn]").forEach(function (b) {
      var d = parseInt(b.getAttribute("data-turn"), 10);
      var dead = (d < 0 && atStart) || (d > 0 && atEnd);
      if (b.classList.contains("corner")) b.hidden = dead;
      else b.disabled = dead;
    });
    if (countEl) countEl.textContent = view + 1 + " / " + viewCount();
    book.setAttribute("data-view", String(view));
    markScrollers();
  }

  // A page with more below it than fits wears .is-scrollable (its last
  // lines fade) until it has been scrolled to the end.
  function markScrollers() {
    pagesOf(current).forEach(function (p) {
      var body = p.querySelector(".page__body--scroll");
      if (!body) return;
      var more = body.scrollHeight > body.clientHeight + 2;
      body.classList.toggle("is-scrollable", more);
      body.classList.toggle("is-at-end", !more || body.scrollTop + body.clientHeight >= body.scrollHeight - 2);
    });
  }
  book.addEventListener(
    "scroll",
    function (e) {
      var body = e.target;
      if (!body.classList || !body.classList.contains("page__body--scroll")) return;
      body.classList.toggle("is-at-end", body.scrollTop + body.clientHeight >= body.scrollHeight - 2);
    },
    true
  );
  document.addEventListener("content:updated", markScrollers);

  // ---- folios: the page numbers at every foot ----------------------------
  // Written here rather than by hand so adding a page never means
  // renumbering the rest. The title page carries no number, as in a book.
  pages.forEach(function (page, i) {
    var folio = document.createElement("p");
    folio.className = "folio";
    var spread = page.closest("[data-spread]");
    var title = spread ? spread.getAttribute("data-title") : "";
    var num = document.createElement("span");
    num.className = "folio__num";
    num.textContent = String(i + 1);
    if (page.classList.contains("page--right")) {
      var sec = document.createElement("span");
      sec.className = "folio__section";
      sec.textContent = title;
      folio.appendChild(sec);
      folio.appendChild(num);
    } else {
      folio.appendChild(num);
      var mark = document.createElement("a");
      mark.className = "folio__mark";
      mark.href = "#title";
      mark.textContent = "Irene Ellis Art";
      folio.appendChild(mark);
    }
    if (i === 0) folio.classList.add("folio--title");
    page.appendChild(folio);

    // the shade that darkens a page as it stands up during a turn
    var shade = document.createElement("div");
    shade.className = "page__shade";
    shade.setAttribute("aria-hidden", "true");
    page.appendChild(shade);
  });

  // the two soft shadows cast on the pages below a turning page
  ["left", "right"].forEach(function (side) {
    var c = document.createElement("div");
    c.className = "cast cast--" + side;
    c.setAttribute("aria-hidden", "true");
    book.appendChild(c);
    casts[side] = c;
  });

  // ---- the turn ----------------------------------------------------------
  // Exponential ease-out, normalised so it ends exactly at 1.
  function ease(t, k) {
    return (1 - Math.pow(2, -k * t)) / (1 - Math.pow(2, -k));
  }
  // The motion is sampled into N keyframes along ONE curve, so the lifting
  // page, the landing page, their shades and the cast shadows all move in
  // step. The browser interpolates between samples.
  function samples(k) {
    var N = 40;
    var out = [];
    for (var i = 0; i <= N; i++) {
      var t = i / N;
      out.push({ t: t, p: ease(t, k) });
    }
    // Two extra samples either side of the hand-over (p = 0.49 and 0.51), so
    // the swap of the two pages is a true step and not an 18ms crossfade in
    // which a grey sliver of the edge-on page pokes above the book.
    [0.49, 0.51].forEach(function (p) {
      var t = -Math.log2(1 - p * (1 - Math.pow(2, -k))) / k;
      out.push({ t: t, p: p });
    });
    out.sort(function (a, b) {
      return a.t - b.t;
    });
    return out;
  }
  function hump(x) {
    // 0 → 1 → 0 as x goes 0 → 1
    return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x);
  }
  function frames(list, fn) {
    return list.map(function (s) {
      var f = fn(s.p);
      f.offset = s.t;
      return f;
    });
  }
  var OPTS = function (ms) {
    return { duration: ms, easing: "linear", fill: "forwards" };
  };

  function animateTurn(from, to, done) {
    var dir = to > from ? 1 : -1;
    var fromPages = pagesOf(from);
    var toPages = pagesOf(to);
    var lifting, landing, under, liftSign, castNear, castFar;

    if (single()) {
      // one page: forward, the page on show lifts away over the coil;
      // back, the earlier page comes down from the coil onto it
      lifting = dir > 0 ? fromPages[0] : null;
      landing = dir < 0 ? toPages[0] : null;
      under = dir > 0 ? toPages[0] : fromPages[0];
      liftSign = -1; // the coil is the left edge: the page swings left
      castNear = casts.left;
      castFar = null;
    } else if (dir > 0) {
      // forward: the right page lifts about the gutter and the next
      // spread's left page lands on the left
      lifting = fromPages[1];
      landing = toPages[0];
      liftSign = -1;
      castNear = casts.right; // the shadow it throws as it rises
      castFar = casts.left; // the shadow it throws as it lands
    } else {
      lifting = fromPages[0];
      landing = toPages[1];
      liftSign = 1;
      castNear = casts.left;
      castFar = casts.right;
    }

    // what is on show during the turn: the pages beneath, plus the two in motion
    pages.forEach(function (p) {
      var keep = fromPages.indexOf(p) > -1 || toPages.indexOf(p) > -1;
      if (keep) setState(p, "on");
      else if (pagesOf(to - 1).concat(pagesOf(to + 1)).indexOf(p) > -1) setState(p, "staged");
      else setState(p, "off");
    });
    // The pages being left still paint during the turn but take no focus:
    // a Tab pressed right after the arrow key must not land on a heading
    // that is about to vanish. If focus is on one of them it is let go of
    // deliberately here; afterTurn() puts it on the new page's heading.
    fromPages.forEach(function (p) {
      if (toPages.indexOf(p) > -1) return;
      if (document.activeElement && p.contains(document.activeElement)) document.activeElement.blur();
      p.inert = true;
    });
    // the pages in motion sit above the rest, and nothing is clickable
    // until the page has landed
    book.classList.add("is-turning");
    turning = true;
    if (lifting) lifting.classList.add("is-lifting");
    if (landing) landing.classList.add("is-landing");
    void under; // (the pages beneath need nothing: they are simply on)

    var ms = single() ? TURN_MS_SINGLE : TURN_MS;
    var S = samples(single() ? TURN_SNAP_SINGLE : TURN_SNAP);
    var anims = [];

    if (lifting) {
      anims.push(
        lifting.animate(
          frames(S, function (p) {
            var a = liftSign * 90 * Math.min(1, p * 2);
            return { transform: "rotateY(" + a + "deg)", opacity: p < 0.5 ? 1 : 0 };
          }),
          OPTS(ms)
        )
      );
      anims.push(
        lifting.querySelector(".page__shade").animate(
          frames(S, function (p) {
            return { opacity: 0.55 * Math.min(1, p * 2) };
          }),
          OPTS(ms)
        )
      );
    }
    if (landing) {
      anims.push(
        landing.animate(
          frames(S, function (p) {
            var a = -liftSign * 90 * Math.max(0, (1 - p) * 2);
            return { transform: "rotateY(" + a + "deg)", opacity: p < 0.5 ? 0 : 1 };
          }),
          OPTS(ms)
        )
      );
      anims.push(
        landing.querySelector(".page__shade").animate(
          frames(S, function (p) {
            return { opacity: 0.55 * Math.max(0, (1 - p) * 2) };
          }),
          OPTS(ms)
        )
      );
    }
    if (castNear) {
      anims.push(
        castNear.animate(
          frames(S, function (p) {
            return { opacity: 0.32 * hump(p / 0.62) };
          }),
          OPTS(ms)
        )
      );
    }
    if (castFar) {
      anims.push(
        castFar.animate(
          frames(S, function (p) {
            return { opacity: 0.38 * hump((p - 0.36) / 0.64) };
          }),
          OPTS(ms)
        )
      );
    }

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      anims.forEach(function (a) {
        a.cancel(); // drop the animated values; the plain CSS takes over
      });
      if (lifting) lifting.classList.remove("is-lifting");
      if (landing) landing.classList.remove("is-landing");
      book.classList.remove("is-turning");
      turning = false;
      done();
    }
    // release the pointer gate early (see TURN_RELEASE); `turning` stays
    // true until finish() so a request in that window queues correctly
    window.setTimeout(function () {
      if (!finished) book.classList.remove("is-turning");
    }, ms * TURN_RELEASE);
    // the first animation is as long as all the others
    var lead = anims[0];
    if (!lead) return finish();
    lead.onfinish = finish;
    // a safety net: if the tab was hidden mid-turn the browser may never
    // fire onfinish, so land the page anyway
    window.setTimeout(finish, ms + 120);
  }

  // ---- going to a view ------------------------------------------------------
  var queued = null;
  function goTo(target, opts) {
    opts = opts || {};
    target = clamp(target);
    if (target === current && started && !opts.force) {
      // asked for the view already (being) shown: the latest wish is "end
      // here", so a request still waiting from a moment ago is dropped
      if (turning) queued = null;
      return;
    }
    if (turning) {
      queued = { target: target, opts: opts };
      return;
    }
    var from = current;
    current = target;
    started = true;

    if (opts.history !== "none") {
      var url = "#" + hashFor(target);
      var state = { view: target, single: single() };
      if (opts.history === "replace") {
        // On first load, keep the address as the visitor typed it. Adding a
        // #hash while the page is still loading makes the browser treat that
        // spread as "the place you jumped to", and the Tab key then starts
        // from there instead of from the skip link at the top.
        history.replaceState(state, "", location.hash ? url : location.pathname + location.search);
      } else {
        history.pushState(state, "", url);
      }
    }

    function landed() {
      render(target);
      afterTurn(target, opts);
      if (queued) {
        var q = queued;
        queued = null;
        goTo(q.target, q.opts);
      }
    }

    if (opts.instant || REDUCE.matches || from === target) {
      landed();
      return;
    }
    animateTurn(from, target, landed);
  }

  function afterTurn(view, opts) {
    var spread = spreadOf(view);
    var title = spread ? spread.getAttribute("data-title") : "";
    if (announce) {
      announce.textContent = "Page " + (view + 1) + " of " + viewCount() + ", " + title;
    }
    // Focus moves to the heading of the page now on show, so a keyboard or
    // screen-reader user carries on from the top of the new page. Not on
    // first load (that would steal focus from the address bar), and not
    // while a slip or print is open on top of the book.
    if (!opts.silent && !document.querySelector("dialog[open]")) {
      var first = pagesOf(view)[0];
      var heading = first && first.querySelector("h1[tabindex], h2[tabindex]");
      if (heading) heading.focus({ preventScroll: true });
    }
    // a page that scrolls inside starts at its top each time it is turned to
    pagesOf(view).forEach(function (p) {
      var body = p.querySelector(".page__body");
      if (body) body.scrollTop = 0;
    });
  }

  function turn(dir) {
    goTo(current + dir);
  }

  // ---- what turns the pages ---------------------------------------------------
  // Arrows and corners
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-turn]");
    if (!b || b.disabled) return;
    turn(parseInt(b.getAttribute("data-turn"), 10));
  });

  // Tabs, the slip, the folio wordmark, "Turn to the Programme": any link to
  // a spread turns the pages to it instead of jumping
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href^='#']");
    if (!a || a.classList.contains("skip-link")) return;
    var view = viewForHash(a.getAttribute("href"));
    if (view === null) return;
    e.preventDefault();
    goTo(view);
  });

  // Keyboard. Not while typing in a field, and not while a slip or a print
  // is open on top of the book (those have their own keys).
  document.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (document.querySelector("dialog[open]")) return;
    var t = e.target;
    if (t && (t.matches("input, textarea, select, [contenteditable]") || t.isContentEditable)) return;
    // Inside a page that scrolls, the paging keys page the TEXT first (the
    // browser does that itself when the key is left alone); they turn the
    // book only once the text is at the end they are heading for — the same
    // rule the wheel follows.
    var sc = t && t.closest && t.closest(".page__body--scroll");
    if (sc) {
      var down = e.key === "PageDown" || e.key === "End";
      var up = e.key === "PageUp" || e.key === "Home";
      if (down && sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1) return;
      if (up && sc.scrollTop > 0) return;
    }
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
        e.preventDefault();
        turn(1);
        break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        turn(-1);
        break;
      case "Home":
        e.preventDefault();
        goTo(0);
        break;
      case "End":
        e.preventDefault();
        goTo(viewCount() - 1);
        break;
    }
  });

  // A sideways swipe (finger or pen). Vertical movement is left to the page
  // so its text can still scroll.
  var swipe = null;
  book.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" || e.button) return;
    swipe = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  book.addEventListener("pointerup", function (e) {
    if (!swipe || e.pointerId !== swipe.id) return;
    var dx = e.clientX - swipe.x;
    var dy = e.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.4) {
      turn(dx < 0 ? 1 : -1);
    }
  });
  book.addEventListener("pointercancel", function () {
    swipe = null;
  });

  // The mouse wheel or trackpad. A page whose text can still scroll keeps
  // the wheel for itself; otherwise a deliberate amount of movement turns
  // the page, and then the wheel rests for a moment so one flick is one page.
  //
  // One gesture, one job: a trackpad flick that scrolled the story keeps
  // streaming small "momentum" events for a second or two after the text
  // has reached its end. Those must never add up to a page turn — so once a
  // gesture has been given to the text, every event that follows within
  // 200ms of the last (no trackpad pauses that long mid-gesture) belongs to
  // the same gesture and is ignored for turning. The next fresh flick, after
  // a pause, turns the page as before.
  var wheelSum = 0;
  var wheelLockUntil = 0;
  var lastWheelAt = 0;
  var wheelHeld = false; // true while the current gesture belongs to the text
  var lastInnerScroll = 0;
  book.addEventListener(
    "scroll",
    function () {
      lastInnerScroll = performance.now();
    },
    true // scrolling inside any page bubbles nowhere, so listen in capture
  );
  document.querySelector(".board").addEventListener(
    "wheel",
    function (e) {
      if (document.querySelector("dialog[open]")) return;
      var now = performance.now();
      var scroller = e.target.closest && e.target.closest(".page__body--scroll");
      var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (scroller && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        var canDown = scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1;
        var canUp = scroller.scrollTop > 0;
        if ((e.deltaY > 0 && canDown) || (e.deltaY < 0 && canUp)) {
          wheelSum = 0;
          wheelHeld = true;
          lastWheelAt = now;
          return; // the page is scrolling; leave it alone
        }
        // it has just reached its end: give the hand a moment before a
        // continued scroll turns the page
        if (now - lastInnerScroll < 500) {
          wheelHeld = true;
          lastWheelAt = now;
          return;
        }
      }
      e.preventDefault();
      if (wheelHeld) {
        if (now - lastWheelAt < 200) {
          lastWheelAt = now;
          return; // still the gesture that scrolled the text
        }
        wheelHeld = false;
      }
      // movement only adds up within one gesture: a pause of 320ms starts afresh
      if (now - lastWheelAt > 320) wheelSum = 0;
      lastWheelAt = now;
      if (now < wheelLockUntil) return;
      wheelSum += delta;
      if (Math.abs(wheelSum) >= WHEEL_MIN) {
        turn(wheelSum > 0 ? 1 : -1);
        wheelSum = 0;
        wheelLockUntil = now + WHEEL_LOCK;
      }
    },
    { passive: false }
  );

  // The browser's Back and Forward buttons
  window.addEventListener("popstate", function (e) {
    var view = null;
    if (e.state && typeof e.state.view === "number" && e.state.single === single()) view = e.state.view;
    if (view === null) view = viewForHash(location.hash);
    if (view === null) view = 0;
    goTo(view, { history: "none" });
  });

  // ---- the coil ---------------------------------------------------------------
  // Fills the gutter with rings sized to the book's height, and refills it
  // when the window changes. One <use> per ring of the symbol in index.html.
  var coilSvg = book.querySelector(".coil__svg");
  var coilKey = "";
  function fillCoil() {
    if (!coilSvg) return;
    var h = book.clientHeight;
    var W = single() ? 60 : 120; // the strip's width, in the symbol's own units
    var key = h + "x" + W;
    if (key === coilKey || !h) return;
    coilKey = key;
    var SVGNS = "http://www.w3.org/2000/svg";
    coilSvg.setAttribute("viewBox", "0 0 " + W + " " + h);
    while (coilSvg.firstChild) coilSvg.removeChild(coilSvg.firstChild);
    if (single()) {
      // the edge-on ring, drawn for a right-hand edge, mirrored to the left
      var PERIOD = 34;
      var count = Math.max(1, Math.floor((h - 20) / PERIOD));
      var g = document.createElementNS(SVGNS, "g");
      g.setAttribute("transform", "matrix(-1,0,0,1," + W + ",0)");
      for (var i = 0; i < count; i++) {
        var u = document.createElementNS(SVGNS, "use");
        u.setAttribute("href", "#bindRing");
        u.setAttribute("x", "-15");
        u.setAttribute("y", String(10 + i * PERIOD));
        u.setAttribute("width", "75");
        u.setAttribute("height", "33");
        g.appendChild(u);
      }
      coilSvg.appendChild(g);
    } else {
      var P = 36;
      var n = Math.max(1, Math.floor((h - 16) / P));
      // spread the rings so the last one sits as far from the foot as the
      // first from the head
      var top = (h - (n - 1) * P - 40) / 2;
      for (var j = 0; j < n; j++) {
        var use = document.createElementNS(SVGNS, "use");
        use.setAttribute("href", "#coilRing");
        use.setAttribute("x", "0");
        use.setAttribute("y", String(top + j * P));
        use.setAttribute("width", "120");
        use.setAttribute("height", "40");
        coilSvg.appendChild(use);
      }
    }
  }

  // ---- the booking slip --------------------------------------------------------
  // A workshop date opens the slip (a native <dialog>); signup.js has
  // already read the date off the button and written it into the chip.
  var booking = document.querySelector("[data-booking]");
  if (booking && typeof booking.showModal === "function") {
    var bookingOpener = null;
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest('[data-category-open][data-category="workshop"]');
      if (!b) return;
      bookingOpener = b;
      booking.showModal();
      var firstField = booking.querySelector("#signup-name");
      if (firstField && !firstField.closest("[hidden]")) firstField.focus();
    });
    booking.addEventListener("click", function (e) {
      if (e.target === booking) booking.close(); // a press on the board around it
      var c = e.target.closest && e.target.closest("[data-booking-close]");
      if (c) booking.close();
    });
    booking.addEventListener("close", function () {
      if (bookingOpener && bookingOpener.isConnected) bookingOpener.focus({ preventScroll: true });
      bookingOpener = null;
    });
  }

  // ---- layout changes -------------------------------------------------------------
  // Crossing the phone/computer line changes what a "view" is, so the view
  // number is translated to keep the same spread on show.
  var wasSingle = single();
  function relayout() {
    if (single() !== wasSingle) {
      var spread = spreadOf(current);
      wasSingle = single();
      current = spread ? viewForSpread(spread) : 0;
      render(current);
      history.replaceState({ view: current, single: single() }, "", "#" + hashFor(current));
    }
    fillCoil();
  }
  window.addEventListener("resize", function () {
    relayout();
    markScrollers();
  });
  if (SINGLE.addEventListener) SINGLE.addEventListener("change", relayout);

  // ---- start -------------------------------------------------------------------------
  var startView = viewForHash(location.hash);
  if (startView === null) startView = 0;
  goTo(startView, { instant: true, history: "replace", silent: true, force: true });
  fillCoil();
  window.addEventListener("load", function () {
    fillCoil();
    markScrollers();
  });
})();
