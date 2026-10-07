// Workshop sign-ups — the booking form on the loose slip, wired to the
// database.
//
// A visitor presses a workshop date, book.js lays the slip over the book
// with that date restated in a chip, they fill in their details and press "Book my place"; the
// booking lands in the `signups` table, where the admin page reads it. Only
// inserting is allowed from here: the database's row rules let anyone add a
// sign-up but let nobody read the list back without signing in, so one
// visitor can never see another's name or phone number.
//
// The row sent to the database is exactly: name, surname, phone, attendees,
// workshop_month, workshop_date, workshop_topic — the admin page keys off
// these, so add nothing here without adding it there too.
(function () {
  var URL_BASE = window.SUPABASE_URL;
  var KEY = window.SUPABASE_ANON_KEY;

  var form = document.querySelector(".signup");
  if (!form) return;

  var btn = form.querySelector('.signup__submit[type="submit"]');
  var statusEl = form.querySelector(".signup__status");
  var fieldsWrap = form.querySelector("[data-signup-fields]");
  var foot = form.querySelector("[data-signup-foot]");
  var done = form.querySelector("[data-signup-done]");
  var doneText = form.querySelector("[data-done-text]");
  var chip = form.querySelector("[data-signup-chip]");
  var head = form.querySelector(".signup__head"); // hidden once booked, so the thank-you has one title
  var fields = {
    name: form.querySelector("#signup-name"),
    surname: form.querySelector("#signup-surname"),
    phone: form.querySelector("#signup-phone"),
    attendees: form.querySelector("#signup-attendees"),
  };
  if (!btn || !fields.name || !fields.surname || !fields.phone || !fields.attendees) return;

  var MAX_PEOPLE = 6;

  // Which date was clicked. content.js redraws the date buttons once the
  // saved dates arrive from the database, so this listens on the document
  // rather than on the buttons themselves — a redrawn button works like the
  // original. Read from the button's own text, which is what the visitor saw.
  var picked = null;
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest('[data-category-open][data-category="workshop"]');
    if (!b) return;
    var month = b.closest(".workshops__month");
    var text = function (sel) {
      var el = b.querySelector(sel);
      return el ? el.textContent.trim() : "";
    };
    var day = text(".workshop__day");
    var weekday = text(".workshop__weekday");
    var time = text(".workshop__time");
    picked = {
      workshop_month: month ? (month.querySelector(".workshops__month-name") || {}).textContent.trim() : "",
      workshop_date: [day, weekday, time].filter(Boolean).join(" "),
      workshop_topic: text(".workshop__topic"),
      // the parts on their own, for the thank-you's sentence (the row sent
      // to the database keeps workshop_date exactly as above)
      day: day,
      weekday: weekday,
      time: time,
    };
    showChip(day, [weekday, time, picked.workshop_month].filter(Boolean).join(" · "), picked.workshop_topic);
    reset(); // a fresh form for a fresh date
  });

  function showChip(day, when, topic) {
    if (!chip) return;
    var set = function (sel, v) {
      var el = chip.querySelector(sel);
      if (el) el.textContent = v || "";
    };
    set("[data-chip-day]", day);
    set("[data-chip-when]", when);
    set("[data-chip-topic]", topic);
    chip.classList.toggle("is-set", !!(day || when));
  }

  function say(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "signup__status" + (kind ? " signup__status--" + kind : "");
  }

  function value(el) {
    return el && el.value ? el.value.trim() : "";
  }

  // --- Inline checks: the line under a field says what is wrong, and the
  //     field wears a red ring until it is fixed. ---
  function hint(el) {
    return form.querySelector("#" + el.id + "-hint");
  }
  function flag(el, msg) {
    el.setAttribute("aria-invalid", "true");
    var h = hint(el);
    if (h) {
      h.textContent = msg;
      h.classList.add("is-error");
    }
  }
  function clear(el) {
    el.removeAttribute("aria-invalid");
    var h = hint(el);
    if (h && h.classList.contains("is-error")) {
      h.textContent = h.dataset.rest || "";
      h.classList.remove("is-error");
    }
  }
  // remember each hint's resting text (the attendees one has some)
  Object.keys(fields).forEach(function (k) {
    var h = hint(fields[k]);
    if (h) h.dataset.rest = h.textContent;
    fields[k].addEventListener("input", function () {
      clear(fields[k]);
      if (statusEl && statusEl.classList.contains("signup__status--error")) say("");
    });
  });

  function people() {
    var n = parseInt(fields.attendees.value, 10);
    if (isNaN(n)) n = 1;
    return Math.min(MAX_PEOPLE, Math.max(1, n));
  }
  function setPeople(n) {
    fields.attendees.value = String(n);
    form.querySelectorAll("[data-step]").forEach(function (s) {
      var d = parseInt(s.dataset.step, 10);
      s.disabled = (d < 0 && n <= 1) || (d > 0 && n >= MAX_PEOPLE);
    });
  }
  form.querySelectorAll("[data-step]").forEach(function (s) {
    s.addEventListener("click", function () {
      setPeople(people() + parseInt(s.dataset.step, 10));
    });
  });
  fields.attendees.addEventListener("change", function () {
    setPeople(people()); // typed value snapped into 1–6
  });
  setPeople(1);

  function validate() {
    var ok = true;
    if (!value(fields.name)) {
      flag(fields.name, "Please give your name.");
      ok = false;
    }
    if (!value(fields.surname)) {
      flag(fields.surname, "And your surname.");
      ok = false;
    }
    // South African cellphone numbers have 10 digits; allow a +27 form too
    if (value(fields.phone).replace(/\D/g, "").length < 9) {
      flag(fields.phone, "Please check the cellphone number.");
      ok = false;
    }
    if (!ok) {
      // the hints are live regions, so each one is announced as it is
      // written; the status line sums it up for whoever missed them
      say("Please fill in the highlighted fields.", "error");
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
    }
    return ok;
  }

  // --- The two states: the form, or the thank-you ---
  function showDone(row) {
    if (fieldsWrap) fieldsWrap.hidden = true;
    if (foot) foot.hidden = true;
    if (head) head.hidden = true;
    if (done) {
      if (doneText) {
        var who = row.attendees > 1 ? row.attendees + " people" : "one place";
        // written the way a South African says a date: "Saturday 18 July, 14:00"
        var when = picked
          ? [[picked.weekday, picked.day, row.workshop_month].filter(Boolean).join(" "), picked.time].filter(Boolean).join(", ")
          : [row.workshop_date, row.workshop_month].filter(Boolean).join(", ");
        doneText.innerHTML =
          "Thank you, <strong></strong> — " +
          who +
          " for <strong></strong>" +
          (row.workshop_topic ? " (<span></span>)" : "") +
          ".";
        // the visitor's own text goes in as TEXT, never as markup
        var strongs = doneText.querySelectorAll("strong");
        strongs[0].textContent = row.name;
        strongs[1].textContent = when || "the workshop";
        var topicEl = doneText.querySelector("span");
        if (topicEl) topicEl.textContent = row.workshop_topic;
      }
      done.hidden = false;
      done.focus(); // a screen reader hears the confirmation straight away
    }
  }
  function reset() {
    if (fieldsWrap) fieldsWrap.hidden = false;
    if (foot) foot.hidden = false;
    if (head) head.hidden = false;
    if (done) done.hidden = true;
    say("");
    [fields.name, fields.surname, fields.phone].forEach(function (el) {
      el.value = "";
      clear(el);
    });
    setPeople(1);
    btn.disabled = false;
  }
  // "Book another date": put the slip away so they can pick one. The slip's
  // own close control is the one place that knows how to close it, so press
  // it (book.js listens for it).
  var again = form.querySelector("[data-signup-again]");
  if (again) {
    again.addEventListener("click", function () {
      var close = document.querySelector("[data-booking-close]");
      if (close) close.click();
      reset();
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // a real submit would reload the page and lose everything typed
    if (!URL_BASE || !KEY) {
      say("Sign-ups aren’t connected yet. Please phone Irene instead.", "error");
      return;
    }
    if (!validate()) return;

    var row = {
      name: value(fields.name),
      surname: value(fields.surname),
      phone: value(fields.phone),
      attendees: people(),
      workshop_month: (picked && picked.workshop_month) || "",
      workshop_date: (picked && picked.workshop_date) || "",
      workshop_topic: (picked && picked.workshop_topic) || "",
    };

    btn.disabled = true;
    say("Sending…");
    fetch(URL_BASE + "/rest/v1/signups", {
      method: "POST",
      headers: {
        apikey: KEY,
        "Content-Type": "application/json",
        // Ask for nothing back. The row rules deliberately forbid reading the
        // list, and PostgREST returns the new row by default — which would be
        // refused, and would look like the sign-up had failed when it hadn't.
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Error " + res.status);
        say("");
        showDone(row);
      })
      .catch(function () {
        // Never show the raw database error to a visitor — it means nothing to
        // them and can leak the shape of the table.
        say("Sorry, that didn’t go through. Please try again or phone Irene.", "error");
        btn.disabled = false;
      });
  });
})();
