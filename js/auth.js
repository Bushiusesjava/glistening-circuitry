/* ============================================================
   auth.js  -  Firebase email/password login + page gating
   ------------------------------------------------------------
   Behaviour:
   - No real config (firebase-config.js still placeholder) or the
     Firebase SDK failed to load: everything is a no-op. The site
     works ungated and the auth entry points stay hidden.
   - Config present: index.html shows a "Log in" menu item + footer
     chip (signed out) or the user's email + "Log out" (signed in),
     instead of redirecting. login.html redirects to index.html when
     already signed in.

   Page detection: index.html has #term-window; login.html has
   #auth-form. This file runs on both pages.
   ============================================================ */

(function () {
  "use strict";

  var cfg = window.GC_FIREBASE_CONFIG || {};
  var sdk = window.firebase && window.firebase.auth;
  var configured = sdk && cfg.projectId && cfg.projectId.indexOf("YOUR_PROJECT") !== 0;

  var isLoginPage = !!document.getElementById("auth-form");
  var auth = null;

  /* ---- Rate limiter: 100 auth attempts per rolling hour ---- */
  var RATE_KEY = "gc_auth_rate";
  var RATE_LIMIT = 100;
  var RATE_WINDOW = 60 * 60 * 1000;

  function rateGet() {
    try { return JSON.parse(localStorage.getItem(RATE_KEY)) || null; }
    catch (e) { return null; }
  }

  function rateCheck() {
    var r = rateGet();
    if (!r || (Date.now() - r.first) > RATE_WINDOW) {
      r = { count: 1, first: Date.now() };
      localStorage.setItem(RATE_KEY, JSON.stringify(r));
      return true;
    }
    if (r.count >= RATE_LIMIT) return false;
    r.count++;
    localStorage.setItem(RATE_KEY, JSON.stringify(r));
    return true;
  }

  function rateRemaining() {
    var r = rateGet();
    if (!r || (Date.now() - r.first) > RATE_WINDOW) return RATE_LIMIT;
    return Math.max(0, RATE_LIMIT - r.count);
  }

  /* ---- Input handling ---- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function cleanEmail(value) {
    if (typeof value !== "string") return "";
    return value.trim().toLowerCase();
  }

  function validEmail(s) {
    return EMAIL_RE.test(s);
  }

  /* ---- Password strength scorer ---- */
  function strengthScore(pw) {
    if (typeof pw !== "string") return 0;
    var score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return score;
  }

  var STRENGTH_LABELS = ["very weak", "weak", "fair", "strong", "very strong"];
  var STRENGTH_MIN = 3;

  function strengthLabel(score) {
    return STRENGTH_LABELS[Math.min(score, STRENGTH_LABELS.length) - 1] || "very weak";
  }

  var api = {
    enabled: !!configured,
    db: null,
    currentUser: function () { return auth ? auth.currentUser : null; },
    onState: function (cb) { if (auth) auth.onAuthStateChanged(cb); },
    signIn: function (email, password) { return auth ? auth.signInWithEmailAndPassword(email, password) : Promise.reject(new Error("Auth unavailable")); },
    signUp: function (email, password) { return auth ? auth.createUserWithEmailAndPassword(email, password) : Promise.reject(new Error("Auth unavailable")); },
    signOut: function () { return auth ? auth.signOut() : Promise.resolve(); },
  };

  window.GC_AUTH = api;

  if (!configured) {
    if (isLoginPage) {
      var msg = document.getElementById("auth-msg");
      if (msg) {
        msg.textContent =
          "Firebase isn't configured yet. Open js/firebase-config.js and paste your " +
          "project credentials, then reload.";
        msg.className = "auth-msg err";
      }
    }
    return;
  }

  /* ---------- Live on the login page ---------- */
  function initLoginForm() {
    var form = document.getElementById("auth-form");
    var emailEl = document.getElementById("auth-email");
    var passEl = document.getElementById("auth-password");
    var msgEl = document.getElementById("auth-msg");
    var submit = document.getElementById("auth-submit");
    var mode = "signin";

    var meterWrap = document.getElementById("pw-strength");
    var meterBar = document.getElementById("pw-strength-bar");
    var meterLabel = document.getElementById("pw-strength-label");

    if (!form || !emailEl || !passEl || !msgEl || !submit) return;

    var tabSignin = document.getElementById("auth-tab-signin");
    var tabSignup = document.getElementById("auth-tab-signup");
    var heading = document.getElementById("auth-heading");
    var sub = document.getElementById("auth-sub");

    function updateMeter() {
      if (!meterWrap) return;
      if (mode !== "signup" || !passEl.value) {
        meterWrap.hidden = true;
        submit.disabled = false;
        return;
      }
      var s = strengthScore(passEl.value);
      meterWrap.hidden = false;
      meterBar.style.width = (s / 5 * 100) + "%";
      meterBar.className = "pw-bar pw-" + s;
      meterLabel.textContent = strengthLabel(s);
      submit.disabled = s < STRENGTH_MIN;
    }

    passEl.addEventListener("input", updateMeter);

    function setMode(m) {
      mode = m;
      var signin = m === "signin";
      if (tabSignin) tabSignin.classList.toggle("active", signin);
      if (tabSignup) tabSignup.classList.toggle("active", !signin);
      if (heading) heading.textContent = signin ? "sign in" : "create account";
      if (sub) sub.textContent = signin ? "Welcome back, authenticate to continue." : "Pick a password, nothing fancy needed.";
      submit.textContent = signin ? "Sign in" : "Create account";
      updateMeter();
    }
    if (tabSignin) tabSignin.addEventListener("click", function () { setMode("signin"); });
    if (tabSignup) tabSignup.addEventListener("click", function () { setMode("signup"); });

    function show(text, isErr) {
      msgEl.textContent = text;
      msgEl.className = "auth-msg " + (isErr ? "err" : "ok");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!rateCheck()) {
        var left = Math.ceil(rateRemaining() / 60000);
        return show("Too many attempts. Try again in " + left + " minute" + (left === 1 ? "" : "s") + ".", true);
      }
      var email = cleanEmail(emailEl.value);
      var password = passEl.value;
      if (!email || !validEmail(email)) return show("Enter a valid email address.", true);
      if (!password) return show("Enter a password.", true);
      if (mode === "signup" && strengthScore(password) < STRENGTH_MIN) {
        return show("Password is too weak. Aim for uppercase, numbers, and symbols.", true);
      }
      submit.disabled = true;
      submit.textContent = "…";
      var p = mode === "signin"
        ? api.signIn(email, password)
        : api.signUp(email, password).then(function () {
            // Signed-up users count as logged in automatically.
          });
      p.then(function () {
        window.location.replace("index.html");
      }).catch(function (err) {
        var code = err && err.code;
        var pretty =
          code === "auth/wrong-password" || code === "auth/user-not-found" ? "Email or password is wrong." :
          code === "auth/invalid-email" ? "That email address doesn't look valid." :
          code === "auth/weak-password" ? "Password needs to be at least 6 characters." :
          code === "auth/email-already-in-use" ? "An account already exists for that email." :
          (err && err.message) ? err.message :
          "Something went wrong. Try again.";
        show(pretty, true);
        submit.disabled = false;
        submit.textContent = mode === "signin" ? "Sign in" : "Create account";
      });
    });
  }

  /* ---------- Login / logout entry points on the app page ---------- */
  function initAuthEntryPoints() {
    var logoutBtn = document.getElementById("auth-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        api.signOut().then(function () {
          window.location.replace("login.html");
        });
      });
    }

    var guestLogin = document.getElementById("auth-login");
    if (guestLogin) {
      guestLogin.addEventListener("click", function () {
        window.location.replace("login.html");
      });
    }

    var menu = document.getElementById("auth-menu");
    if (menu) {
      menu.addEventListener("click", function () {
        if (auth && auth.currentUser) {
          auth.signOut().then(function () {
            window.location.replace("login.html");
          });
        } else {
          window.location.replace("login.html");
        }
      });
      menu.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          menu.click();
        }
      });
    }
  }

  firebase.initializeApp(cfg);
  auth = firebase.auth();
  api.db = firebase.firestore();

  initLoginForm();
  initAuthEntryPoints();

  api.onState(function (user) {
    var zone = document.getElementById("auth-user");
    if (zone) zone.hidden = !user;
    var userLabel = document.getElementById("auth-user-label");
    if (userLabel) userLabel.textContent = user ? user.email : "";

    var guestZone = document.getElementById("auth-guest");
    if (guestZone) guestZone.hidden = !!user;

    var menu = document.getElementById("auth-menu");
    if (menu) {
      menu.hidden = false;
      menu.textContent = user ? "Log out" : "Log in";
    }

    if (isLoginPage && user) {
      window.location.replace("index.html");
    }
  });
})();
