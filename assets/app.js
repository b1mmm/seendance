// VideoGPT-like feed (UI/UX): full-screen vertical slides, autoplay muted,
// tap to pause/play, swipe scroll, like button, menu sheet.

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
function humanTitle(filename){
  const s = baseName(filename).replace(/[_-]+/g," ").trim();
  const t = s.split(" ").filter(Boolean).map(w => w.length<=2 ? w.toUpperCase() : (w[0].toUpperCase()+w.slice(1))).join(" ");
  // TikTok VN style hook
  const hooks = ["ĐỪNG LƯỚT!","ỦA GÌ VẬY TRỜI 😳","Xem tới cuối…","Cái này đang hot 🔥","Nhìn phát nghiện…"];
  const hook = hooks[(t.length + filename.length) % hooks.length];
  return `${hook} ${t}`;
}

function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

const FEED = URLS.map((url, i) => {
  const fn = filenameFromUrl(url);
  return {
    id: `v${i+1}`,
    url,
    handle: "@motionmint",
    time: ["last month","2 weeks ago","yesterday","today"][i % 4],
    title: humanTitle(fn),
    desc: ["Cinematic 9:16 • auto loop • vibe giống VideoGPT","Demo feed — bấm 1 cái là xem","Mẫu video để test UI/UX trên mobile"][i%3],
    likes: 0
  };
});

const feedEl = document.getElementById("feed");
const toastEl = document.getElementById("toast");

const sheet = document.getElementById("sheet");
const btnMenu = document.getElementById("btnMenu");
const btnCreate = document.getElementById("btnCreate");
const btnBottomMenu = document.getElementById("btnBottomMenu");
const btnRefresh = document.getElementById("btnRefresh");

const goForYou = document.getElementById("goForYou");
const goFollowing = document.getElementById("goFollowing");
const goShuffle = document.getElementById("goShuffle");
const goAbout = document.getElementById("goAbout");

function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(()=>toastEl.classList.remove("show"), 1200);
}

function openSheet(){
  sheet.classList.add("show");
  sheet.setAttribute("aria-hidden","false");
}
function closeSheet(){
  sheet.classList.remove("show");
  sheet.setAttribute("aria-hidden","true");
}
sheet.addEventListener("click", (e)=>{
  const close = e.target?.dataset?.close === "sheet";
  if (close) closeSheet();
});

btnMenu.addEventListener("click", openSheet);
btnBottomMenu.addEventListener("click", openSheet);
btnCreate.addEventListener("click", ()=>toast("Demo: Create (coming soon)"));

btnRefresh.addEventListener("click", ()=>{
  toast("Reloading…");
  setTimeout(()=>location.reload(), 350);
});

goForYou.addEventListener("click", ()=>{ toast("For You"); closeSheet(); });
goFollowing.addEventListener("click", ()=>{ toast("Following (demo)"); closeSheet(); });
goShuffle.addEventListener("click", ()=>{
  closeSheet();
  toast("Shuffle");
  shuffleFeed();
});
goAbout.addEventListener("click", ()=>{
  closeSheet();
  toast("UI kiểu Video Feed (demo)");
});

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function shuffleFeed(){
  // keep current scroll slide index near top to feel natural
  const items = Array.from(feedEl.querySelectorAll(".slide"));
  const topIndex = Math.max(0, Math.round(feedEl.scrollTop / window.innerHeight));
  // shuffle data
  shuffle(FEED);
  render();
  // restore approx position
  setTimeout(()=>{
    feedEl.scrollTo({ top: topIndex * window.innerHeight, behavior:"instant" });
  }, 0);
}

function makeIconMute(muted){
  return muted
    ? `<svg viewBox="0 0 24 24"><path d="M11 5L6 9H3v6h3l5 4V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M23 9l-6 6M17 9l6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
    : `<svg viewBox="0 0 24 24"><path d="M11 5L6 9H3v6h3l5 4V5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M15 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function render(){
  feedEl.innerHTML = "";

  FEED.forEach((v, idx)=>{
    const slide = document.createElement("section");
    slide.className = "slide";
    slide.dataset.id = v.id;

    slide.innerHTML = `
      <video class="video" playsinline muted loop preload="metadata" src="${v.url}"></video>

      <button class="mute-btn" aria-label="Mute toggle">${makeIconMute(true)}</button>

      <div class="actions">
        <button class="action like" aria-label="Like">
          <svg viewBox="0 0 24 24"><path d="M20 8c0-2-2-3-4-3h-3l.5-2.5c.2-1-1-2-2-1l-5 5V21h9c1 0 2-1 2-2l2-9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        </button>
        <div class="count">${v.likes}</div>
      </div>

      <div class="meta">
        <div class="userline">
          <div class="avatar"></div>
          <div>
            <div class="handle">${v.handle}</div>
            <div class="time">${v.time}</div>
          </div>
        </div>
        <div class="title">${v.title}</div>
        <div class="desc">${v.desc}</div>
      </div>
    `;

    feedEl.appendChild(slide);

    const video = slide.querySelector("video");
    const muteBtn = slide.querySelector(".mute-btn");
    const likeBtn = slide.querySelector(".action.like");
    const likeCount = slide.querySelector(".count");

    // Tap video to pause/play
    slide.addEventListener("click", (e)=>{
      // ignore clicks on buttons
      if (e.target.closest("button")) return;
      if (video.paused) { video.play().catch(()=>{}); }
      else { video.pause(); }
    });

    // Mute toggle
    muteBtn.addEventListener("click", ()=>{
      video.muted = !video.muted;
      muteBtn.innerHTML = makeIconMute(video.muted);
      toast(video.muted ? "Muted" : "Unmuted");
    });

    // Like
    likeBtn.addEventListener("click", ()=>{
      v.likes += 1;
      likeCount.textContent = String(v.likes);
      toast("Liked");
    });
  });

  setupAutoplayObserver();
}

let observer = null;

function setupAutoplayObserver(){
  if (observer) observer.disconnect();

  const options = {
    root: feedEl,
    threshold: 0.65
  };

  observer = new IntersectionObserver((entries)=>{
    entries.forEach(async (entry)=>{
      const slide = entry.target;
      const video = slide.querySelector("video");
      if (!video) return;

      if (entry.isIntersecting) {
        // pause others
        document.querySelectorAll(".slide video").forEach(v=>{
          if (v !== video) v.pause();
        });

        try {
          // always start muted by default to allow autoplay
          video.muted = true;
          const muteBtn = slide.querySelector(".mute-btn");
          muteBtn.innerHTML = makeIconMute(true);
          await video.play();
        } catch {
          // autoplay might fail until user gesture
        }
      } else {
        video.pause();
      }
    });
  }, options);

  document.querySelectorAll(".slide").forEach(slide=>observer.observe(slide));
}

// prevent accidental horizontal scroll bounce
feedEl.addEventListener("scroll", ()=>{ /* no-op */ }, { passive:true });

// initial
render();
