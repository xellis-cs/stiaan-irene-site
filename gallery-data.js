// Portfolio image data — the ONE source of truth for which images each
// category shows. Loaded by BOTH the public site and the admin preview, so the
// fanned cards, the site's dark gallery, and the admin preview all read the
// same list. To add/remove a piece: drop the file in
// images/portfolio/<Category N>/ and edit its list here.
//
// The folder names on disk are still "Category 1/2/3" — renaming files makes a
// change hard to review and breaks nothing to leave. The KEYS below are what
// the visitor sees (the pill on each card stack, the admin album title), and
// every data-category / data-stage in index.html and admin/index.html must
// match them exactly.
//
// GALLERY_BASE lets each page reach the same images folder from where it sits:
// the site (at the root) uses the default; the admin page (in /admin/) sets
// window.GALLERY_BASE = "../images/portfolio/" BEFORE loading this file.
window.GALLERY_BASE = window.GALLERY_BASE || "images/portfolio/";

window.GALLERY = {
  // colour on black paper, gold leaf, fairies and dandelions
  "Pastel & Gold": [
    "Category 1/download.jpg",
    "Category 1/download2.jpg",
    "Category 1/download 3.jpg",
    "Category 1/download 5.jpg",
    "Category 1/download6.jpg",
  ],
  // proteas, leaves and creatures in pencil, charcoal and ink
  "Flora & Fauna": [
    "Category 2/download (1).jpg",
    "Category 2/download2.jpg",
    "Category 2/download3.jpg",
    "Category 2/download4.jpg",
    "Category 2/download5.jpg",
    // "Category 2/download6.jpg" is the same file as Category 1/download6.jpg
    // (the gold mermaid), so it is shown once, with the gold pieces.
  ],
  // close-up portraits in graphite and charcoal
  "Graphite Studies": [
    "Category 3/download1.jpg",
    "Category 3/download2.jpg",
    "Category 3/download3.jpg",
    "Category 3/download4.jpg",
    "Category 3/download 4.jpg",
  ],
};

// Each picture's real size in pixels (width, height). The gallery writes these
// onto the <img> so the browser knows the shape before the file arrives and
// lays the wall out once, instead of shuffling as each picture loads. A piece
// missing from here still shows — it just reserves no space up front.
window.GALLERY_SIZES = {
  "Category 1/download.jpg": [750, 1000],
  "Category 1/download2.jpg": [641, 817],
  "Category 1/download 3.jpg": [562, 1000],
  "Category 1/download 5.jpg": [666, 804],
  "Category 1/download6.jpg": [669, 1000],
  "Category 2/download (1).jpg": [721, 1000],
  "Category 2/download2.jpg": [791, 1000],
  "Category 2/download3.jpg": [750, 1000],
  "Category 2/download4.jpg": [453, 1000],
  "Category 2/download5.jpg": [699, 1000],
  "Category 2/download6.jpg": [669, 1000],
  "Category 3/download1.jpg": [492, 752],
  "Category 3/download2.jpg": [744, 1000],
  "Category 3/download3.jpg": [528, 960],
  "Category 3/download4.jpg": [621, 1000],
  "Category 3/download 4.jpg": [678, 1000],
};

// encodeURI keeps the slashes but escapes spaces in the folder/file names.
window.gallerySrc = function (rel) {
  return encodeURI((window.GALLERY_BASE || "images/portfolio/") + rel);
};
