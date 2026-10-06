// "Be the first to hear about new dates" — the email form, wired to the
// database.
//
// Works for every form marked data-notify-form (there is one, under Workshop
// Dates; a second one anywhere would work the same). An address lands in the
// `notify_list` table with where it came from (data-source), so Irene can see
// in /admin who to tell when she adds dates. Only inserting is allowed from here — the row
// rules let anyone add an address but nobody read the list without signing
// in, so a visitor can never see anyone else's email.
(function () {
  var URL_BASE = window.SUPABASE_URL;
  var KEY = window.SUPABASE_ANON_KEY;

  var forms = document.querySelectorAll("[data-notify-form]");
  if (!forms.length) return;

  // Good enough for "is this shaped like an email": something, an @,
  // something, a dot, something. The database never sees a blank one.
  function looksLikeEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  forms.forEach(function (form) {
    var field = form.querySelector('input[type="email"]');
    // The bot trap. Its name is meaningless on purpose: a name like "website"
    // is one browsers' autofill recognises and fills in, which would make a
    // real person look like a bot and drop their address.
    var trap = form.querySelector('input[name="iea_extra_field"]');
    var btn = form.querySelector('button[type="submit"]');
    var statusEl = form.querySelector(".notify__status");
    if (!field || !btn) return;

    function say(msg, kind) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = "notify__status" + (kind ? " notify__status--" + kind : "");
    }

    // clear the red ring as soon as the person starts fixing the address
    field.addEventListener("input", function () {
      field.removeAttribute("aria-invalid");
      if (statusEl && statusEl.classList.contains("notify__status--error")) say("");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault(); // a real submit would reload the page
      var email = field.value.trim().toLowerCase();

      if (!looksLikeEmail(email)) {
        field.setAttribute("aria-invalid", "true");
        say("Please check the email address.", "error");
        field.focus();
        return;
      }
      // A filled-in trap means a bot. Pretend it worked and store nothing.
      if (trap && trap.value) {
        say("Thank you — you're on the list.", "ok");
        form.reset();
        return;
      }
      if (!URL_BASE || !KEY) {
        say("This isn't connected yet — please check back soon.", "error");
        return;
      }

      btn.disabled = true;
      say("Saving…");
      fetch(URL_BASE + "/rest/v1/notify_list", {
        method: "POST",
        headers: {
          apikey: KEY,
          "Content-Type": "application/json",
          // Ask for nothing back: the row rules forbid reading the list, and
          // the default reply (the new row) would be refused — which would
          // look like a failure when it wasn't.
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          email: email,
          source: form.getAttribute("data-source") || "site",
        }),
      })
        .then(function (res) {
          if (res.ok) return "ok";
          // 409 = the address is already in the list (the unique index). For
          // the visitor that is good news, not an error.
          if (res.status === 409) return "duplicate";
          // 404 = the table hasn't been created in Supabase yet
          if (res.status === 404) return "missing";
          throw new Error("Error " + res.status);
        })
        .then(function (outcome) {
          if (outcome === "missing") {
            say("The list isn't set up yet — please check back soon.", "error");
            return;
          }
          say(
            outcome === "duplicate"
              ? "You're already on the list — Irene will be in touch."
              : "Thank you — you'll hear from Irene when new dates go up.",
            "ok"
          );
          form.reset();
        })
        .catch(function () {
          // Never show the raw database error to a visitor: it means nothing
          // to them and can leak the shape of the table.
          say("Sorry, that didn't go through. Please try again in a moment.", "error");
        })
        .finally(function () {
          btn.disabled = false;
        });
    });
  });
})();
