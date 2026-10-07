// Get In Touch — the message form, wired to the database.
//
// A visitor fills in their name, email and message and presses Send; the
// message lands in the `messages` table, where the admin page's "Messages"
// panel reads it. Same rules as the sign-ups and the notify list: anyone may
// add a row, nobody may read one back without signing in.
//
// (It used to be a plain button that did nothing at all — the box looked
// like a form but swallowed whatever was typed into it.)
(function () {
  var URL_BASE = window.SUPABASE_URL;
  var KEY = window.SUPABASE_ANON_KEY;

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;
  var btn = form.querySelector('button[type="submit"]');
  var statusEl = form.querySelector(".contact__status");
  // The bot trap (meaningless name on purpose — see the note in index.html)
  var trap = form.querySelector('input[name="iea_extra_field"]');
  var fields = {
    name: form.querySelector("#contact-name"),
    surname: form.querySelector("#contact-surname"),
    email: form.querySelector("#contact-email"),
    message: form.querySelector("#contact-message"),
  };
  if (!btn || !fields.name || !fields.email || !fields.message) return;

  function say(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "contact__status" + (kind ? " contact__status--" + kind : "");
  }
  function value(el) {
    return el && el.value ? el.value.trim() : "";
  }
  function looksLikeEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  // the red ring comes off a field as soon as the person starts fixing it
  Object.keys(fields).forEach(function (k) {
    if (!fields[k]) return;
    fields[k].addEventListener("input", function () {
      fields[k].removeAttribute("aria-invalid");
      fields[k].removeAttribute("aria-describedby");
      if (statusEl && statusEl.classList.contains("contact__status--error")) say("");
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // a real submit would reload the page and lose the message

    var row = {
      name: value(fields.name),
      surname: value(fields.surname), // optional on a contact form
      email: value(fields.email).toLowerCase(),
      message: value(fields.message),
    };

    // Checks, plainest first. The status line names the problem and the
    // field in question gets the ring; focus goes to the first bad one.
    var bad = [];
    if (!row.name) bad.push([fields.name, "Please give your name."]);
    if (!looksLikeEmail(row.email)) bad.push([fields.email, "Please check the email address."]);
    if (!row.message) bad.push([fields.message, "The message is still empty."]);
    if (bad.length) {
      // every problem is named in the status line, and each flagged field is
      // tied to that line, so a screen reader hears what is wrong with it
      bad.forEach(function (b) {
        b[0].setAttribute("aria-invalid", "true");
        if (statusEl && statusEl.id) b[0].setAttribute("aria-describedby", statusEl.id);
      });
      say(
        bad
          .map(function (b) {
            return b[1];
          })
          .join(" "),
        "error"
      );
      bad[0][0].focus();
      return;
    }
    // a filled-in trap means a bot: pretend it worked, store nothing
    if (trap && trap.value) {
      say("Thank you — your message is on its way to Irene.", "ok");
      form.reset();
      return;
    }
    if (!URL_BASE || !KEY) {
      say("Messages aren't connected yet — please use Facebook or Instagram.", "error");
      return;
    }

    btn.disabled = true;
    say("Sending…");
    fetch(URL_BASE + "/rest/v1/messages", {
      method: "POST",
      headers: {
        apikey: KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal", // ask for nothing back: reading is not allowed from here
      },
      body: JSON.stringify(row),
    })
      .then(function (res) {
        if (res.ok) return "ok";
        if (res.status === 404) return "missing"; // the table isn't created yet
        throw new Error("Error " + res.status);
      })
      .then(function (outcome) {
        if (outcome === "missing") {
          say("Messages aren't set up yet — please use Facebook or Instagram.", "error");
          return;
        }
        say("Thank you — your message is on its way to Irene.", "ok");
        form.reset();
      })
      .catch(function () {
        // never the raw database error: it means nothing to a visitor
        say("Sorry, that didn't go through. Please try again in a moment.", "error");
      })
      .finally(function () {
        btn.disabled = false;
      });
  });
})();
