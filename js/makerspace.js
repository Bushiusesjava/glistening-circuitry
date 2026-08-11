/* ============================================================
   Spark Workshop — makerspace.js
   Live video rooms + chat via PeerJS (WebRTC, no server data)
   ============================================================ */

(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);

  const PEERJS_URL = "https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js";
  const PREFIX = "spark-workshop-";
  const ICE = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478" },
    ],
  };

  const ui = {
    name: $("#ms-name"),
    room: $("#ms-room"),
    cam: $("#ms-cam"),
    mic: $("#ms-mic"),
    host: $("#ms-host"),
    join: $("#ms-join"),
    random: $("#ms-random"),
    secureNote: $("#ms-secure-note"),
    status: $("#ms-status"),
    log: $("#ms-log"),
    call: $("#ms-call"),
    chat: $("#ms-chat"),
    prejoin: $("#ms-prejoin"),
    roomLabel: $("#ms-room-label"),
    roleLabel: $("#ms-role-label"),
    grid: $("#video-grid"),
    chatMsgs: $("#chat-msgs"),
    chatForm: $("#chat-form"),
    chatInput: $("#chat-input"),
    btnMic: $("#btn-mic"),
    btnCam: $("#btn-cam"),
    btnScreen: $("#btn-screen"),
    btnScreenLabel: $("#btn-screen-label"),
    btnLeave: $("#btn-leave"),
  };

  const MS = {
    peer: null,
    room: null,
    isHost: false,
    name: "",
    stream: null,
    conns: new Map(),   // peerId -> DataConnection
    calls: new Map(),   // peerId -> MediaConnection
    sharing: null,      // displayMedia stream while sharing
    started: false,
  };

  let peerScriptLoading = null;

  function loadPeerJS() {
    if (window.Peer) return Promise.resolve(window.Peer);
    if (peerScriptLoading) return peerScriptLoading;
    peerScriptLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = PEERJS_URL;
      s.onload = () => (window.Peer ? resolve(window.Peer) : reject(new Error("PeerJS loaded but unavailable")));
      s.onerror = () => reject(new Error("Could not load PeerJS from CDN — check your internet connection."));
      document.head.appendChild(s);
    });
    return peerScriptLoading;
  }

  function log(msg, cls) {
    const div = document.createElement("div");
    if (cls) div.className = cls;
    div.textContent = msg;
    ui.log.appendChild(div);
    ui.log.scrollTop = ui.log.scrollHeight;
  }

  function setStatus(html) {
    ui.status.innerHTML = html;
  }

  function resetStatus() {
    setStatus('<span class="pill idle">Not connected</span>');
    ui.log.innerHTML = "";
  }

  function cleanRoomName(s) {
    return s.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40) || null;
  }

  function roomIds(room) {
    return { host: PREFIX + room + "-host" };
  }

  const adjectives = ["solar", "spark", "copper", "plasma", "relay", "diode", "torch", "flux"];
  const nouns = ["bench", "solder", "grid", "wave", "channel", "shield", "winder", "tube"];

  function randomRoom() {
    const a = adjectives[Math.floor(Math.random() * adjectives.length)];
    const n = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 90 + 10);
    return a + "-" + n + "-" + num;
  }

  function secureNote() {
    const ok = window.isSecureContext;
    if (!ok) {
      ui.secureNote.textContent = "Camera & microphone need a secure context. Serve this folder over https:// or localhost.";
      ui.secureNote.style.color = "var(--red)";
    } else {
      ui.secureNote.textContent = "Peer-to-peer video — your stream goes directly to other browsers, never through a server.";
    }
  }

  async function getMedia() {
    const wantVideo = ui.cam.checked;
    const wantAudio = ui.mic.checked;
    if (!wantVideo && !wantAudio) {
      throw new Error("Enable at least camera or microphone to enter a room.");
    }
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: wantVideo ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: wantAudio,
      });
    } catch (e) {
      throw new Error("Could not access camera/microphone. Check permissions, or another app may be using them. (" + e.name + ")");
    }
  }

  /* ---------- Video tiles ---------- */

  function addTile(peerId, labelText, stream) {
    const tileId = "tile-" + peerId;
    let tile = document.getElementById(tileId);
    if (!tile) {
      tile = document.createElement("div");
      tile.className = "tile";
      tile.id = tileId;
      tile.innerHTML = `
        <div class="muted-video" hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m15 8 6-2v12l-6-2"/></svg>
        </div>
        <video autoplay playsinline></video>
        <span class="tile-label"></span>
        <span class="tile-badge" hidden>SCREEN</span>`;
      ui.grid.appendChild(tile);
    }
    const video = tile.querySelector("video");
    const label = tile.querySelector(".tile-label");
    const mutedBox = tile.querySelector(".muted-video");

    label.textContent = labelText;
    if (stream) {
      video.srcObject = stream;
      video.muted = !stream.getAudioTracks().length;
      const hasVideo = !!stream.getVideoTracks().length;
      mutedBox.hidden = hasVideo;
      video.hidden = !hasVideo;
    }
    return tile;
  }

  function addLocalTile() {
    const id = "local";
    const tile = document.createElement("div");
    tile.className = "tile you-tag";
    tile.id = "tile-local";
    tile.innerHTML = `
      <div class="muted-video" hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m15 8 6-2v12l-6-2"/></svg>
      </div>
      <video autoplay playsinline muted></video>
      <span class="tile-label">${escapeHtml(MS.name)} (you)</span>`;
    ui.grid.appendChild(tile);
    const video = tile.querySelector("video");
    video.srcObject = MS.stream;
    if (MS.stream) {
      const hasVideo = !!MS.stream.getVideoTracks().length;
      tile.querySelector(".muted-video").hidden = hasVideo;
      video.hidden = !hasVideo;
    }
  }

  function refreshLocalTile() {
    const tile = document.getElementById("tile-local");
    if (!tile || !MS.stream) return;
    const hasVideo = !!MS.stream.getVideoTracks().length;
    tile.querySelector(".muted-video").hidden = hasVideo;
    tile.querySelector("video").hidden = !hasVideo;
  }

  function removeTile(peerId) {
    const tile = document.getElementById("tile-" + peerId);
    if (tile) tile.remove();
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  /* ---------- Chat ---------- */

  function addChat(msg, who, mine) {
    const div = document.createElement("div");
    div.className = "msg" + (mine ? " mine" : "");
    div.innerHTML =
      '<span class="who">' + escapeHtml(who) + '<span class="when">' + new Date().toLocaleTimeString() + "</span></span>" +
      escapeHtml(msg);
    ui.chatMsgs.appendChild(div);
    ui.chatMsgs.scrollTop = ui.chatMsgs.scrollHeight;
  }

  function addSys(text) {
    const div = document.createElement("div");
    div.className = "msg sys";
    div.textContent = text;
    ui.chatMsgs.appendChild(div);
    ui.chatMsgs.scrollTop = ui.chatMsgs.scrollHeight;
  }

  function broadcastChat(text) {
    const payload = { type: "chat", from: MS.name, text: text };
    MS.conns.forEach((conn) => {
      if (conn.open) {
        try { conn.send(payload); } catch (e) { /* drop */ }
      }
    });
  }

  /* ---------- Peer helpers ---------- */

  function onConnMessage(conn, data) {
    if (!data || typeof data !== "object") return;
    if (data.type === "chat") {
      addChat(data.text, data.from || "Guest", false);
      if (MS.isHost) {
        MS.conns.forEach((other) => {
          if (other !== conn && other.open) {
            try { other.send(data); } catch (e) { /* drop */ }
          }
        });
      }
    } else if (data.type === "hello") {
      // guest announces presence through the data connection before the media call lands
    }
  }

  function onConnOpen(conn) {
    const who = MS.isHost ? "Guest" : "Host";
    log((conn.peer.includes("-host") ? "Host" : "Guest") + " connected (" + conn.peer.slice(0, 18) + "…)", "ok");
    if (MS.isHost) {
      try { conn.send({ type: "chat", from: MS.name, text: "Hello — I'm hosting this room." }); } catch (e) {}
    }
    void who;
  }

  function onConnClose(conn) {
    log("Connection lost (" + conn.peer.slice(0, 18) + "…)", "err");
    removeTile(conn.peer);
    MS.calls.delete(conn.peer);
    updateParticipants();
  }

  function onRemoteStream(call, stream) {
    addTile(call.peer, "Guest", stream);
    updateParticipants();
  }

  function updateParticipants() {
    const n = MS.calls.size;
    ui.roleLabel.textContent =
      MS.room + " · " + MS.name + (MS.isHost ? " (host)" : "") + " · " + n + " participant" + (n === 1 ? "" : "s") + " in video";
  }

  /* ---------- Media call wiring (host side) ---------- */

  function wireHost() {
    MS.peer.on("connection", (conn) => {
      MS.conns.set(conn.peer, conn);
      conn.on("open", () => onConnOpen(conn));
      conn.on("data", (d) => onConnMessage(conn, d));
      conn.on("close", () => onConnClose(conn));
      conn.on("error", () => removeTile(conn.peer));
    });
    MS.peer.on("call", (call) => {
      call.answer(MS.stream);
      MS.calls.set(call.peer, call);
      call.on("stream", (stream) => onRemoteStream(call, stream));
      call.on("close", () => {
        removeTile(call.peer);
        MS.calls.delete(call.peer);
        updateParticipants();
      });
      call.on("error", () => {
        removeTile(call.peer);
        MS.calls.delete(call.peer);
        updateParticipants();
      });
    });
  }

  /* ---------- Host ---------- */

  async function startHosting() {
    const room = cleanRoomName(ui.room.value);
    if (!room) throw new Error("Enter a room code (letters, numbers, dashes).");
    MS.name = (ui.name.value.trim() || "Host").slice(0, 24);
    MS.room = room;
    MS.isHost = true;

    await loadPeerJS();
    MS.stream = await getMedia();

    ui.host.disabled = ui.join.disabled = true;
    log("Registering room '" + room + "' on the signaling server…");
    setStatus('<span class="pill host">Starting room…</span>');

    const PeerCtor = window.Peer;
    const peer = new PeerCtor(roomIds(room).host, { debug: 1, config: ICE });

    MS.peer = peer;
    wireHost();

    peer.on("open", () => {
      MS.started = true;
      log("Room ready. Others can now join with room code: " + room, "ok");
      setStatus('<span class="pill live">Hosting · ' + escapeHtml(room) + "</span>");
      ui.roomLabel.textContent = "Room: " + room;
      ui.roleLabel.textContent = MS.name + " (host) — waiting for guests…";
      enterCallUi();
      addLocalTile();
    });

    peer.on("error", (err) => {
      if (err.type === "unavailable-id") {
        log("That room name is already in use. Pick another, or use the Dice button.", "err");
        setStatus('<span class="pill idle">Room name taken</span>');
      } else {
        log("Peer error: " + err.type, "err");
      }
      cleanupPeer();
    });

    peer.on("disconnected", () => {
      if (MS.started) log("Signaling link dropped — reconnecting…", "err");
      setTimeout(() => { if (MS.peer && MS.peer.disconnected && !MS.peer.destroyed) { try { MS.peer.reconnect(); } catch (e) {} } }, 1500);
    });
  }

  /* ---------- Guest ---------- */

  async function startJoining() {
    const room = cleanRoomName(ui.room.value);
    if (!room) throw new Error("Enter the room code you want to join.");
    MS.name = (ui.name.value.trim() || "Guest").slice(0, 24);
    MS.room = room;
    MS.isHost = false;

    await loadPeerJS();
    MS.stream = await getMedia();

    ui.host.disabled = ui.join.disabled = true;
    log("Joining room '" + room + "'…");
    setStatus('<span class="pill live">Joining…</span>');

    const PeerCtor = window.Peer;
    const peer = new PeerCtor({ debug: 1, config: ICE });
    MS.peer = peer;

    peer.on("open", () => {
      MS.started = true;
      log("Connected to signaling. Dialing the host…");
      setStatus('<span class="pill live">In room · ' + escapeHtml(room) + "</span>");
      ui.roomLabel.textContent = "Room: " + room;
      ui.roleLabel.textContent = MS.name + " — connecting to host…";
      enterCallUi();
      addLocalTile();

      const conn = peer.connect(roomIds(room).host, { reliable: true });
      MS.conns.set(conn.peer, conn);
      conn.on("open", () => {
        onConnOpen(conn);
        try { conn.send({ type: "chat", from: MS.name, text: MS.name + " has joined the room." }); } catch (e) {}
        try { conn.send({ type: "hello", from: MS.name }); } catch (e) {}
      });
      conn.on("data", (d) => onConnMessage(conn, d));
      conn.on("close", () => {
        log("Connection to host closed.", "err");
        MS.conns.delete(conn.peer);
        removeTile(conn.peer);
      });
      conn.on("error", () => {
        log("Data link error — is the host online and using this exact room code?", "err");
        MS.conns.delete(conn.peer);
      });

      const call = peer.call(roomIds(room).host, MS.stream);
      MS.calls.set(call.peer, call);
      call.on("stream", (stream) => onRemoteStream(call, stream));
      call.on("close", () => {
        removeTile(call.peer);
        MS.calls.delete(call.peer);
        updateParticipants();
      });
      call.on("error", () => {
        log("Could not reach the host's video. Make sure they are hosting with this same room code.", "err");
        removeTile(call.peer);
        MS.calls.delete(call.peer);
        updateParticipants();
      });
    });

    peer.on("error", (err) => {
      log("Peer error: " + err.type, "err");
      setStatus('<span class="pill idle">Connection failed</span>');
      cleanupPeer();
    });
  }

  /* ---------- Call UI / controls ---------- */

  function enterCallUi() {
    ui.prejoin.hidden = true;
    ui.call.hidden = false;
    ui.chat.hidden = false;
    updateParticipants();
    refreshControlStates();
  }

  function toggleMic() {
    if (!MS.stream) return;
    const tracks = MS.stream.getAudioTracks();
    const on = tracks.some((t) => t.enabled);
    tracks.forEach((t) => (t.enabled = !on));
    refreshControlStates();
  }

  function toggleCam() {
    if (!MS.stream) return;
    const tracks = MS.stream.getVideoTracks();
    const on = tracks.some((t) => t.enabled);
    tracks.forEach((t) => (t.enabled = !on));
    refreshLocalTile();
    refreshControlStates();
  }

  async function toggleScreen() {
    if (!MS.peer || !MS.stream) return;
    if (MS.sharing) {
      stopSharing();
      return;
    }
    if (!navigator.mediaDevices.getDisplayMedia) {
      log("Screen sharing not supported in this browser.", "err");
      return;
    }
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      MS.sharing = screen;
      const screenTrack = screen.getVideoTracks()[0];
      screenTrack.onended = stopSharing;
      replaceVideoTracks(screenTrack);
      log("Sharing your screen.", "ok");
      updateScreenBadge(true);
      ui.btnScreenLabel.textContent = "Stop share";
    } catch (e) {
      log("Screen share cancelled.", "err");
    }
  }

  function stopSharing() {
    if (!MS.sharing) return;
    MS.sharing.getTracks().forEach((t) => t.stop());
    MS.sharing = null;
    const camTrack = MS.stream.getVideoTracks()[0];
    if (camTrack) {
      if (camTrack.enabled) replaceVideoTracks(camTrack);
      else refreshLocalTile();
    }
    ui.btnScreenLabel.textContent = "Share";
    updateScreenBadge(false);
    log("Stopped sharing screen.", "ok");
  }

  function replaceVideoTracks(newTrack) {
    MS.calls.forEach((call) => {
      const pc = call.peerConnection;
      if (!pc) return;
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender) sender.replaceTrack(newTrack).catch(() => {});
    });
    MS.stream.getVideoTracks().forEach((t) => { if (t !== newTrack) t.enabled = false; });
  }

  function updateScreenBadge(sharing) {
    const local = document.getElementById("tile-local");
    if (local) local.querySelector(".tile-badge").hidden = !sharing;
  }

  function refreshControlStates() {
    if (!MS.stream) return;
    const micOn = MS.stream.getAudioTracks().some((t) => t.enabled);
    const camOn = MS.stream.getVideoTracks().some((t) => t.enabled);
    ui.btnMic.classList.toggle("active", micOn);
    ui.btnCam.classList.toggle("active", camOn);
  }

  function cleanupPeer() {
    if (MS.peer && !MS.peer.destroyed) {
      try { MS.peer.destroy(); } catch (e) {}
    }
    MS.peer = null;
    MS.conns.forEach((c) => { try { c.close(); } catch (e) {} });
    MS.conns.clear();
    MS.calls.clear();
    if (MS.stream) {
      MS.stream.getTracks().forEach((t) => t.stop());
      MS.stream = null;
    }
    MS.sharing = null;
    MS.started = false;
    MS.isHost = false;
    MS.room = null;
    ui.grid.innerHTML = "";
    ui.chatMsgs.innerHTML = "";
    ui.prejoin.hidden = false;
    ui.call.hidden = true;
    ui.chat.hidden = true;
    resetStatus();
    ui.host.disabled = ui.join.disabled = false;
    updateScreenBadge(false);
    ui.btnScreenLabel.textContent = "Share";
  }

  /* ---------- Events ---------- */

  ui.random.addEventListener("click", () => { ui.room.value = randomRoom(); });

  ui.host.addEventListener("click", async () => {
    try { await startHosting(); }
    catch (e) { log(e.message, "err"); setStatus('<span class="pill idle">Not connected</span>'); }
  });

  ui.join.addEventListener("click", async () => {
    try { await startJoining(); }
    catch (e) { log(e.message, "err"); setStatus('<span class="pill idle">Not connected</span>'); }
  });

  ui.btnMic.addEventListener("click", toggleMic);
  ui.btnCam.addEventListener("click", toggleCam);
  ui.btnScreen.addEventListener("click", toggleScreen);

  ui.btnLeave.addEventListener("click", () => {
    log("Left the room.", "ok");
    cleanupPeer();
  });

  ui.chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = ui.chatInput.value.trim();
    if (!text || !MS.peer || !MS.started) return;
    addChat(text, MS.name, true);
    broadcastChat(text);
    ui.chatInput.value = "";
  });

  window.addEventListener("beforeunload", () => {
    if (MS.stream) MS.stream.getTracks().forEach((t) => t.stop());
  });

  secureNote();
})();
