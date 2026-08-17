/* ============================================================
   fundamentals.js  -  lesson list, done-progress, calculators
   Depends on: data.js (LESSONS), ui.js (GC helpers)
   ============================================================ */

(function () {
  "use strict";

  const { $, $$, esc } = window.GC;

  const DONE_KEY = "spark-lessons-done";

  function doneSet() {
    try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || "[]")); }
    catch { return new Set(); }
  }

  function saveDone(set) {
    try { localStorage.setItem(DONE_KEY, JSON.stringify(Array.from(set))); }
    catch { /* storage unavailable (e.g. private mode)  -  fine */ }
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
        <span class="check">${done.has(l.id) ? "[x]" : "[ ]"}</span>`;
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

  document.addEventListener("DOMContentLoaded", () => {
    if (!$("#lesson-list") || !LESSONS) return;
    renderLessonList(null);
    const first = $("#lesson-list .lesson-btn");
    if (first) first.click();
  });
})();
