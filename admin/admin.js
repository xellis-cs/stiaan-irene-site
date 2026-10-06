// --- Shared helpers, used by every panel below -------------------------------
// Names, phone numbers, emails and messages are typed by strangers — never let
// that text be treated as markup when it is put back on the page. ONE copy of
// this, so a fix lands everywhere.
window.IEA_esc = function (s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
};

// Dates in the lists, short: "6 Oct, 14:32"
window.IEA_when = function (iso) {
  var d = iso ? new Date(iso) : null;
  if (!d || isNaN(d.getTime())) return "";
  return (
    d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) +
    ", " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
};

// Read a protected table (sign-ups, the notify list, the messages) once signed
// in. The row rules let anyone ADD a row but nobody read one back without
// signing in, so the request carries the admin's session token. This helper
// does the fetch and the outcomes every such panel needs — not signed in, table
// missing, rows — so each panel only has to say how to draw its rows.
//
//   IEA_loadProtected("notify_list", "created_at.desc", function (state, rows) {…})
//   state: "signed-out" | "missing" | "error" | "ok"
//
// A session token only lives about an hour. If it has run out — or the
// database answers 401 because it has — the stored session is cleared and the
// login screen comes back with a plain message, instead of a load error that
// never goes away. (window.IEA_session is set up by the login block below.)
window.IEA_loadProtected = function (table, order, done) {
  var SB_URL = window.SUPABASE_URL;
  var SB_KEY = window.SUPABASE_ANON_KEY;
  var session = window.IEA_session;
  if (!SB_URL || !SB_KEY || !session) return done("error", []);
  var s = session.get();
  if (!s || !s.access_token) return done("signed-out", []);
  if (!session.valid()) {
    session.expire();
    return done("signed-out", []);
  }
  fetch(SB_URL + "/rest/v1/" + table + "?select=*&order=" + order, {
    headers: { apikey: SB_KEY, Authorization: "Bearer " + s.access_token },
  })
    .then(function (r) {
      if (r.status === 401) return { expired: true };
      if (r.status === 404) return { missing: true };
      if (!r.ok) throw new Error("Error " + r.status);
      return r.json();
    })
    .then(function (rows) {
      if (rows && rows.expired) {
        session.expire();
        return done("signed-out", []);
      }
      if (rows && rows.missing) return done("missing", []);
      done("ok", rows || []);
    })
    .catch(function () {
      done("error", []);
    });
};

// --- Admin login (Supabase auth via its REST endpoint — no library) ---
// Shows the login screen until you sign in; the editor stays hidden until then.
// A successful sign-in stores the session token so a refresh keeps you in.
(function () {
  var URL = window.SUPABASE_URL;
  var KEY = window.SUPABASE_ANON_KEY;
  var STORE = "iea_admin_session";

  var loginView = document.querySelector('[data-view="login"]');
  var editorView = document.querySelector('[data-view="editor"]');
  var form = document.querySelector("[data-login-form]");
  var emailEl = document.querySelector("[data-email]");
  var passEl = document.querySelector("[data-password]");
  var btn = document.querySelector("[data-login-btn]");
  var errEl = document.querySelector("[data-login-error]");
  var logoutBtn = document.querySelector("[data-logout]");

  function show(view) {
    if (loginView) loginView.hidden = view !== "login";
    if (editorView) editorView.hidden = view !== "editor";
  }
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORE));
    } catch (e) {
      return null;
    }
  }
  function sessionValid() {
    var s = getSession();
    return !!(s && s.expires_at && s.expires_at * 1000 > Date.now());
  }
  // Handed to the shared loader above: read the session, check it is still
  // good, and — when it has run out — clear it and bring the login back.
  window.IEA_session = {
    get: getSession,
    valid: sessionValid,
    expire: function () {
      localStorage.removeItem(STORE);
      show("login");
      fail("Your sign-in has expired, please sign in again.");
    },
  };
  function configured() {
    return (
      URL &&
      KEY &&
      URL.indexOf("YOUR-PROJECT") === -1 &&
      KEY.indexOf("YOUR-ANON") === -1
    );
  }
  function fail(msg) {
    if (errEl) {
      errEl.textContent = msg;
      errEl.hidden = false;
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errEl) errEl.hidden = true;
      if (!configured()) {
        fail("Supabase isn’t set up yet — add your URL and anon key to config.js.");
        return;
      }
      if (btn) btn.disabled = true;
      fetch(URL + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: { apikey: KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailEl.value, password: passEl.value }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok)
              throw new Error(
                data.error_description || data.msg || data.message || "Sign in failed."
              );
            return data;
          });
        })
        .then(function (data) {
          localStorage.setItem(
            STORE,
            JSON.stringify({
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_at: data.expires_at,
            })
          );
          show("editor");
        })
        .catch(function (err) {
          fail(err.message || "Sign in failed.");
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem(STORE);
      show("login");
    });
  }

  // show/hide password (the eye icon on the right of the password field)
  var pwToggle = document.querySelector("[data-pw-toggle]");
  if (pwToggle && passEl) {
    var eyeShow = pwToggle.querySelector(".pw-icon--show");
    var eyeHide = pwToggle.querySelector(".pw-icon--hide");
    pwToggle.addEventListener("click", function () {
      var reveal = passEl.type === "password";
      passEl.type = reveal ? "text" : "password";
      pwToggle.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
      // toggleAttribute works on SVG elements; the .hidden property does not
      if (eyeShow) eyeShow.toggleAttribute("hidden", reveal);
      if (eyeHide) eyeHide.toggleAttribute("hidden", !reveal);
    });
  }

  // A stored session that has already run out is cleared on arrival too, with
  // the same message, rather than sitting there until a panel trips over it.
  if (sessionValid()) show("editor");
  else if (getSession()) window.IEA_session.expire();
  else show("login");
})();

// Admin page interactions — enough to make the layout usable to build on.
// NOTE: nothing is saved/persisted yet. Uploads only preview locally; adding
// the real "Save" (backend / build step / localStorage) is the next step.
(function () {
  var WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  var months = document.getElementById("months");
  var dateTpl = document.getElementById("date-tpl");
  var monthTpl = document.getElementById("month-tpl");

  // Fill a <select class="weekday"> with the weekday options and pick the one
  // named in its data-day attribute (if any).
  function fillWeekday(select) {
    if (select.dataset.filled) return;
    var chosen = select.getAttribute("data-day") || "";
    WEEKDAYS.forEach(function (day) {
      var opt = document.createElement("option");
      opt.value = day;
      opt.textContent = day;
      if (day === chosen) opt.selected = true;
      select.appendChild(opt);
    });
    select.dataset.filled = "1";
  }

  function fillAllWeekdays(scope) {
    (scope || document).querySelectorAll(".weekday").forEach(fillWeekday);
  }

  fillAllWeekdays();

  // --- Add / remove months and dates (event delegation) ---
  document.addEventListener("click", function (e) {
    var addDate = e.target.closest("[data-add-date]");
    if (addDate) {
      var month = addDate.closest(".month");
      var row = dateTpl.content.firstElementChild.cloneNode(true);
      fillAllWeekdays(row);
      month.querySelector(".dates").appendChild(row);
      return;
    }

    var removeDate = e.target.closest("[data-remove-date]");
    if (removeDate) {
      removeDate.closest(".date-row").remove();
      return;
    }

    var removeMonth = e.target.closest("[data-remove-month]");
    if (removeMonth) {
      removeMonth.closest(".month").remove();
      return;
    }
  });

  var addMonthBtn = document.querySelector("[data-add-month]");
  if (addMonthBtn) {
    addMonthBtn.addEventListener("click", function () {
      var month = monthTpl.content.firstElementChild.cloneNode(true);
      fillAllWeekdays(month);
      months.appendChild(month);
    });
  }

  // Clicking anywhere on a time field opens its picker (not just the clock
  // icon), so it behaves like the weekday dropdown. Delegated, so it also
  // covers dates added later. showPicker() needs a user gesture — a click is.
  document.addEventListener("click", function (e) {
    var timeInput = e.target.closest('input[type="time"]');
    if (timeInput && typeof timeInput.showPicker === "function") {
      try {
        timeInput.showPicker();
      } catch (err) {
        /* ignore — e.g. picker already open or not allowed */
      }
    }
  });

  // --- Portfolio uploads (local preview only) ---
  function addThumb(grid, file) {
    var url = URL.createObjectURL(file);
    var thumb = document.createElement("div");
    thumb.className = "thumb";

    var img = document.createElement("img");
    img.src = url;
    img.alt = file.name;

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "thumb__remove";
    remove.setAttribute("aria-label", "Remove image");
    remove.textContent = "×";
    remove.addEventListener("click", function () {
      URL.revokeObjectURL(url);
      thumb.remove();
    });

    thumb.appendChild(img);
    thumb.appendChild(remove);
    grid.appendChild(thumb);
  }

  function handleFiles(album, files) {
    var grid = album.querySelector("[data-grid]");
    Array.prototype.forEach.call(files, function (file) {
      if (file.type.indexOf("image/") === 0) addThumb(grid, file);
    });
  }

  document.querySelectorAll(".album").forEach(function (album) {
    var input = album.querySelector("[data-upload]");
    var zone = album.querySelector(".dropzone");

    input.addEventListener("change", function () {
      handleFiles(album, input.files);
      input.value = ""; // allow re-picking the same file
    });

    // drag & drop onto the zone
    ["dragenter", "dragover"].forEach(function (type) {
      zone.addEventListener(type, function (e) {
        e.preventDefault();
        zone.classList.add("is-drag");
      });
    });
    ["dragleave", "drop"].forEach(function (type) {
      zone.addEventListener(type, function (e) {
        e.preventDefault();
        zone.classList.remove("is-drag");
      });
    });
    zone.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files) {
        handleFiles(album, e.dataTransfer.files);
      }
    });
  });

  // --- Content storage (Supabase) ------------------------------------------
  // Load saved content into the editor on start, and save the workshop months
  // + participant counts back to the database on demand. Reading is public
  // (anyone can see the dates); writing needs the signed-in admin's token, so
  // only you can change it (enforced by the row-level rules on the table).
  (function () {
    var SB_URL = window.SUPABASE_URL; // NOT `URL` — that's the global used above
    var SB_KEY = window.SUPABASE_ANON_KEY;
    var ROW = SB_URL + "/rest/v1/site_content?id=eq.main";
    var saveBtn = document.querySelector("[data-save]");
    var statusEl = document.querySelector("[data-save-status]");

    function token() {
      try {
        return (JSON.parse(localStorage.getItem("iea_admin_session")) || {}).access_token;
      } catch (e) {
        return null;
      }
    }
    function configured() {
      return SB_URL && SB_KEY && SB_URL.indexOf("YOUR-PROJECT") === -1;
    }
    function setStatus(msg, isError) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.style.color = isError ? "var(--accent)" : "";
    }

    // Read the whole editor into one plain object (the JSON "bundle").
    function collect() {
      var monthsData = [];
      document.querySelectorAll("#months .month").forEach(function (m) {
        var nameEl = m.querySelector(".month__top input");
        var dates = [];
        m.querySelectorAll(".date-row").forEach(function (row) {
          dates.push({
            date: (row.querySelector('input[type="number"]') || {}).value || "",
            day: (row.querySelector("select.weekday") || {}).value || "",
            time: (row.querySelector('input[type="time"]') || {}).value || "",
            topic: (row.querySelector(".date-topic") || {}).value || "",
          });
        });
        monthsData.push({ name: nameEl ? nameEl.value.trim() : "", dates: dates });
      });
      var participants = {};
      document.querySelectorAll(".participant").forEach(function (p) {
        var name = p.querySelector(".participant__month").textContent.trim();
        participants[name] = Number(p.querySelector(".participant__count").value) || 0;
      });
      return { months: monthsData, participants: participants };
    }

    // Rebuild the editor from a saved bundle (reusing the month/date templates).
    function apply(data) {
      if (data && Array.isArray(data.months)) {
        months.innerHTML = "";
        data.months.forEach(function (m) {
          var el = monthTpl.content.firstElementChild.cloneNode(true);
          var nameEl = el.querySelector(".month__top input");
          if (nameEl) nameEl.value = m.name || "";
          var wrap = el.querySelector(".dates");
          wrap.innerHTML = "";
          (m.dates || []).forEach(function (d) {
            var row = dateTpl.content.firstElementChild.cloneNode(true);
            var n = row.querySelector('input[type="number"]');
            var sel = row.querySelector("select.weekday");
            var tm = row.querySelector('input[type="time"]');
            var tp = row.querySelector(".date-topic");
            if (n) n.value = d.date || "";
            if (sel) sel.setAttribute("data-day", d.day || "");
            if (tm) tm.value = d.time || "";
            if (tp) tp.value = d.topic || "";
            wrap.appendChild(row);
          });
          months.appendChild(el);
        });
        fillAllWeekdays(months);
      }
      if (data && data.participants) {
        document.querySelectorAll(".participant").forEach(function (p) {
          var name = p.querySelector(".participant__month").textContent.trim();
          var input = p.querySelector(".participant__count");
          if (name in data.participants) input.value = data.participants[name];
        });
      }
    }

    // Load saved content on start (public read — no sign-in needed to see it).
    // If nothing is saved yet, the built-in defaults stay as the starting point.
    if (configured()) {
      fetch(ROW + "&select=data", { headers: { apikey: SB_KEY } })
        .then(function (r) {
          return r.ok ? r.json() : [];
        })
        .then(function (rows) {
          var data = rows && rows[0] && rows[0].data;
          if (data && Object.keys(data).length) apply(data);
        })
        .catch(function () {
          /* keep the built-in defaults if the load fails */
        });
    }

    // Save: write the bundle back. Needs the admin's token so the row rules
    // allow the change (anyone reading is fine; only you may write).
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (!configured()) {
          setStatus("Supabase isn’t set up in config.js.", true);
          return;
        }
        var tok = token();
        if (!tok) {
          setStatus("Your session expired — please sign in again.", true);
          return;
        }
        saveBtn.disabled = true;
        setStatus("Saving…");
        fetch(ROW, {
          method: "PATCH",
          headers: {
            apikey: SB_KEY,
            Authorization: "Bearer " + tok,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ data: collect(), updated_at: new Date().toISOString() }),
        })
          .then(function (r) {
            if (!r.ok)
              return r.text().then(function (t) {
                throw new Error(t || "Error " + r.status);
              });
            setStatus("Saved ✓ — your changes are stored.");
          })
          .catch(function (err) {
            setStatus("Couldn’t save: " + (err.message || err), true);
          })
          .finally(function () {
            saveBtn.disabled = false;
          });
      });
    }
  })();
})();

// --- Workshop participants: a roll of every month and its dates ------------
// Each month you have set up appears with its dates as buttons. Clicking one
// opens a small list: how many people are coming that day, and who they are.
//
// The months and dates come from the editor above — whatever is on screen
// right now, saved or not — so adding a date makes its button appear at once.
// The names come from the sign-ups table, matched to a date by month name and
// day number. (Deliberately not by weekday or time: if Irene moves a workshop
// from 14:00 to 15:00 after someone books, that person must not vanish.)
(function () {
  var roll = document.querySelector("[data-participants]");
  var statusEl = document.querySelector("[data-participants-status]");
  var monthsWrap = document.querySelector("#months");
  var editorView = document.querySelector('[data-view="editor"]');
  if (!roll) return;

  var esc = window.IEA_esc;

  // What the editor currently holds: months, each with its dates.
  function readEditor() {
    var out = [];
    if (!monthsWrap) return out;
    monthsWrap.querySelectorAll(".month").forEach(function (m) {
      var nameEl = m.querySelector(".month__top input");
      var name = nameEl ? nameEl.value.trim() : "";
      var dates = [];
      m.querySelectorAll(".date-row").forEach(function (row) {
        var num = (row.querySelector('input[type="number"]') || {}).value || "";
        if (!String(num).trim()) return; // a half-filled new row
        dates.push({
          day: String(num).trim(),
          weekday: (row.querySelector("select.weekday") || {}).value || "",
          time: (row.querySelector('input[type="time"]') || {}).value || "",
          topic: (row.querySelector(".date-topic") || {}).value || "",
        });
      });
      if (name || dates.length) out.push({ name: name || "Untitled month", dates: dates });
    });
    return out;
  }

  function signupsFor(monthName, day) {
    var rows = window.IEA_SIGNUPS || [];
    var m = String(monthName).trim().toLowerCase();
    return rows.filter(function (r) {
      if (String(r.workshop_month || "").trim().toLowerCase() !== m) return false;
      return parseInt(r.workshop_date, 10) === parseInt(day, 10);
    });
  }

  function heads(list) {
    return list.reduce(function (n, r) {
      return n + (Number(r.attendees) || 1);
    }, 0);
  }

  function render() {
    var months = readEditor();
    if (!months.length) {
      roll.innerHTML = '<p class="hint">Add a month above and its dates will appear here.</p>';
      return;
    }
    roll.innerHTML = months
      .map(function (mo) {
        var dates = mo.dates
          .map(function (d) {
            var list = signupsFor(mo.name, d.day);
            var n = heads(list);
            var names = list.length
              ? list
                  .map(function (r) {
                    var who = ((r.name || "") + " " + (r.surname || "")).trim() || "No name given";
                    var extra = (Number(r.attendees) || 1) > 1 ? " +" + ((Number(r.attendees) || 1) - 1) : "";
                    return (
                      '<li class="roll__person"><span>' +
                      esc(who) +
                      esc(extra) +
                      '</span><span class="roll__phone">' +
                      esc(r.phone) +
                      "</span></li>"
                    );
                  })
                  .join("")
              : '<li class="roll__empty">Nobody has signed up for this day yet.</li>';
            var when = [d.weekday, d.time].filter(Boolean).join(" ");
            return (
              '<div class="roll__cell">' +
              '<button type="button" class="roll__date' +
              (n ? " roll__date--has" : "") +
              '" aria-expanded="false">' +
              esc(d.day) +
              (n ? '<span class="roll__count">' + n + "</span>" : "") +
              "</button>" +
              '<div class="roll__pop" hidden>' +
              '<div class="roll__pop-head">' +
              "<strong>" +
              n +
              (n === 1 ? " person" : " people") +
              "</strong>" +
              (when ? '<span class="roll__when">' + esc(when) + "</span>" : "") +
              "</div>" +
              '<ul class="roll__list">' +
              names +
              "</ul>" +
              "</div>" +
              "</div>"
            );
          })
          .join("");
        var total = mo.dates.reduce(function (n, d) {
          return n + heads(signupsFor(mo.name, d.day));
        }, 0);
        return (
          '<div class="roll__month">' +
          '<h3 class="roll__name">' +
          esc(mo.name) +
          "</h3>" +
          '<div class="roll__dates">' +
          (dates || '<p class="roll__empty">No dates yet.</p>') +
          "</div>" +
          '<p class="roll__total">' +
          total +
          (total === 1 ? " person this month" : " people this month") +
          "</p>" +
          "</div>"
        );
      })
      .join("");
    if (statusEl) {
      statusEl.textContent = window.IEA_SIGNUPS ? "" : "Sign in to see who is attending.";
    }
  }

  function closeAll(except) {
    roll.querySelectorAll(".roll__pop").forEach(function (pop) {
      if (pop === except) return;
      pop.hidden = true;
      var b = pop.previousElementSibling;
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }

  roll.addEventListener("click", function (e) {
    var btn = e.target.closest(".roll__date");
    if (!btn) return;
    var pop = btn.nextElementSibling;
    if (!pop) return;
    var opening = pop.hidden;
    closeAll(pop);
    pop.hidden = !opening;
    btn.setAttribute("aria-expanded", String(opening));
    // A date in the last column would hang its list off the panel — and off
    // the screen on a narrow window. Once it is shown, measure and flip it.
    pop.style.left = "";
    pop.style.right = "";
    if (opening) {
      var edge = roll.getBoundingClientRect().right;
      if (pop.getBoundingClientRect().right > edge) {
        pop.style.left = "auto";
        pop.style.right = "0";
      }
    }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".roll__cell")) closeAll();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll();
  });

  // Redraw when the sign-ups arrive, and whenever the editor above changes —
  // a new month, a new date, a renamed month, a changed day number.
  document.addEventListener("signups:loaded", render);

  // Fetching the sign-ups used to be the removed sign-ups panel's job; this
  // panel only listened. Now it fetches them itself, through the shared
  // IEA_loadProtected (top of this file), which carries the admin's token and
  // handles an expired sign-in.
  var loading = false;
  function loadSignups() {
    if (loading) return;
    loading = true;
    window.IEA_loadProtected("signups", "created_at.desc", function (state, rows) {
      loading = false;
      // Signed out (or the table missing, or an error): the months still draw,
      // with zero counts, rather than nothing at all.
      window.IEA_SIGNUPS = state === "ok" ? rows : [];
      if (state === "signed-out") window.IEA_SIGNUPS = null; // so the status says "Sign in"
      render();
    });
  }
  // Signing in only unhides the editor — the page never reloads — so load the
  // names the moment it appears, not only on first script run.
  if (editorView && "MutationObserver" in window) {
    new MutationObserver(function () {
      if (!editorView.hidden) loadSignups();
    }).observe(editorView, { attributes: true, attributeFilter: ["hidden"] });
  }
  if (editorView && !editorView.hidden) loadSignups();

  if (monthsWrap && "MutationObserver" in window) {
    var pending = null;
    var redraw = function () {
      clearTimeout(pending);
      pending = setTimeout(render, 150); // typing a day number fires per keystroke
    };
    new MutationObserver(redraw).observe(monthsWrap, { childList: true, subtree: true });
    monthsWrap.addEventListener("input", redraw);
    monthsWrap.addEventListener("change", redraw);
  }
  render();
})();

// --- Notify list: who asked to hear about new dates --------------------------
(function () {
  var list = document.querySelector("[data-notify-list]");
  var statusEl = document.querySelector("[data-notify-status]");
  var refreshBtn = document.querySelector("[data-notify-refresh]");
  var copyBtn = document.querySelector("[data-notify-copy]");
  var editorView = document.querySelector('[data-view="editor"]');
  if (!list) return;

  var emails = [];

  var esc = window.IEA_esc;
  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  function render(rows) {
    emails = rows.map(function (r) {
      return String(r.email || "").trim();
    }).filter(Boolean);
    if (copyBtn) copyBtn.hidden = !emails.length;
    if (!rows.length) {
      list.innerHTML = '<p class="inbox__empty">Nobody has asked to be notified yet.</p>';
      return;
    }
    list.innerHTML =
      '<p class="inbox__count">' +
      rows.length +
      (rows.length === 1 ? " address" : " addresses") +
      ", newest first</p>" +
      '<ul class="inbox__list">' +
      rows
        .map(function (r) {
          return (
            '<li class="inbox__row"><span class="inbox__main">' +
            esc(r.email) +
            (r.source ? '<span class="inbox__tag">' + esc(r.source) + "</span>" : "") +
            '</span><span class="inbox__meta">' +
            esc(window.IEA_when(r.created_at)) +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>";
  }

  var loading = false;
  function load() {
    if (loading) return;
    loading = true;
    setStatus("Loading…");
    window.IEA_loadProtected("notify_list", "created_at.desc", function (state, rows) {
      loading = false;
      if (state === "signed-out") {
        setStatus("Sign in to see the list.");
        return;
      }
      if (state === "missing") {
        setStatus("The notify_list table doesn’t exist in Supabase yet — run supabase-setup.sql.");
        list.innerHTML = "";
        return;
      }
      if (state === "error") {
        setStatus("Couldn’t load the list. Try Refresh in a moment.");
        return;
      }
      setStatus("");
      render(rows);
    });
  }

  if (refreshBtn) refreshBtn.addEventListener("click", load);
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = emails.join(", ");
      var done = function () {
        setStatus("Copied " + emails.length + (emails.length === 1 ? " address." : " addresses."));
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {
          setStatus("Couldn’t copy — select the list and copy it by hand.");
        });
      } else {
        setStatus("Couldn’t copy — select the list and copy it by hand.");
      }
    });
  }
  // Signing in only unhides the editor — the page never reloads — so load
  // the moment it appears, not only on first script run.
  if (editorView && "MutationObserver" in window) {
    new MutationObserver(function () {
      if (!editorView.hidden) load();
    }).observe(editorView, { attributes: true, attributeFilter: ["hidden"] });
  }
  if (editorView && !editorView.hidden) load();
})();

// --- Messages: what people sent through Get In Touch --------------------------
(function () {
  var list = document.querySelector("[data-messages-list]");
  var statusEl = document.querySelector("[data-messages-status]");
  var refreshBtn = document.querySelector("[data-messages-refresh]");
  var editorView = document.querySelector('[data-view="editor"]');
  if (!list) return;

  var esc = window.IEA_esc;
  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  function render(rows) {
    if (!rows.length) {
      list.innerHTML = '<p class="inbox__empty">No messages yet.</p>';
      return;
    }
    list.innerHTML =
      '<p class="inbox__count">' +
      rows.length +
      (rows.length === 1 ? " message" : " messages") +
      ", newest first</p>" +
      '<ul class="inbox__list">' +
      rows
        .map(function (r) {
          var who = ((r.name || "") + " " + (r.surname || "")).trim() || "No name given";
          // the email is a mailto link, so a click opens a reply in Irene's own
          // mail with the sender filled in. Everything typed by a stranger is
          // escaped before it goes on the page.
          return (
            '<li class="inbox__row"><span class="inbox__main"><strong>' +
            esc(who) +
            "</strong> · " +
            // esc() already neutralises quotes and angle brackets for the
            // attribute; "@" and "." stay as they are (encoding them shows up
            // literally in some mail apps)
            '<a href="mailto:' +
            esc(r.email) +
            '">' +
            esc(r.email) +
            "</a></span>" +
            '<span class="inbox__meta">' +
            esc(window.IEA_when(r.created_at)) +
            "</span>" +
            '<p class="inbox__body">' +
            esc(r.message) +
            "</p></li>"
          );
        })
        .join("") +
      "</ul>";
  }

  var loading = false;
  function load() {
    if (loading) return;
    loading = true;
    setStatus("Loading…");
    window.IEA_loadProtected("messages", "created_at.desc", function (state, rows) {
      loading = false;
      if (state === "signed-out") {
        setStatus("Sign in to see the messages.");
        return;
      }
      if (state === "missing") {
        setStatus("The messages table doesn’t exist in Supabase yet — run supabase-setup.sql.");
        list.innerHTML = "";
        return;
      }
      if (state === "error") {
        setStatus("Couldn’t load the messages. Try Refresh in a moment.");
        return;
      }
      setStatus("");
      render(rows);
    });
  }

  if (refreshBtn) refreshBtn.addEventListener("click", load);
  if (editorView && "MutationObserver" in window) {
    new MutationObserver(function () {
      if (!editorView.hidden) load();
    }).observe(editorView, { attributes: true, attributeFilter: ["hidden"] });
  }
  if (editorView && !editorView.hidden) load();
})();
