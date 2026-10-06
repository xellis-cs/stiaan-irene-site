// Workshop dates, from the database.
//
// The dates written into index.html are the FALLBACK, not the source. On load
// this asks the database what Irene last saved in /admin and, if there is
// anything there, redraws the months from it. If the request fails, the
// database is asleep, or nothing has been saved yet, the page keeps the dates
// it was built with — a visitor never sees an empty section because a server
// was slow.
//
// Reading is deliberately public: these are the dates the website exists to
// show. Only writing needs her login.
(function () {
  var URL_BASE = window.SUPABASE_URL;
  var KEY = window.SUPABASE_ANON_KEY;
  // The grid lives inside #workshop-dates on the Programme page (index.html);
  // keep that id on the element that holds .workshops__grid.
  var section = document.getElementById("workshop-dates");
  var grid = section && section.querySelector(".workshops__grid");
  if (!grid || !URL_BASE || !KEY) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // One date, in the same shape the hand-written markup uses — the booking
  // slip (signup.js) and the styles key off these exact classes.
  function dateButton(d) {
    var day = esc(d.date);
    var weekday = esc(d.day);
    var time = esc(d.time);
    var topic = String(d.topic || "").trim();
    if (!day && !weekday && !time) return "";
    return (
      '<button type="button" class="workshop" data-category-open data-category="workshop">' +
      '<span class="workshop__main">' +
      '<span class="workshop__day">' + day + "</span> " +
      '<span class="workshop__weekday">' + weekday + "</span> " +
      '<span class="workshop__time">' + time + "</span>" +
      "</span>" +
      // an empty topic would draw an empty pill, so it is left out entirely
      (topic ? '<span class="workshop__topic">' + esc(topic) + "</span>" : "") +
      "</button>"
    );
  }

  function render(months) {
    var html = months
      .map(function (m) {
        var dates = (m.dates || []).map(dateButton).join("");
        if (!dates && !String(m.name || "").trim()) return "";
        return (
          '<div class="workshops__month">' +
          '<p class="workshops__month-name">' + esc(m.name) + "</p>" +
          '<div class="workshops__dates">' + dates + "</div>" +
          "</div>"
        );
      })
      .join("");
    if (!html) return false; // nothing worth showing: keep the built-in dates
    grid.innerHTML = html;

    // Anything that measures or copies the months can look again now.
    document.dispatchEvent(new CustomEvent("content:updated"));
    return true;
  }

  fetch(URL_BASE + "/rest/v1/site_content?id=eq.main&select=data", {
    headers: { apikey: KEY },
  })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (rows) {
      var data = rows && rows[0] && rows[0].data;
      var months = data && Array.isArray(data.months) ? data.months : null;
      if (months && months.length) render(months);
    })
    .catch(function () {
      /* keep the dates the page was built with */
    });
})();
