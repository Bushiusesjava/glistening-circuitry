/* ============================================================
   Spark Workshop — app.js
   Navigation, project browsing, modals, fundamentals + calculators
   ============================================================ */

(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- Tab navigation ---------- */
  const tabs = {
    home: $("#tab-home"),
    makerspace: $("#tab-makerspace"),
    fundamentals: $("#tab-fundamentals"),
  };

  function switchTab(name) {
    Object.keys(tabs).forEach((k) => {
      const on = k === name;
      tabs[k].classList.toggle("active", on);
    });
    $$(".nav-btn").forEach((b) => {
      const on = b.dataset.tab === name;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    window.scrollTo({ top: 0 });
  }

  $$(".nav-btn").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));
  $$("[data-goto]").forEach((b) =>
    b.addEventListener("click", () => switchTab(b.dataset.goto))
  );

  /* ============================================================
     PROJECT IDEAS
     ============================================================ */

  const state = { cat: "all", diff: "all", q: "" };

  function buildChips() {
    const wrap = $("#cat-chips");
    wrap.innerHTML = "";
    const all = document.createElement("button");
    all.className = "chip active";
    all.textContent = "All";
    all.dataset.cat = "all";
    wrap.appendChild(all);
    CATEGORIES.forEach((c) => {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = c;
      b.dataset.cat = c;
      wrap.appendChild(b);
    });
    wrap.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state.cat = chip.dataset.cat;
      $$(".chip", wrap).forEach((c) => c.classList.toggle("active", c === chip));
      renderProjects();
    });
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    return PROJECTS.filter((p) => {
      if (state.cat !== "all" && p.category !== state.cat) return false;
      if (state.diff !== "all" && p.difficulty !== state.diff) return false;
      if (q) {
        const hay = [p.title, p.category, p.blurb, p.description, ...p.skills].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderProjects() {
    const list = filtered();
    const grid = $("#project-grid");
    grid.innerHTML = "";
    $("#no-results").hidden = list.length > 0;
    $("#result-count").textContent = list.length + (list.length === 1 ? " project" : " projects");
    $("#result-note").textContent =
      state.diff !== "all" ? "Filtered by difficulty" : "";
    list.forEach((p) => grid.appendChild(projectCard(p)));
  }

  function projectCard(p) {
    const card = document.createElement("article");
    card.className = "card pcard";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Open project: " + p.title);
    card.innerHTML = `
      <div class="tagrow">
        <span class="tag diff-${p.difficulty.toLowerCase()}">${esc(p.difficulty)}</span>
        <span class="tag cat">${esc(p.category)}</span>
      </div>
      <h3>${esc(p.title)}</h3>
      <p class="blurb">${esc(p.blurb)}</p>
      <div class="meta">
        <span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${esc(p.time)}</span>
        <span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>${esc(p.cost)}</span>
      </div>`;
    const open = () => openModal(p);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
    return card;
  }

  /* ---------- Project modal ---------- */
  function openModal(p) {
    const root = $("#modal-root");
    root.innerHTML = "";
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">
        <div class="modal-head">
          <h2 id="m-title">${esc(p.title)}</h2>
          <button class="modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="tagrow">
          <span class="tag diff-${p.difficulty.toLowerCase()}">${esc(p.difficulty)}</span>
          <span class="tag cat">${esc(p.category)}</span>
          <span class="muted small">${esc(p.time)} · ${esc(p.cost)}</span>
        </div>
        <p class="desc">${esc(p.description)}</p>

        <div class="section-title">Parts & supplies</div>
        <ul class="comp-list">
          ${p.components.map((c) => `
            <li><label><input type="checkbox"><span>${esc(c)}</span></label></li>`).join("")}
        </ul>

        <div class="section-title">Build steps</div>
        <ol class="steps">${p.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>

        <div class="section-title">Skills you'll gain</div>
        <div class="skills">${p.skills.map((s) => `<span class="skill">${esc(s)}</span>`).join("")}</div>

        <div class="row" style="margin-top:22px">
          <button class="btn primary" id="modal-fund">Learn the fundamentals first</button>
          <button class="btn" id="modal-close">Close</button>
        </div>
      </div>`;

    $$(".comp-list input", backdrop).forEach((box) =>
      box.addEventListener("change", () => {
        const span = box.closest("label").querySelector("span");
        span.classList.toggle("checked", box.checked);
      })
    );
    const close = () => { root.innerHTML = ""; };
    $(".modal-close", backdrop).addEventListener("click", close);
    $("#modal-close", backdrop).addEventListener("click", close);
    $("#modal-fund", backdrop).addEventListener("click", () => {
      close();
      switchTab("fundamentals");
    });
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey); }
    });
    root.appendChild(backdrop);
  }

  /* ---------- Search wiring ---------- */
  $("#search").addEventListener("input", (e) => {
    state.q = e.target.value;
    renderProjects();
  });
  $("#diff-filter").addEventListener("change", (e) => {
    state.diff = e.target.value;
    renderProjects();
  });

  /* ============================================================
     FUNDAMENTALS
     ============================================================ */

  const DONE_KEY = "spark-lessons-done";

  function doneSet() {
    try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || "[]")); }
    catch { return new Set(); }
  }

  function saveDone(set) {
    try { localStorage.setItem(DONE_KEY, JSON.stringify(Array.from(set))); }
    catch { /* storage unavailable (e.g. private mode) — fine */ }
  }

  function renderLessonList(activeId) {
    const list = $("#lesson-list");
    list.innerHTML = "";
    const done = doneSet();
    LESSONS.forEach((l, i) => {
      const btn = document.createElement("button");
      btn.className = "lesson-btn" + (l.id === activeId ? " active" : "") + (done.has(l.id) ? " done" : "");
      btn.innerHTML = `
        <span class="lesson-num">${i + 1}</span>
        <span class="l-title">${esc(l.title)}</span>
        <span class="check">${done.has(l.id) ? "✓" : ""}</span>`;
      btn.addEventListener("click", () => showLesson(l.id));
      list.appendChild(btn);
    });
    updateProgress();
  }

  function updateProgress() {
    const done = doneSet();
    const n = LESSONS.filter((l) => done.has(l.id)).length;
    $("#fund-progress").textContent = n + " / " + LESSONS.length;
    $("#fund-bar").style.width = (n / LESSONS.length * 100) + "%";
  }

  function showLesson(id) {
    const lesson = LESSONS.find((l) => l.id === id);
    if (!lesson) return;
    const article = $("#lesson-article");
    const done = doneSet();
    article.innerHTML = `
      <div class="lesson-head">
        <div class="tagrow"><span class="level">${esc(lesson.level)}</span></div>
        <h2>${esc(lesson.title)}</h2>
      </div>
      ${lesson.html}
      <div class="lesson-done-row">
        <span class="muted small">${esc(lesson.blurb)}</span>
        <button class="btn ${done.has(id) ? "ghost" : "primary"}" id="lesson-done">
          ${done.has(id) ? "Mark as unread" : "Mark as complete"}
        </button>
      </div>`;

    $("#lesson-done").addEventListener("click", () => {
      const set = doneSet();
      if (set.has(id)) set.delete(id); else set.add(id);
      saveDone(set);
      renderLessonList(id);
      showLesson(id);
    });
    renderLessonList(id);
    initCalcs(article);
    article.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- Calculators ---------- */
  function initCalcs(root) {
    $$(".calc", root).forEach((calc) => {
      const run = $("[data-calc-run]", calc);
      if (run) run.addEventListener("click", () => runCalc(calc));
      $$("input", calc).forEach((inp) =>
        inp.addEventListener("keydown", (e) => { if (e.key === "Enter") runCalc(calc); })
      );
    });
  }

  function num(id) {
    const el = document.getElementById(id);
    const v = parseFloat(el ? el.value : "");
    return isFinite(v) ? v : null;
  }

  function runCalc(calc) {
    const out = $(".calc-out", calc);
    const kind = calc.dataset.calc;
    try {
      let msg;
      if (kind === "ohms") msg = calcOhms();
      else if (kind === "led") msg = calcLed();
      else if (kind === "rc") msg = calcRc();
      out.textContent = msg;
      out.classList.remove("err");
    } catch (e) {
      out.textContent = e.message;
      out.classList.add("err");
    }
  }

  function fmt(v, unit) {
    return (Math.round(v * 1000) / 1000) + " " + unit;
  }

  function calcOhms() {
    const v = num("oh-v"), i = num("oh-i"), r = num("oh-r");
    const filled = [v, i, r].filter((x) => x !== null).length;
    if (filled < 2) throw new Error("Fill in at least two of the three fields.");
    if (filled === 2) {
      if (v === null) return "V = I × R = " + fmt(i * r, "V");
      if (i === null) return "I = V ÷ R = " + fmt(v / r, "A");
      return "R = V ÷ I = " + fmt(v / i, "Ω");
    }
    const p = v * i;
    return "V = " + fmt(v, "V") + " · I = " + fmt(i, "A") + " · R = " + fmt(r, "Ω") + " · P = " + fmt(p, "W");
  }

  function calcLed() {
    const vs = num("ld-vs"), vf = num("ld-vf"), ima = num("ld-i");
    if (vs === null || vf === null || ima === null) throw new Error("Enter supply, forward voltage, and current.");
    if (vs <= vf) throw new Error("Supply voltage must exceed the LED forward drop.");
    const i = ima / 1000;
    const r = (vs - vf) / i;
    const std = [10,12,15,18,22,27,33,39,47,56,68,82,100,120,150,180,220,270,330,390,470,560,680,820,1000];
    let best = std[0];
    std.forEach((s) => { if (Math.abs(s - r) < Math.abs(best - r)) best = s; });
    const p = r * i * i;
    return "R = " + fmt(r, "Ω") + " (nearest standard: " + best + " Ω · " + (best >= 1000 ? (best/1000) + " kΩ" : best + " Ω") + ") · resistor dissipates " + fmt(p, "W");
  }

  function calcRc() {
    const r = num("rc-r"), c = num("rc-c");
    if (r === null || c === null) throw new Error("Enter both resistance and capacitance.");
    const tau = r * (c / 1e6);
    const out = tau >= 1 ? tau + " s" : (tau * 1000) + " ms";
    return "τ = " + out + " · 95% charge at 3τ (" + (tau * 3 >= 1 ? (tau * 3) + " s" : (tau * 3 * 1000) + " ms") + ") · ~full at 5τ (" + (tau * 5 >= 1 ? (tau * 5) + " s" : (tau * 5 * 1000) + " ms") + ")";
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    buildChips();
    renderProjects();
    renderLessonList(null);
    const first = $("#lesson-list .lesson-btn");
    if (first) first.click();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
