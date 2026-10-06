// Workshop dates, from the database.
//
// index.html ships NO dates: its grid holds one honest paragraph ("Irene has
// not announced the next dates yet"). On load this asks the database what
// Irene last saved in /admin and, if there is anything there, draws the
// months into the grid. If nothing has been saved the paragraph stays. If the
// request itself fails (the database is asleep, the network is down) the
// paragraph is reworded to say the dates could not be loaded, which is a fact
// about the site, not a claim about Irene's calendar. Sample dates are never
// shown as if they were real.
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
    if (!html) return false; // nothing worth showing: keep the "not announced yet" line
    grid.innerHTML = html;

    // Anything that measures or copies the months can look again now.
    document.dispatchEvent(new CustomEvent("content:updated"));
    return true;
  }

  // The request failed (not "no dates saved": that keeps the shipped line).
  function couldNotLoad() {
    var empty = grid.querySelector("[data-workshops-empty]");
    if (!empty) return;
    var link = empty.querySelector("a"); // the link to the notify form stays
    empty.textContent = "The dates could not be loaded just now. Leave your email under ";
    if (link) empty.appendChild(link);
    empty.appendChild(
      document.createTextNode(" and Irene will tell you when they are announced, or try again in a moment.")
    );
  }

  fetch(URL_BASE + "/rest/v1/site_content?id=eq.main&select=data", {
    headers: { apikey: KEY },
  })
    .then(function (r) {
      if (!r.ok) throw new Error("Error " + r.status);
      return r.json();
    })
    .then(function (rows) {
      var data = rows && rows[0] && rows[0].data;
      var months = data && Array.isArray(data.months) ? data.months : null;
      if (months && months.length) render(months);
    })
    .catch(couldNotLoad);
})();
