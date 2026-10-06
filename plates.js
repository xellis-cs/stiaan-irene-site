// The plates — every picture in the book, drawn from gallery-data.js.
//
// index.html holds EMPTY slots (<div class="plate-slot" …>) and this script
// fills them: the frontispiece on the title spread, the big first picture
// of each album, and the group of the album's other pictures. So the list
// in gallery-data.js stays the ONE place that says which pictures exist —
// add a file there and it appears here, with its label and plate number,
// and in the admin preview.
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

  // The medium of each album is written on its spread in index.html
  // (data-medium), next to the one-line description, so the words live with
  // the content rather than in here.
  function mediumFor(album) {
    var hero = document.querySelector('[data-plate-role="hero"][data-plate-album="' + cssEscape(album) + '"]');
    var spread = hero && hero.closest("[data-spread]");
    return (spread && spread.getAttribute("data-medium")) || "";
  }
  function cssEscape(s) {
    return window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/"/g, '\\"');
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // One plate: the picture inside a button (press it to lift the print),
  // and the label block beneath. `opts.heading` makes the plate number a
  // real heading — only the frontispiece needs that, its page has no other.
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
    var medium = mediumFor(plate.album);
    cap.appendChild(el("span", "label__line label__line--quiet", plate.album + (medium ? " · " + medium : "")));
    fig.appendChild(cap);
    return fig;
  }

  // Fill every slot in the page
  document.querySelectorAll(".plate-slot").forEach(function (slot) {
    var album = slot.getAttribute("data-plate-album");
    var role = slot.getAttribute("data-plate-role");
    var mine = plates.filter(function (p) {
      return p.album === album;
    });
    if (!mine.length) return;

    if (role === "frontispiece" || role === "hero") {
      var idx = parseInt(slot.getAttribute("data-plate-index"), 10) || 0;
      var plate = mine[idx];
      if (!plate) return;
      slot.appendChild(
        figureFor(plate, {
          variant: role,
          frontispiece: role === "frontispiece",
          heading: role === "frontispiece",
          eager: role === "frontispiece",
        })
      );
    } else if (role === "group") {
      var from = parseInt(slot.getAttribute("data-plate-from"), 10) || 0;
      var rest = mine.slice(from);
      if (!rest.length) return;
      // the page's heading: which plates this group holds
      var first = roman(rest[0].number);
      var last = roman(rest[rest.length - 1].number);
      var h = el("h2", "page-title", rest.length > 1 ? "Plates " + first + " to " + last : "Plate " + first);
      h.setAttribute("tabindex", "-1");
      slot.appendChild(h);
      var group = el("div", "plate-group");
      rest.forEach(function (p) {
        group.appendChild(figureFor(p, { variant: "small" }));
      });
      slot.appendChild(group);
    }
  });

  // ---------------------------------------------------------------------
  // THE LOOSE PRINT — one plate lifted off the page to look at on its own.
  // ---------------------------------------------------------------------
  var dialog = document.querySelector("[data-print]");
  if (!dialog || typeof dialog.showModal !== "function") return;
  var img = dialog.querySelector("[data-print-img]");
  var label = dialog.querySelector("[data-print-label]");
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
    var medium = mediumFor(plate.album);
    label.appendChild(el("span", "label__line label__line--quiet", plate.album + (medium ? " · " + medium : "")));
    var inAlbum = plates.filter(function (p) {
      return p.album === plate.album;
    });
    count.textContent = plate.inAlbum + 1 + " of " + inAlbum.length + " · " + plate.album;
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
