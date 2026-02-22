// UI tuned to match screenshots: right drawer menu + explore search/chips + full-screen feed.
// Videos are remote-only (your list). Autoplay muted.

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

const viewFeed = document.getElementById("viewFeed");
const viewExplore = document.getElementById("viewExplore");

const btnMenu = document.getElementById("btnMenu");
const btnExplore = document.getElementById("btnExplore");

const drawer = document.getElementById("drawer");
const drawerScrim = document.getElementById("drawerScrim");
const drawerClose = document.getElementById("drawerClose");
const drawerList = document.getElementById("drawerList");

const btnMuteFab = document.getElementById("btnMuteFab");
const btnLikeFab = document.getElementById("btnLikeFab");
const likeCountEl = document.getElementById("likeCount");
const metaTime = document.getElementById("metaTime");
const metaTitle = document.getElementById("metaTitle");

const chipsEl = document.getElementById("chips");
const searchInput = document.getElementById("searchInput");
const btnBackToFeed = document.getElementById("btnBackToFeed");

const btnApple = document.getElementById("btnApple");
const btnGoogle = document.getElementById("btnGoogle");
const btnSignIn = document.getElementById("btnSignIn");

// chips list like screenshot
const CHIP_LIST = [
  "All","Human (Cartoon)","Animal (Cartoon)","Robot (Cartoon)","Fantasy","Politician",
  "Bible","Lifestyle","Politician Calling","Baby Politician","Celebrities Calling",
  "Street Interview","Minecraft","Toddler","Caricature","Memes","Anime",
  "LAIKA Style","3D Animal","Creepy Characters","80's Space Viking"
];

let likes = 0;
let globalMuted = true;
let observer = null;

function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(()=>toastEl.classList.remove("show"), 1100);
}

function openDrawer(){
  drawer.classList.add("show");
  drawer.setAttribute("aria-hidden","false");
}
function closeDrawer(){
  drawer.classList.remove("show");
  drawer.setAttribute("aria-hidden","true");
}

btnMenu.addEventListener("click", openDrawer);
drawerScrim.addEventListener("click", closeDrawer);
drawerClose.addEventListener("click", closeDrawer);

drawerList.addEventListener("click", (e)=>{
  const btn = e.target.closest(".drawer-item");
  if(!btn) return;
  drawerList.querySelectorAll(".drawer-item").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  closeDrawer();

  // basic routing demo
  const route = btn.dataset.route;
  if(route === "trending" || route === "home") {
    showFeed();
  } else if(route === "shows") {
    showExplore();
  } else {
    toast(route);
  }
});

// auth buttons (demo)
btnApple.addEventListener("click", ()=>toast("Apple sign-in (demo)"));
btnGoogle.addEventListener("click", ()=>toast("Google sign-in (demo)"));
btnSignIn.addEventListener("click", ()=>toast("Sign in (demo)"));

// explore toggle
btnExplore.addEventListener("click", showExplore);
btnBackToFeed.addEventListener("click", showFeed);

function showExplore(){
  viewFeed.classList.add("hide");
  viewExplore.classList.add("show");
  // pause all videos
  document.querySelectorAll(".slide video").forEach(v=>v.pause());
  toast("Explore");
}
function showFeed(){
  viewExplore.classList.remove("show");
  viewFeed.classList.remove("hide");
  toast("Trending");
  // resume current visible
  setupAutoplayObserver();
}

function renderChips(){
  chipsEl.innerHTML = "";
  CHIP_LIST.forEach((label, idx)=>{
    const b = document.createElement("button");
    b.className = "chip" + (idx===0 ? " active" : "");
    b.textContent = label;
    b.addEventListener("click", ()=>{
      chipsEl.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      toast(label);
    });
    chipsEl.appendChild(b);
  });
}
renderChips();

searchInput.addEventListener("input", ()=>{
  // lightweight filter highlight only
  const q = searchInput.value.trim().toLowerCase();
  const chips = Array.from(chipsEl.querySelectorAll(".chip"));
  if(!q){
    chips.forEach((c,i)=>c.style.display="");
    return;
  }
  chips.forEach(c=>{
    const ok = c.textContent.toLowerCase().includes(q);
    c.style.display = ok ? "" : "none";
  });
});

// FEED
const FEED = URLS.map((url, i)=> {
  const fn = filenameFromUrl(url);
  const title = (i===0) ? "What Still Watches" : baseName(fn).replace(/[_-]+/g," ");
  const time = ["last month","2 weeks ago","yesterday","today"][i%4];
  return { id:`v${i+1}`, url, title, time };
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
renderFeed();

function setMuteAll(muted){
  globalMuted = muted;
  document.querySelectorAll(".slide video").forEach(v=>v.muted = muted);
  btnMuteFab.innerHTML = muted ? muteIcon(true) : muteIcon(false);
  toast(muted ? "Muted" : "Unmuted");
}

btnMuteFab.addEventListener("click", ()=>{
  setMuteAll(!globalMuted);
});

btnLikeFab.addEventListener("click", ()=>{
  likes += 1;
  likeCountEl.textContent = String(likes);
  toast("Liked");
});

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

function setupAutoplayObserver(){
  if (viewFeed.classList.contains("hide")) return;

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

// start muted like screenshot
setMuteAll(true);

// ESC closes drawer on desktop
window.addEventListener("keydown", (e)=>{
  if(e.key === "Escape"){
    closeDrawer();
  }
});
