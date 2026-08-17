/* ============================================================
   ui.js  -  shared helpers, tab navigation, terminal caret, sparks
   Exposes a small global namespace: window.GC
   ============================================================ */

(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  /* ---------- Tab navigation ---------- */
  const tabs = {
    home: $("#tab-home"),
    makerspace: $("#tab-makerspace"),
    fundamentals: $("#tab-fundamentals"),
    dashboard: $("#tab-dashboard"),
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
    const label = { home: "browse", makerspace: "makerspace", fundamentals: "learn", dashboard: "dashboard" }[name] || name;
    const statusTab = document.getElementById("status-tab");
    if (statusTab) statusTab.textContent = label;
    window.scrollTo({ top: 0 });
  }

  /* ---------- Terminal caret for the search field ---------- */
  function initTerminalCaret() {
    const input = $("#search");
    const bar = input && input.closest(".searchbar");
    const caret = $("#search-caret");
    if (!input || !bar || !caret) return;

    const mirror = document.createElement("span");
    mirror.id = "search-mirror";
    mirror.setAttribute("aria-hidden", "true");
    document.body.appendChild(mirror);

    function sync() {
      const cs = window.getComputedStyle(input);
      mirror.style.fontFamily = cs.fontFamily;
      mirror.style.fontSize = cs.fontSize;
      mirror.style.fontWeight = cs.fontWeight;
      mirror.style.fontStyle = cs.fontStyle;
      mirror.style.letterSpacing = cs.letterSpacing;
      mirror.textContent = input.value.slice(0, input.selectionStart || 0);
      const textW = mirror.getBoundingClientRect().width;
      const barRect = bar.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      let left = inputRect.left - barRect.left + textW;
      const max = inputRect.right - barRect.left - 6;
      if (left > max) left = max;
      caret.style.left = left + "px";
    }

    ["input", "keyup", "keydown", "click", "focus", "blur"].forEach((ev) =>
      input.addEventListener(ev, sync)
    );
    document.addEventListener("selectionchange", sync);
    window.addEventListener("resize", sync);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(sync);
    }
    sync();
  }

  /* ---------- Spark click effect ---------- */
  function initSparks() {
    let layer = document.getElementById("spark-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "spark-layer";
      document.body.appendChild(layer);
    }

    const reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const COLORS = ["#33ff66", "#dcffe5", "#7dffa0", "#b8ff3d", "#37a35f"];

    function sparksAt(x, y) {
      const n = 12;
      for (let i = 0; i < n; i++) {
        const s = document.createElement("span");
        s.className = "spark";
        const ang = Math.random() * Math.PI * 2;
        const dist = 22 + Math.random() * 46;
        const size = 2.5 + Math.random() * 4.5;
        const dur = 0.4 + Math.random() * 0.4;
        s.style.left = x + "px";
        s.style.top = y + "px";
        s.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(1) + "px");
        s.style.setProperty("--dy", (Math.sin(ang) * dist - 10).toFixed(1) + "px");
        s.style.setProperty("--size", size.toFixed(1) + "px");
        s.style.setProperty("--dur", dur.toFixed(2) + "s");
        s.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
        layer.appendChild(s);
        s.addEventListener("animationend", () => s.remove());
      }
      const f = document.createElement("span");
      f.className = "spark-flash";
      f.style.left = x + "px";
      f.style.top = y + "px";
      layer.appendChild(f);
      f.addEventListener("animationend", () => f.remove());
    }

    document.addEventListener(
      "click",
      (e) => {
        const hit = e.target.closest && e.target.closest("button, [data-goto], .chip");
        if (!hit) return;
        const r = hit.getBoundingClientRect();
        const x = e.clientX > 0 ? e.clientX : r.left + r.width / 2;
        const y = e.clientY > 0 ? e.clientY : r.top + r.height / 2;
        sparksAt(x, y);
      },
      { passive: true }
    );
  }

  /* ---------- Shared namespace ---------- */
  window.GC = window.GC || {};
  window.GC.$ = $;
  window.GC.$$ = $$;
  window.GC.esc = esc;
  window.GC.switchTab = switchTab;

  document.addEventListener("DOMContentLoaded", () => {
    $$(".nav-btn").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));
    $$("[data-goto]").forEach((b) =>
      b.addEventListener("click", () => switchTab(b.dataset.goto))
    );
    initTerminalCaret();
    initSparks();
  });
})();
