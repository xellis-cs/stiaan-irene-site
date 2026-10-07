// The plates — every picture in the book, drawn from gallery-data.js.
//
// index.html holds EMPTY slots (<div class="plate-slot" …>) and this script
// fills them: the frontispiece on the title spread and the first picture of
// each album, full to its page. Then, for each album, it BUILDS the spreads
// that hold the album's other pictures, two to a spread (one per page, each
// at full size), and puts them straight after the album's title spread. So
// the list in gallery-data.js stays the ONE place that says which pictures
// exist — add a file there and it gets its own page here, with its label and
// plate number, and appears in the admin preview. This script runs before
// book.js, which reads the spreads and pages from the document, so the
// built spreads get folios, hashes (#plates-1-2, #plates-1-3 …) and the
// phone's one-page mode like any written by hand.
//
// Plate numbers run straight through the book in the order the albums are
// listed: album one is plates I–V, album two VI–X, and so on. Irene has not
// titled her pieces, so every label says "Untitled" with its number — the
// honest version of a catalogue label until she names them.
//
// Pressing a plate lifts it off the page: the "loose print" dialog at the
// bottom of index.html shows it large, with arrows through the same album.
(function () {
  "use strict";
  var GALLERY = window.GALLERY;
  if (!GALLERY) return;

  var albums = Object.keys(GALLERY);

  // Every picture in book order, each knowing its album and its number.
  var plates = [];
  albums.forEach(function (album) {
    (GALLERY[album] || []).forEach(function (rel, i) {
      plates.push({ album: album, rel: rel, inAlbum: i, number: plates.length + 1 });
    });
  });

  // Roman numerals, the way catalogues number plates (1 → I, 14 → XIV).
  function roman(n) {
    var table = [
      [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
      [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
    ];
    var out = "";
    table.forEach(function (row) {
      while (n >= row[0]) {
        out += row[1];
        n -= row[0];
      }
    });
    return out;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // One plate: the picture inside a button (press it to lift the print),
  // and the label block beneath. `opts.heading` makes the plate number a
  // real heading — every plate page has no other heading, so each gets one.
  function figureFor(plate, opts) {
    opts = opts || {};
    var fig = el("figure", "plate" + (opts.variant ? " plate--" + opts.variant : ""));
    fig.setAttribute("data-plate", String(plate.number));

    var lift = el("button", "plate__lift");
    lift.type = "button";
    lift.setAttribute("data-print-open", String(plate.number));
    lift.setAttribute("aria-label", "Look at plate " + roman(plate.number) + " on its own");

    var img = document.createElement("img");
    img.className = "plate__img";
    img.src = window.gallerySrc(plate.rel);
    img.alt = "Plate " + roman(plate.number) + ", an untitled work from the album " + plate.album;
    var size = window.GALLERY_SIZES && window.GALLERY_SIZES[plate.rel];
    if (size) {
      img.width = size[0];
      img.height = size[1];
    }
    if (opts.eager) {
      // the one picture in the first view: fetch it first, not lazily
      img.loading = "eager";
      img.setAttribute("fetchpriority", "high");
    } else {
      img.loading = "lazy";
    }
    img.decoding = "async";
    lift.appendChild(img);
    fig.appendChild(lift);

    var cap = el("figcaption", "label");
    var numText = (opts.frontispiece ? "Frontispiece · " : "") + "Plate " + roman(plate.number);
    var num = el(opts.heading ? "h2" : "span", "label__line label__line--num", numText);
    if (opts.heading) num.setAttribute("tabindex", "-1");
    cap.appendChild(num);
    cap.appendChild(el("span", "label__line label__line--title", "Untitled"));
    // No medium line: Irene has not confirmed what each piece is made with,
    // and a guess printed as a catalogue fact is worse than a gap. The album
    // name is only repeated where the plate sits away from its own album
    // spread (the frontispiece); on an album's pages the running head says it.
    if (opts.frontispiece) cap.appendChild(el("span", "label__line label__line--quiet", plate.album));
    fig.appendChild(cap);
    return fig;
  }

  function platesIn(album) {
    return plates.filter(function (p) {
      return p.album === album;
    });
  }

  // Fill every slot in the page: the frontispiece, and each album's first
  // plate. Both are the only thing on their page, so the plate number is the
  // page's heading (focus lands on it after a turn).
  document.querySelectorAll(".plate-slot").forEach(function (slot) {
    var mine = platesIn(slot.getAttribute("data-plate-album"));
    var role = slot.getAttribute("data-plate-role");
    var plate = mine[parseInt(slot.getAttribute("data-plate-index"), 10) || 0];
    if (!plate) return;
    slot.appendChild(
      figureFor(plate, {
        variant: "hero",
        frontispiece: role === "frontispiece",
        heading: true,
        eager: role === "frontispiece",
      })
    );
  });

  // "Plates I to V" on each album's title page, from the list
  document.querySelectorAll("[data-plate-range]").forEach(function (line) {
    var mine = platesIn(line.getAttribute("data-plate-album"));
    if (!mine.length) return;
    var first = roman(mine[0].number);
    var last = roman(mine[mine.length - 1].number);
    line.textContent = mine.length > 1 ? "Plates " + first + " to " + last : "Plate " + first;
  });

  // One page holding one plate, full size
  function platePage(side, plate) {
    var page = el("article", "page page--" + side);
    page.setAttribute("data-page", "");
    var body = el("div", "page__body page__body--plate");
    var slot = el("div", "plate-slot"); // the same wrapper the written slots use: it centres the plate
    slot.appendChild(figureFor(plate, { variant: "hero", heading: true }));
    body.appendChild(slot);
    page.appendChild(body);
    return page;
  }

  // Build the spreads after each album's title spread: plates 2 and 3 on
  // one, 4 and 5 on the next, and so on, two to a spread. An album with an
  // even count ends with a spread whose right page is left blank — as a
  // printed catalogue would.
  document.querySelectorAll("[data-spread][id^='plates-']").forEach(function (section) {
    var titlePage = section.querySelector("[data-plate-range]");
    var album = titlePage && titlePage.getAttribute("data-plate-album");
    var rest = album ? platesIn(album).slice(1) : [];
    var after = section;
    for (var i = 0, n = 2; i < rest.length; i += 2, n++) {
      var spread = el("section", "spread");
      spread.id = section.id + "-" + n;
      spread.setAttribute("data-spread", "");
      spread.setAttribute("data-title", section.getAttribute("data-title") || album);
      spread.appendChild(platePage("left", rest[i]));
      if (rest[i + 1]) spread.appendChild(platePage("right", rest[i + 1]));
      else {
        var blank = el("article", "page page--right page--blank");
        blank.setAttribute("data-page", "");
        spread.appendChild(blank);
      }
      after.parentNode.insertBefore(spread, after.nextSibling);
      after = spread;
    }
  });

  // ---------------------------------------------------------------------
  // THE LOOSE PRINT — one plate lifted off the page to look at on its own.
  // ---------------------------------------------------------------------
  var dialog = document.querySelector("[data-print]");
  if (!dialog || typeof dialog.showModal !== "function") return;
  var label = dialog.querySelector("[data-print-label]");
  // the picture itself is made here, so the page never carries an empty <img>
  var img = document.createElement("img");
  img.className = "print__img";
  img.alt = "";
  dialog.querySelector("[data-print-figure]").insertBefore(img, label);
  var count = dialog.querySelector("[data-print-count]");
  var steps = dialog.querySelectorAll("[data-print-step]");
  var showing = null; // the plate on show
  var opener = null; // the button that lifted it, to give focus back to

  function show(plate) {
    showing = plate;
    var size = window.GALLERY_SIZES && window.GALLERY_SIZES[plate.rel];
    if (size) {
      img.width = size[0];
      img.height = size[1];
    }
    img.src = window.gallerySrc(plate.rel);
    img.alt = "Plate " + roman(plate.number) + ", an untitled work from the album " + plate.album;
    label.innerHTML = "";
    label.appendChild(el("span", "label__line label__line--num", "Plate " + roman(plate.number)));
    label.appendChild(el("span", "label__line label__line--title", "Untitled"));
    label.appendChild(el("span", "label__line label__line--quiet", plate.album)); // the print floats over the spread, so it names its album
    var inAlbum = plates.filter(function (p) {
      return p.album === plate.album;
    });
    count.textContent = plate.inAlbum + 1 + " of " + inAlbum.length; // the label above already names the album
    steps.forEach(function (b) {
      var d = parseInt(b.getAttribute("data-print-step"), 10);
      b.disabled = plate.inAlbum + d < 0 || plate.inAlbum + d >= inAlbum.length;
    });
  }

  function step(d) {
    if (!showing) return;
    var inAlbum = plates.filter(function (p) {
      return p.album === showing.album;
    });
    var next = inAlbum[showing.inAlbum + d];
    if (next) show(next);
  }

  document.addEventListener("click", function (e) {
    var lift = e.target.closest && e.target.closest("[data-print-open]");
    if (!lift) return;
    var plate = plates[parseInt(lift.getAttribute("data-print-open"), 10) - 1];
    if (!plate) return;
    opener = lift;
    show(plate);
    dialog.showModal();
    // land on the close control, so Escape and Enter both put the print back
    var close = dialog.querySelector("[data-print-close]");
    if (close) close.focus();
  });

  dialog.addEventListener("click", function (e) {
    // a press on the dark board around the print (the dialog itself, not
    // anything inside it) puts the print back
    if (e.target === dialog) dialog.close();
    var closeBtn = e.target.closest && e.target.closest("[data-print-close]");
    if (closeBtn) dialog.close();
    var s = e.target.closest && e.target.closest("[data-print-step]");
    if (s) step(parseInt(s.getAttribute("data-print-step"), 10));
  });

  // Arrow keys step through the album while the print is up — and must not
  // turn the book's pages underneath (book.js ignores keys while a dialog
  // is open, and this stops the event anyway).
  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      step(-1);
    }
  });

  dialog.addEventListener("close", function () {
    img.removeAttribute("src"); // nothing lingers behind the next print
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    opener = null;
    showing = null;
  });
})();
