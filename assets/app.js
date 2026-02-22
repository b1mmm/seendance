/**
 * Minimal random video feed (GitHub Pages) — FULL app.js
 * Requirements:
 * - NO like button, NO user info (@motionmint), NO time, NO filename shown
 * - Random shuffle videos on each visit (avoid boredom)
 * - Random TikTok-style hook title from BANK per video
 * - Autoplay muted; tap to pause/play; mute toggle
 * - Gift icon redirects to google.com
 * - Collect minimal session analytics (non-identifying) and send to Worker on session end
 *   Endpoint: POST https://seedance.testmail12071997.workers.dev/api/session
 *   Uses sendBeacon/keepalive
 */

const WORKER_BASE = "https://seedance.testmail12071997.workers.dev";
const SESSION_ENDPOINT = `${WORKER_BASE}/api/session`;

const SND_BASE = "https://guerin.acequia.io/ai/";
const RAW_LIST = [
  "[SND]BethGulfofMexico.mp4",
  "[SND]Breecker-crane-over-head-with-LOTR-Nazgul.mp4",
  "[SND]breecker-dolly-left-swipe-in-person.mp4",
  "[SND]ed-angel-gorilla-2.mp4",
  "[SND]ed-angel-gorilla.mp4",
  "[SND]errand-missed-catch.mp4",
  "[SND]Graydon_RxBurn.mp4",
  "[SND]nyc-lateshow-icecream.mp4",
  "https://guerin.acequia.io/ai/owen-dolly-in-smile.mp4",
  "https://guerin.acequia.io/ai/owen-dolly-right-smile.mp4",
  "https://guerin.acequia.io/ai/plume-bulletcam-partial-fail.mp4",
  "https://guerin.acequia.io/ai/plume-dolly-left.mp4",
  "https://guerin.acequia.io/ai/plume-orbit.mp4",
  "https://guerin.acequia.io/ai/plume-rotate-right.mp4",
  "https://guerin.acequia.io/ai/red-river-thumbs-up.mp4",
  "https://guerin.acequia.io/ai/red-river-thumbs-up2.mp4",
  "https://guerin.acequia.io/ai/ron-jill-dolly-out.mp4",
  "https://guerin.acequia.io/ai/ron-jill-toast.mp4",
  "https://guerin.acequia.io/ai/Stu-Stephen-museumHill-ai.mp4"
];

const TITLE_BANK = [
  "ĐỪNG LƯỚT! Xem tới cuối là hiểu 😳",
  "ỦA CÁI GÌ VẬY TRỜI… 😱",
  "Cảnh này mà lên TikTok là cháy 🔥",
  "Nhìn 3 giây là dính…",
  "Cú plot twist làm mình đứng hình 😵",
  "Ai nghĩ ra cái này vậy trời 😂",
  "Chỉ 1 pha thôi mà ‘đỉnh’ thật sự!",
  "Đoạn này ai cũng xem lại 2 lần 😭",
  "Coi xong là muốn thử liền!",
  "Không ngờ nó lại ra thế này…",
  "Mượt kiểu điện ảnh luôn 😮‍💨",
  "Cảnh ‘ảo’ nhất hôm nay đây!",
  "Chốt đơn vibe này ngay!",
  "Tự nhiên nổi da gà…",
  "Cảnh này dựng quảng cáo là auto win!"
];

// ---------- helpers ----------
function normalizeToUrl(item) {
  const s = (item || "").toString().trim();
  if (s.startsWith("[SND]")) {
    const filename = s.replace("[SND]", "").trim();
    return `${SND_BASE}${encodeURIComponent(filename)}`;
  }
  return s;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function now() { return Date.now(); }

function muteIcon(muted) {
  return muted
    ? `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11 5L6 9H3v6h3l5 4V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M23 9l-6 6M17 9l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11 5L6 9H3v6h3l5 4V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M15 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
}

// ---------- DOM ----------
const feedEl = document.getElementById("feed");
const captionEl = document.getElementById("caption");
const toastEl = document.getElementById("toast");
const btnMute = document.getElementById("btnMute");
const btnGift = document.getElementById("btnGift");

// Gift redirect
if (btnGift) {
  btnGift.addEventListener("click", () => {
    window.location.href = "https://google.com";
  });
}

function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 900);
}

// ---------- Consent (minimal, 1-time) ----------
function ensureConsent() {
  // Consent is optional for MVP; if you want NO banner, just return true.
  const key = "vid_analytics_ok";
  if (localStorage.getItem(key) === "1") return true;

  const bar = document.createElement("div");
  bar.style.cssText = `
    position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;
    padding:12px 12px;border-radius:14px;
    border:1px solid rgba(255,255,255,.12);
    background:rgba(0,0,0,.7);backdrop-filter:blur(10px);
    color:rgba(255,255,255,.92);font-weight:800;
    display:flex;gap:10px;align-items:center;justify-content:space-between;
    max-width:720px;margin:0 auto;
  `;
  bar.innerHTML = `
    <div style="font-size:13px;line-height:1.25">
      Site dùng <b>analytics tối giản</b> (thời lượng xem, số video) để cải thiện trải nghiệm.
    </div>
    <button id="vidOk" style="
      border:none;border-radius:12px;height:40px;padding:0 14px;
      font-weight:900;background:#fff;color:#000;cursor:pointer
    ">OK</button>
  `;
  document.body.appendChild(bar);

  bar.querySelector("#vidOk").addEventListener("click", () => {
    localStorage.setItem(key, "1");
    bar.remove();
  });

  return false;
}
ensureConsent();

// ---------- Session analytics (minimal) ----------
function getUID() {
  const key = "vid_uid";
  let v = localStorage.getItem(key);
  if (!v) {
    v = (crypto?.randomUUID?.() || `u_${Math.random().toString(16).slice(2)}_${Date.now()}`);
    localStorage.setItem(key, v);
  }
  return v;
}

function getOrCreateSessionId() {
  const key = "vid_session_id";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = (crypto?.randomUUID?.() || `s_${Math.random().toString(16).slice(2)}_${Date.now()}`);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

const UID = getUID();
const SESSION_ID = getOrCreateSessionId();

const session = {
  sid: SESSION_ID,
  uid: UID,
  startedAt: now(),
  endedAt: null,
  durationMs: 0,
  videosSeen: 0,
  videoIdsSeen: [],
  activeVideoId: null,
  watchMsByVideo: {},  // {id: ms}
  lastTickAt: now(),
  muted: true,
  ref: document.referrer || "",
  url: location.href,
  lang: navigator.language || "",
  tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
  screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
  ua: (navigator.userAgent || "").slice(0, 220),
};

function markVideoSeen(feedId) {
  if (!feedId) return;
  if (!session.videoIdsSeen.includes(feedId)) {
    session.videoIdsSeen.push(feedId);
    session.videosSeen = session.videoIdsSeen.length;
  }
}

function tickWatchTime() {
  const t = now();
  const dt = Math.max(0, t - session.lastTickAt);
  session.lastTickAt = t;

  if (document.visibilityState !== "visible") return;
  const vid = session.activeVideoId;
  if (!vid) return;

  session.watchMsByVideo[vid] = (session.watchMsByVideo[vid] || 0) + dt;
}
setInterval(tickWatchTime, 1000);

// ---------- Feed build (random each visit) ----------
const URLS = RAW_LIST.map(normalizeToUrl);
shuffleInPlace(URLS);

const FEED = URLS.map((url, idx) => ({
  id: `v${idx + 1}`,
  url,
  title: pickRandom(TITLE_BANK),
}));

// ---------- Render feed ----------
let observer = null;
let globalMuted = true;

function setMuteAll(muted) {
  globalMuted = muted;
  session.muted = muted;
  document.querySelectorAll(".slide video").forEach(v => (v.muted = muted));
  if (btnMute) btnMute.innerHTML = muteIcon(muted);
  toast(muted ? "Muted" : "Unmuted");
}

if (btnMute) {
  btnMute.addEventListener("click", () => setMuteAll(!globalMuted));
}

function render() {
  if (!feedEl) return;
  feedEl.innerHTML = "";

  FEED.forEach(item => {
    const s = document.createElement("section");
    s.className = "slide";
    s.dataset.id = item.id;
    s.dataset.title = item.title;

    // Note: autoplay policy requires muted to autoplay reliably
    s.innerHTML = `<video playsinline muted loop preload="metadata" src="${item.url}"></video>`;

    // Tap slide to pause/play
    s.addEventListener("click", () => {
      const v = s.querySelector("video");
      if (!v) return;
      if (v.paused) v.play().catch(() => {});
      else v.pause();
    });

    feedEl.appendChild(s);
  });

  // init first active
  const first = document.querySelector(".slide");
  if (first?.dataset?.id) {
    session.activeVideoId = first.dataset.id;
    markVideoSeen(first.dataset.id);
    if (captionEl) captionEl.textContent = first.dataset.title || "";
  }

  setupObserver();
}

function setupObserver() {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      const slide = entry.target;
      const video = slide.querySelector("video");
      if (!video) return;

      if (entry.isIntersecting) {
        // pause others
        document.querySelectorAll(".slide video").forEach(v => {
          if (v !== video) v.pause();
        });

        // update active + seen + caption
        const id = slide.dataset.id || null;
        if (id && id !== session.activeVideoId) {
          session.activeVideoId = id;
          markVideoSeen(id);
        }
        if (captionEl) captionEl.textContent = slide.dataset.title || "";

        // autoplay
        try {
          video.muted = globalMuted;
          await video.play();
        } catch {
          // ignored
        }
      } else {
        video.pause();
      }
    });
  }, { root: feedEl, threshold: 0.66 });

  document.querySelectorAll(".slide").forEach(s => observer.observe(s));
}

// ---------- Send session on end ----------
function buildSessionPayload() {
  const endedAt = now();
  session.endedAt = endedAt;
  session.durationMs = Math.max(0, endedAt - session.startedAt);

  const top = Object.entries(session.watchMsByVideo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([feedId, ms]) => ({ feedId, ms }));

  return {
    sid: session.sid,
    uid: session.uid,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    durationMs: session.durationMs,
    videosSeen: session.videosSeen,
    videoIdsSeen: session.videoIdsSeen.slice(0, 50),
    topWatch: top,
    muted: !!session.muted,
    ref: session.ref,
    url: session.url,
    lang: session.lang,
    tz: session.tz,
    screen: session.screen,
    ua: session.ua,
  };
}

let sent = false;
function sendSession() {
  if (sent) return;
  sent = true;

  // Require consent to send (safe default). If you want to send regardless, remove this if-block.
  if (localStorage.getItem("vid_analytics_ok") !== "1") return;

  const payload = buildSessionPayload();
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(SESSION_ENDPOINT, blob);
    return;
  }

  fetch(SESSION_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => {});
}

// end-of-session signals
window.addEventListener("pagehide", sendSession);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") sendSession();
});

// ---------- Init ----------
render();
setMuteAll(true);

// If you want ZERO text overlay (ultra minimal), uncomment:
// if (captionEl) captionEl.style.display = "none";
