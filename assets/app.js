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
  "https://pub-a077dfd3895545a2b5ad4bf2809307e1.r2.dev/seedance/example11.mp4"
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

// Optional: if you want ZERO text on screen, uncomment next line:
// captionEl.style.display = "none";
