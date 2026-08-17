/* ============================================================
   dashboard.js - project log (Firestore), forum, progress stats
   Depends on: ui.js (GC helpers), auth.js (GC_AUTH with db)
   ============================================================ */

(function () {
  "use strict";

  var EXPLORED_KEY = "gc_explored";
  var LESSONS_KEY  = "spark-lessons-done";

  /* ---------- localStorage helpers ---------- */
  function exploredSet() {
    try { return new Set(JSON.parse(localStorage.getItem(EXPLORED_KEY) || "[]")); }
    catch { return new Set(); }
  }
  function lessonsSet() {
    try { return new Set(JSON.parse(localStorage.getItem(LESSONS_KEY) || "[]")); }
    catch { return new Set(); }
  }

  /* ---------- State ---------- */
  var projects = [];
  var forumPosts = [];
  var uid = null;
  var db  = null;

  /* ---------- DOM refs ---------- */
  var dashGuest, dashAuthed;
  var statExplored, statLessons, statLogged, statShared;
  var dashLog;
  var editor, editorTitle, editorClose;
  var fieldTitle, fieldBlurb, fieldTags, fieldDiff, fieldNotes, fieldId;
  var btnSave, btnDelete, btnNew;
  var backdrop = null;

  /* ---------- Firestore refs ---------- */
  function userProjects() { return db.collection("users").doc(uid).collection("projects"); }
  var forumCol = null;

  /* ---------- Init ---------- */
  function init() {
    dashGuest   = document.getElementById("dash-guest");
    dashAuthed  = document.getElementById("dash-authed");
    statExplored = document.getElementById("stat-explored");
    statLessons  = document.getElementById("stat-lessons");
    statLogged   = document.getElementById("stat-logged");
    statShared   = document.getElementById("stat-shared");
    dashLog      = document.getElementById("dash-log");

    editor       = document.getElementById("dash-editor");
    editorTitle  = document.getElementById("dash-editor-title");
    editorClose  = document.getElementById("dash-editor-close");
    fieldTitle   = document.getElementById("dash-p-title");
    fieldBlurb   = document.getElementById("dash-p-blurb");
    fieldTags    = document.getElementById("dash-p-tags");
    fieldDiff    = document.getElementById("dash-p-diff");
    fieldNotes   = document.getElementById("dash-p-notes");
    fieldId      = document.getElementById("dash-p-id");
    btnSave      = document.getElementById("dash-save");
    btnDelete    = document.getElementById("dash-delete");
    btnNew       = document.getElementById("dash-new");

    if (btnNew)     btnNew.addEventListener("click", function () { openEditor(null); });
    if (editorClose) editorClose.addEventListener("click", closeEditor);
    if (btnSave)    btnSave.addEventListener("click", saveProject);
    if (btnDelete)  btnDelete.addEventListener("click", deleteProject);

    var auth = window.GC_AUTH;
    if (!auth || !auth.enabled) return;

    auth.onState(function (user) {
      if (user && auth.db) {
        uid = user.uid;
        db  = auth.db;
        forumCol = db.collection("forum");
        dashGuest.hidden  = true;
        dashAuthed.hidden = false;
        loadProjects();
        loadForum();
      } else {
        uid = null;
        db  = null;
        dashGuest.hidden  = false;
        dashAuthed.hidden = true;
      }
      refreshStats();
    });

    refreshStats();
  }

  /* ---------- Stats ---------- */
  function refreshStats() {
    if (statExplored) statExplored.textContent = exploredSet().size;
    if (statLessons)  statLessons.textContent  = lessonsSet().size;
    if (statLogged)   statLogged.textContent    = projects.length;
    if (statShared)   statShared.textContent    = projects.filter(function (p) { return p.status === "shared"; }).length;
  }

  /* ---------- Load project log ---------- */
  function loadProjects() {
    if (!db || !uid) return;
    userProjects().orderBy("createdAt", "desc").onSnapshot(function (snap) {
      projects = [];
      snap.forEach(function (doc) {
        var d = doc.data();
        d.id = doc.id;
        projects.push(d);
      });
      renderProjects();
      refreshStats();
    });
  }

  /* ---------- Render project log ---------- */
  function renderProjects() {
    if (!dashLog) return;
    dashLog.innerHTML = "";
    if (projects.length === 0) {
      dashLog.innerHTML = '<div class="empty"><p>No projects logged yet. Start documenting your builds!</p></div>';
      return;
    }
    projects.forEach(function (p) {
      var el = document.createElement("div");
      el.className = "dash-entry";
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");

      var tags = (p.tags || []).map(function (t) {
        return '<span class="tag cat">' + esc(t) + '</span>';
      }).join("");

      var shared = p.status === "shared";

      el.innerHTML =
        '<div class="dash-entry-info">' +
          '<h4>' + esc(p.title || "Untitled") + '</h4>' +
          '<p>' + esc(p.blurb || "") + '</p>' +
          '<div class="dash-entry-meta">' +
            '<span class="tag diff-' + (p.difficulty || "beginner").toLowerCase() + '">' + esc(p.difficulty || "Beginner") + '</span>' +
            tags +
          '</div>' +
        '</div>' +
        '<div class="dash-entry-actions">' +
          (shared
            ? '<span class="btn shared">Shared</span>'
            : '<button class="btn primary dash-share" data-id="' + p.id + '">Share to Forum</button>') +
          '<button class="btn dash-edit" data-id="' + p.id + '">Edit</button>' +
        '</div>';

      el.addEventListener("click", function (e) {
        if (e.target.closest(".dash-share")) { shareProject(p.id); return; }
        if (e.target.closest(".dash-edit"))  { openEditor(p); return; }
      });

      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openEditor(p);
        }
      });

      dashLog.appendChild(el);
    });
  }

  /* ---------- Editor ---------- */
  function openEditor(project) {
    if (!editor) return;
    if (project) {
      editorTitle.textContent = "Edit Project";
      fieldId.value    = project.id;
      fieldTitle.value = project.title || "";
      fieldBlurb.value = project.blurb || "";
      fieldTags.value  = (project.tags || []).join(", ");
      fieldDiff.value  = project.difficulty || "Beginner";
      fieldNotes.value = project.notes || "";
      btnDelete.hidden = project.status === "shared";
    } else {
      editorTitle.textContent = "New Project";
      fieldId.value    = "";
      fieldTitle.value = "";
      fieldBlurb.value = "";
      fieldTags.value  = "";
      fieldDiff.value  = "Beginner";
      fieldNotes.value = "";
      btnDelete.hidden = true;
    }
    showBackdrop();
    editor.hidden = false;
    fieldTitle.focus();
  }

  function closeEditor() {
    if (editor) editor.hidden = true;
    hideBackdrop();
  }

  function showBackdrop() {
    if (backdrop) return;
    backdrop = document.createElement("div");
    backdrop.className = "dash-editor-backdrop";
    backdrop.addEventListener("click", closeEditor);
    document.body.appendChild(backdrop);
  }

  function hideBackdrop() {
    if (backdrop) { backdrop.remove(); backdrop = null; }
  }

  /* ---------- CRUD ---------- */
  function saveProject() {
    if (!db || !uid) return;
    var title = fieldTitle.value.trim();
    if (!title) return;
    var data = {
      title: title,
      blurb: fieldBlurb.value.trim(),
      tags: fieldTags.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean),
      difficulty: fieldDiff.value,
      notes: fieldNotes.value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    var id = fieldId.value;
    if (id) {
      userProjects().doc(id).update(data);
    } else {
      data.status = "draft";
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      userProjects().add(data);
    }
    closeEditor();
  }

  function deleteProject() {
    var id = fieldId.value;
    if (!id || !db || !uid) return;
    if (!confirm("Delete this project from your log?")) return;
    userProjects().doc(id).delete();
    closeEditor();
  }

  function shareProject(id) {
    if (!db || !uid) return;
    var p = projects.find(function (x) { return x.id === id; });
    if (!p || p.status === "shared") return;
    if (!confirm('Share "' + p.title + '" to the public forum?')) return;

    var auth = window.GC_AUTH;
    var email = auth && auth.currentUser ? (auth.currentUser().email || "anon") : "anon";

    forumCol.add({
      title: p.title,
      blurb: p.blurb,
      notes: p.notes,
      tags: p.tags || [],
      difficulty: p.difficulty,
      authorEmail: email,
      authorUid: uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      sourceId: id,
    }).then(function (ref) {
      userProjects().doc(id).update({ status: "shared", sharedAt: firebase.firestore.FieldValue.serverTimestamp() });
    }).catch(function (err) {
      alert("Share failed: " + err.message);
    });
  }

  /* ---------- Forum ---------- */
  function loadForum() {
    if (!forumCol) return;
    forumCol.orderBy("createdAt", "desc").limit(50).onSnapshot(function (snap) {
      forumPosts = [];
      snap.forEach(function (doc) {
        var d = doc.data();
        d.id = doc.id;
        forumPosts.push(d);
      });
      renderForum();
    });
  }

  function renderForum() {
    var el = document.getElementById("forum-posts");
    if (!el) return;
    el.innerHTML = "";
    if (forumPosts.length === 0) {
      el.innerHTML = '<div class="empty"><p>No shared projects yet. Be the first to share!</p></div>';
      return;
    }
    forumPosts.forEach(function (p) {
      var tags = (p.tags || []).map(function (t) {
        return '<span class="tag cat">' + esc(t) + '</span>';
      }).join("");

      var card = document.createElement("div");
      card.className = "forum-post";

      var dateStr = "";
      if (p.createdAt && p.createdAt.toDate) {
        dateStr = p.createdAt.toDate().toLocaleDateString();
      }

      card.innerHTML =
        '<div class="forum-post-head">' +
          '<h4>' + esc(p.title || "Untitled") + '</h4>' +
          '<span class="forum-post-author">' + esc(p.authorEmail || "anon") + (dateStr ? " \u00b7 " + dateStr : "") + '</span>' +
        '</div>' +
        (p.blurb ? '<p class="forum-post-blurb">' + esc(p.blurb) + '</p>' : "") +
        (p.notes ? '<div class="forum-post-notes">' + esc(p.notes) + '</div>' : "") +
        '<div class="forum-post-footer">' +
          '<span class="tag diff-' + (p.difficulty || "beginner").toLowerCase() + '">' + esc(p.difficulty || "Beginner") + '</span>' +
          tags +
        '</div>';

      el.appendChild(card);
    });
  }

  /* ---------- Helpers ---------- */
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  /* ---------- Track explored projects (called from projects.js modal) ---------- */
  window.GC = window.GC || {};
  window.GC.trackExplored = function (id) {
    try {
      var s = exploredSet();
      s.add(id);
      localStorage.setItem(EXPLORED_KEY, JSON.stringify(Array.from(s)));
      refreshStats();
    } catch (e) {}
  };

  document.addEventListener("DOMContentLoaded", init);
})();
