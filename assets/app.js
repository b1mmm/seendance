/**
 * Like tracking:
 * - Persist local in localStorage (survive refresh)
 * - Send to Worker API -> KV store (tracking)
 *
 * Worker base:
 *   https://seedance.testmail12071997.workers.dev
 *
 * Expected endpoint:
 *   POST /api/like
 * Body:
 *   { feedId, delta, total, uid, ts, ua }
 *
 * If worker returns non-200 or {ok:false}, UI still works (local saved).
 */

const WORKER_BASE = "https://seedance.testmail12071997.workers.dev";
const LIKE_ENDPOINT = `${WORKER_BASE}/api/like`;

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

function normalizeToUrl(item) {
  const s = item.trim();
  if (s.startsWith("[SND]")) {
    const filename = s.replace("[SND]", "").trim();
    return `${SND_BASE}${encodeURIComponent(filename)}`;
  }
  return s;
}
const URLS = RAW_LIST.map(normalizeToUrl);

function filenameFromUrl(url) {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").pop() || "video.mp4";
    return decodeURIComponent(last);
  } catch { return "video.mp4"; }
}
function baseName(filename){ return filename.replace(/\.mp4$/i, ""); }

const feedEl = document.getElementById("feed");
const toastEl = document.getElementById("toast");

const btnGift = document.getElementById("btnGift");
const btnMuteFab = document.getElementById("btnMuteFab");
const btnLikeFab = document.getElementById("btnLikeFab");

const likeCountEl = document.getElementById("likeCount");
const metaTime = document.getElementById("metaTime");
const metaTitle = document.getElementById("metaTitle");

// Gift click -> redirect google.com
btnGift.addEventListener("click", () => {
  window.location.href = "https://google.com";
});

function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(()=>toastEl.classList.remove("show"), 1100);
}

// simple stable uid for tracking
function getUID(){
  const key = "vid_uid";
  let v = localStorage.getItem(key);
  if(!v){
    v = (crypto?.randomUUID?.() || `u_${Math.random().toString(16).slice(2)}_${Date.now()}`);
    localStorage.setItem(key, v);
  }
  return v;
}
const UID = getUID();

// FEED data
const FEED = URLS.map((url, i)=> {
  const fn = filenameFromUrl(url);
  const title = (i===0) ? "What Still Watches" : baseName(fn).replace(/[_-]+/g," ");
  const time = ["last month","2 weeks ago","yesterday","today"][i%4];
  return { id:`v${i+1}`, url, title, time };
});

// Like state (persist)
const LIKE_KEY = "vid_like_total";
let likesTotal = Number(localStorage.getItem(LIKE_KEY) || "0");
likeCountEl.textContent = String(likesTotal);

let globalMuted = true;
let observer = null;
let currentFeedId = FEED[0]?.id || "v1";

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

function setMuteAll(muted){
  globalMuted = muted;
  document.querySelectorAll(".slide video").forEach(v=>v.muted = muted);
  btnMuteFab.innerHTML = muteIcon(muted);
  toast(muted ? "Muted" : "Unmuted");
}

btnMuteFab.addEventListener("click", ()=> setMuteAll(!globalMuted));

async function sendLikeToWorker(payload){
  try{
    const res = await fetch(LIKE_ENDPOINT, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok || data?.ok !== true){
      // worker may not have endpoint yet
      return { ok:false, error: data?.error || `http_${res.status}` };
    }
    return { ok:true };
  }catch(e){
    return { ok:false, error: "network" };
  }
}

btnLikeFab.addEventListener("click", async ()=>{
  // update local
  likesTotal += 1;
  likeCountEl.textContent = String(likesTotal);
  localStorage.setItem(LIKE_KEY, String(likesTotal));

  // send to worker KV
  const payload = {
    uid: UID,
    feedId: currentFeedId,
    delta: 1,
    total: likesTotal,
    ts: Date.now(),
    ua: navigator.userAgent
  };

  const r = await sendLikeToWorker(payload);
  if(r.ok) toast("Liked ✅");
  else toast("Liked (local)"); // still works even if worker not ready
});

function renderFeed(){
  feedEl.innerHTML = "";
  FEED.forEach((item)=>{
    const s = document.createElement("section");
    s.className = "slide";
    s.dataset.id = item.id;
    s.innerHTML = `<video playsinline muted loop preload="metadata" src="${item.url}"></video>`;
    feedEl.appendChild(s);

    // tap to pause/play
    s.addEventListener("click", ()=>{
      const v = s.querySelector("video");
      if(!v) return;
      if(v.paused){ v.play().catch(()=>{}); }
      else v.pause();
    });
  });

  setupAutoplayObserver();
}

function setupAutoplayObserver(){
  if (observer) observer.disconnect();

  observer = new IntersectionObserver((entries)=>{
    entries.forEach(async (entry)=>{
      const slide = entry.target;
      const video = slide.querySelector("video");
      if(!video) return;

      if(entry.isIntersecting){
        // pause others
        document.querySelectorAll(".slide video").forEach(v=>{
          if(v !== video) v.pause();
        });

        // update meta
        const id = slide.dataset.id;
        const data = FEED.find(x=>x.id===id);
        if(data){
          currentFeedId = data.id;
          metaTitle.textContent = data.title;
          metaTime.textContent = data.time;
        }

        // autoplay
        try{
          video.muted = globalMuted;
          await video.play();
        }catch{}
      }else{
        video.pause();
      }
    });
  }, { root: feedEl, threshold: 0.66 });

  document.querySelectorAll(".slide").forEach(s=>observer.observe(s));
}

// init
renderFeed();
setMuteAll(true);
