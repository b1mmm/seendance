/**
 * Minimal random feed:
 * - Shuffle videos every page load (avoid boredom)
 * - Use random Vietnamese TikTok-style titles from BANK (no filename shown)
 * - Autoplay muted (best for mobile)
 * - Tap video to pause/play
 * - Gift icon redirects to google.com
 */

const SND_BASE = "https://guerin.acequia.io/ai/";
const RAW_LIST = [
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example1.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example2.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example3.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example4.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example5.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example6.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example7.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example8.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example9.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example10.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example11.mp4",
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example12.mp4",  
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
  "Cảnh này mà dựng quảng cáo thì auto win!"
];

function normalizeToUrl(item) {
  const s = item.trim();
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

function muteIcon(muted){
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

const feedEl = document.getElementById("feed");
const captionEl = document.getElementById("caption");
const toastEl = document.getElementById("toast");
const btnMute = document.getElementById("btnMute");
const btnGift = document.getElementById("btnGift");

btnGift.addEventListener("click", ()=> {
  window.location.href = "https://google.com";
});

function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(()=>toastEl.classList.remove("show"), 900);
}

let globalMuted = true;
let observer = null;

// Build shuffled feed each visit
const URLS = RAW_LIST.map(normalizeToUrl);
shuffleInPlace(URLS);

// Assign a random title per slide (no filenames)
const FEED = URLS.map((url, idx) => ({
  id: `v${idx+1}`,
  url,
  title: pickRandom(TITLE_BANK)
}));

function setMuteAll(muted){
  globalMuted = muted;
  document.querySelectorAll(".slide video").forEach(v => v.muted = muted);
  btnMute.innerHTML = muteIcon(muted);
  toast(muted ? "Muted" : "Unmuted");
}

btnMute.addEventListener("click", ()=> setMuteAll(!globalMuted));

function render(){
  feedEl.innerHTML = "";

  FEED.forEach(item => {
    const s = document.createElement("section");
    s.className = "slide";
    s.dataset.id = item.id;
    s.dataset.title = item.title;
    s.innerHTML = `<video playsinline muted loop preload="metadata" src="${item.url}"></video>`;
    feedEl.appendChild(s);

    // Tap to pause/play
    s.addEventListener("click", ()=>{
      const v = s.querySelector("video");
      if(!v) return;
      if(v.paused) v.play().catch(()=>{});
      else v.pause();
    });
  });

  setupObserver();
}

function setupObserver(){
  if (observer) observer.disconnect();

  observer = new IntersectionObserver((entries)=>{
    entries.forEach(async (entry)=>{
      const slide = entry.target;
      const video = slide.querySelector("video");
      if(!video) return;

      if(entry.isIntersecting){
        // Pause others
        document.querySelectorAll(".slide video").forEach(v=>{
          if(v !== video) v.pause();
        });

        // Update caption with random title (already assigned)
        captionEl.textContent = slide.dataset.title || "";

        // Autoplay
        try{
          video.muted = globalMuted;
          await video.play();
        }catch{}
      }else{
        video.pause();
      }
    });
  }, { root: feedEl, threshold: 0.66 });

  document.querySelectorAll(".slide").forEach(s => observer.observe(s));
}

// Init
render();
setMuteAll(true);
// ===== Session analytics (minimal, consent-friendly) =====
const WORKER_BASE = "https://seedance.testmail12071997.workers.dev";
const SESSION_ENDPOINT = `${WORKER_BASE}/api/session`;

function getUID() {
  const key = "vid_uid";
  let v = localStorage.getItem(key);
  if (!v) {
    v = (crypto?.randomUUID?.() || `u_${Math.random().toString(16).slice(2)}_${Date.now()}`);
    localStorage.setItem(key, v);
  }
  return v;
}
const UID = getUID();

function now() { return Date.now(); }

function getOrCreateSessionId() {
  // One session per tab visit
  const key = "vid_session_id";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = (crypto?.randomUUID?.() || `s_${Math.random().toString(16).slice(2)}_${Date.now()}`);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}
const SESSION_ID = getOrCreateSessionId();

// Minimal consent banner (1-time). You can remove if you already have consent UX.
function ensureConsent() {
  const key = "vid_analytics_ok";
  const ok = localStorage.getItem(key);
  if (ok === "1") return true;

  // super minimal banner
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

const hasConsent = ensureConsent(); // if false, we still track locally but won't send

// Session metrics
const session = {
  sid: SESSION_ID,
  uid: UID,
  startedAt: now(),
  endedAt: null,
  durationMs: 0,
  videosSeen: 0,
  videoIdsSeen: [],
  activeVideoId: null,
  watchMsByVideo: {}, // {feedId: ms}
  lastTickAt: now(),
  muted: true,
  ref: document.referrer || "",
  url: location.href,
  lang: navigator.language || "",
  tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
  screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
  ua: navigator.userAgent.slice(0, 220),
};

// Hook into your existing feed observer:
// 👉 In your observer callback where you set caption/title,
// also set session.activeVideoId = current slide id and record "seen".
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

// If you have globalMuted variable, keep session.muted in sync.
// Example: after you toggle mute, set session.muted = globalMuted;
// Here we also listen to a custom global variable if present.
try { session.muted = !!window.globalMuted; } catch {}

// Attach to your feed element to learn which slide is currently active.
// Assumes you have slides with dataset.id (like v1, v2...).
const feedElForSession = document.getElementById("feed");
if (feedElForSession) {
  // On scroll end-ish, find the closest slide in view
  let scrollTimer = null;
  feedElForSession.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const slides = Array.from(document.querySelectorAll(".slide"));
      if (!slides.length) return;
      const mid = window.innerHeight * 0.5;
      let best = null;
      let bestDist = 1e9;
      for (const s of slides) {
        const r = s.getBoundingClientRect();
        const center = (r.top + r.bottom) / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) { bestDist = dist; best = s; }
      }
      const id = best?.dataset?.id || null;
      if (id && id !== session.activeVideoId) {
        session.activeVideoId = id;
        markVideoSeen(id);
      }
    }, 160);
  }, { passive: true });
}

// Make sure we have first active video after load
setTimeout(() => {
  const first = document.querySelector(".slide");
  if (first?.dataset?.id) {
    session.activeVideoId = first.dataset.id;
    markVideoSeen(first.dataset.id);
  }
}, 500);

// Send summary on session end
function buildSessionPayload() {
  const endedAt = now();
  session.endedAt = endedAt;
  session.durationMs = Math.max(0, endedAt - session.startedAt);

  // Compress watch map
  const watch = session.watchMsByVideo;
  const top = Object.entries(watch)
    .sort((a,b)=>b[1]-a[1])
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

  // If you want to strictly require consent to send:
  if (localStorage.getItem("vid_analytics_ok") !== "1") return;

  const payload = buildSessionPayload();
  const body = JSON.stringify(payload);

  // Best-effort: sendBeacon (works on unload)
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(SESSION_ENDPOINT, blob);
    return;
  }

  // Fallback: keepalive fetch
  fetch(SESSION_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(()=>{});
}

// Trigger send on end-of-session signals
window.addEventListener("pagehide", sendSession);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") sendSession();
});
// Optional: if you want ZERO text on screen, uncomment next line:
// captionEl.style.display = "none";
