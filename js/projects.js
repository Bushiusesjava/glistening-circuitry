/* ============================================================
   projects.js  -  category chips, filtering, grid, project modal
   Depends on: data.js (PROJECTS, CATEGORIES), ui.js (GC helpers)
   ============================================================ */

(function () {
  "use strict";

  const { $, $$, esc, switchTab } = window.GC;

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

  function renderProjects() {
    const list = filtered();
    const grid = $("#project-grid");
    grid.innerHTML = "";
    $("#no-results").hidden = list.length > 0;
    $("#result-count").textContent = list.length + (list.length === 1 ? " project" : " projects");
    $("#result-note").textContent =
      state.diff !== "all" ? "Filtered by difficulty" : "";
    const statusProjects = document.getElementById("status-projects");
    if (statusProjects) statusProjects.textContent = list.length + (list.length === 1 ? " project" : " projects");
    list.forEach((p) => grid.appendChild(projectCard(p)));
  }

  function projectCard(p) {
    const card = document.createElement("article");
    card.className = "card pcard";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Open project: " + p.title);
    card.dataset.diff = p.difficulty;
    card.innerHTML = `
      <div class="tagrow">
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
        <div class="modal-bar">
          <span>&#9484;&#9472; config</span>
          <span class="bar-line"></span>
          <span class="bar-x">&#9587;</span>
        </div>
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
    if (window.GC && window.GC.trackExplored) window.GC.trackExplored(p.id);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!$("#cat-chips") || !PROJECTS) return;
    buildChips();
    renderProjects();
    $("#search").addEventListener("input", (e) => {
      state.q = e.target.value;
      renderProjects();
    });
    $("#diff-filter").addEventListener("change", (e) => {
      state.diff = e.target.value;
      renderProjects();
    });
  });
})();
