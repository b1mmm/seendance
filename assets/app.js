// web/assets/app.js
// ✅ TikTok-like mobile overlay tabs + swipe left/right to change tab.

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
function slugify(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""); }
function humanTitle(filename){
  const name = baseName(filename).replace(/[_-]+/g," ").trim();
  return name.split(" ").filter(Boolean).map(w => w.length<=2 ? w.toUpperCase() : (w[0].toUpperCase()+w.slice(1))).join(" ");
}
function seedNum(s){ return Array.from(s).reduce((a,c)=>a+c.charCodeAt(0),0); }
function pick(arr, seed){ return arr[seed % arr.length]; }

const CATEGORIES = ["viral","business","affiliate","aesthetic","tech","tutorial","food","community"];
const TAB_ORDER = ["all","shorts","pov","cinematic","deals","local"];

const HOOKS = {
  viral: ["ĐỪNG LƯỚT! Coi cái này đã…","ỦA GÌ VẬY TRỜI 😳","Xem tới cuối mới hiểu…","Cái này đang hot dữ…","Thử đoán xem chuyện gì xảy ra?"],
  business: ["Chủ quán nào cũng cần cái này!","Bán hàng kiểu này dễ chốt hơn 😮","Tăng khách mà không cần nói nhiều…","Mẫu quảng cáo 7s — chốt liền!","Xem xong bạn sẽ muốn thử ngay"],
  affiliate: ["Top món đáng mua tuần này 🔥","Đừng mua nếu chưa xem clip này!","Deal ngon vậy mà ít người biết…","So sánh 'đắt vs đáng' cực gắt","Link bio — hết là thôi!"],
  aesthetic: ["Nhìn mà muốn đi liền… 🌅","Cảnh này chill quá trời","Mood hôm nay: nhẹ thôi…","Đẹp kiểu không cần cố","Xem xong tự dưng thấy yên"],
  tech: ["AI làm cái này trong 5 giây…","Công nghệ giờ ghê thật 😳","Bấm 1 cái là ra kết quả…","Scan kiểu này nhìn đã mắt","Đừng nói bạn chưa thấy cái này!"],
  tutorial: ["3 bước thôi, làm liền!","Sai ở đây nè… sửa cái là xong","Lưu lại, mai làm khỏi quên","Cách làm nhanh nhất đây","Ai cũng làm được (thật)"],
  food: ["Đói chưa? Nhìn này đi… 🤤","Món này mà chưa thử là phí","Ăn cái này xong muốn quay lại","Menu quán: món nào cũng cuốn","Ngon kiểu 'đứng hình' luôn"],
  community: ["Bạn chọn cái nào? Comment đi!","Nhìn vậy chứ… bạn nghĩ sao?","Duet thử xem ai đúng 😆","Ai từng gặp chưa?","Đố bạn đoán kết thúc!"]
};

const DESC_PATTERNS = {
  viral: ["Hook 0–2s, loop mượt. Coi xong dễ xem lại 😵‍💫","POV đời thường nhưng twist nhẹ. Đừng chớp mắt.","Nhịp nhanh, chữ to. Dành cho Reels/TikTok."],
  business: ["Mẫu ads 7–9s: rõ lợi ích + CTA gọn. Dễ chạy local.","Đưa vào fanpage là lên vibe chuyên nghiệp liền.","Chốt bằng 1 câu CTA — người xem hiểu ngay."],
  affiliate: ["Format chốt mua: nêu lợi ích → giá → link bio.","So sánh nhanh 'đắt vs đáng' — cực hợp review.","Countdown deal: tạo FOMO nhẹ, hiệu quả."],
  aesthetic: ["Cinematic nhẹ, chữ tối giản. Đẹp để người xem 'thở'.","Mood chill, ánh sáng mềm. Hợp làm intro brand.","Nhịp chậm nhưng cuốn. Xem là muốn lưu."],
  tech: ["UI overlay + scan vibe. Hợp clip AI/automation.","Nhìn như tool xịn: 1 câu vấn đề → 1 câu giải pháp.","Cyber trailer ngắn: warning + score + CTA."],
  tutorial: ["How-to 3 bước: chữ rõ, nhanh gọn, ai cũng hiểu.","Fail → fix: show lỗi 1s rồi xử lý 5s.","Checklist tick/cross. Dễ viral kiểu 'lưu lại'."],
  food: ["Close-up texture + chữ 'PHẢI THỬ'. Hợp local quán.","3 món signature, text ngắn, xem là đói.","Vibe street food: cut nhanh, nhạc vui."],
  community: ["Kêu gọi comment, duet-ready. Đẩy tương tác mạnh.","2 lựa chọn đối lập: ai cũng muốn nói ý kiến.","Format câu hỏi: xem xong phải comment."]
};

const PROMPT_BANK = {
  viral: [
    "Hook 0–1s: chữ to giật tít 5–7 từ. Cắt nhanh. Kết bằng 1 twist để tăng rewatch. Loop khớp frame đầu/cuối.",
    "POV đời thường: text 1 dòng, nhấn reaction cuối clip. Thêm sound cue nhẹ ở beat drop.",
    "Dùng 3 shot: (mở bối cảnh) → (cao trào 2s) → (kết bất ngờ). Chữ to, ít chữ."
  ],
  business: [
    "Local ads: 3 cảnh (bối cảnh → lợi ích → CTA). Overlay giá/ưu đãi. Logo nhỏ góc dưới. CTA 1 dòng.",
    "Social proof: 1 câu review + 3 bullet lợi ích + CTA 'Inbox nhận ưu đãi'.",
    "Before/After + số liệu cụ thể (vd: +30% khách). Kết bằng CTA mạnh."
  ],
  affiliate: [
    "Top list: 'Top 3 đáng mua' + giá + CTA 'link bio'. Text to, dễ đọc mobile.",
    "So sánh 'đắt vs đáng': 2 cảnh đối chiếu + 1 câu chốt mua. Nhịp 7–9s.",
    "Deal countdown: 3 mốc thời gian + chữ cực to + kết bằng 'hết là thôi'."
  ],
  aesthetic: [
    "Aesthetic cinematic: ánh sáng mềm, motion chậm, chữ tối giản. Color grade nhẹ, không spam text.",
    "Travel vibe: wide → medium → close-up texture. Nhạc chill, vibe 'muốn đi ngay'.",
    "Golden hour: flare nhẹ, bokeh, pan chậm. Text 1 dòng."
  ],
  tech: [
    "Tech/AI: overlay UI, scan lines nhẹ, highlight keyword (AI / Auto / Score). Kết bằng CTA 'Try now'.",
    "Explainer 1 câu: vấn đề → giải pháp → CTA. Giữ chữ to, ít chữ.",
    "Cyber trailer: warning card 0.5s + risk score + icon shield + CTA hotline."
  ],
  tutorial: [
    "How-to 3 bước: Step 1/2/3 rõ ràng, mỗi bước 1–2s. Chữ to, ít chữ.",
    "Fail → Fix: show lỗi 1s rồi chuyển giải pháp 5s. Kết bằng 'lưu lại'.",
    "Checklist: tick/cross, kết bằng 'làm ngay'."
  ],
  food: [
    "Food macro: close-up texture, steam/sizzle, chữ 'PHẢI THỬ' + địa điểm. Cut nhanh 0.7s/shot.",
    "Menu highlight: 3 món signature + giá/ưu đãi + CTA đặt bàn. Text to.",
    "Street vibe: handheld nhẹ, cut nhanh, nhạc vui. Kết bằng tag bạn bè."
  ],
  community: [
    "Question format: 'Bạn chọn cái nào?' + 2 lựa chọn. Kết: 'comment đi'.",
    "Duet-ready: chừa khoảng trống. Text câu hỏi. Kết bằng hashtag.",
    "Challenge: hashtag + luật 1 dòng + call-to-action tham gia."
  ]
};

function formatK(n){
  if (n >= 1_000_000) return (n/1_000_000).toFixed(n%1_000_000===0?0:1) + "M";
  if (n >= 1_000) return (n/1_000).toFixed(n%1_000===0?0:1) + "K";
  return String(n);
}
function genSocial(seed) {
  const views = 8_000 + (seed * 97) % 2_400_000;
  const saves = 50 + (seed * 13) % 18_000;
  const score = 68 + (seed * 7) % 32;
  return { views, saves, score };
}
function genBadge(category, tags, seed) {
  const base = (seed % 100);
  if (category === "viral" || category === "affiliate") {
    if (base < 55) return { text:"🔥 HOT", cls:"hot" };
    if (base < 85) return { text:"🚀 TREND", cls:"trend" };
    return { text:"✅ NEW", cls:"new" };
  }
  if (tags.includes("deals") && base < 55) return { text:"🔥 HOT", cls:"hot" };
  if (tags.includes("cinematic") && base < 45) return { text:"🚀 TREND", cls:"trend" };
  if (base < 25) return { text:"✅ NEW", cls:"new" };
  return null;
}

function tiktokTitle(category, filename) {
  const seed = seedNum(filename + category);
  const hook = pick(HOOKS[category] || HOOKS.viral, seed);
  const core = humanTitle(filename);
  const shortCore = core.length > 28 ? core.slice(0, 28).trim() + "…" : core;
  return `${hook} • ${shortCore}`;
}
function tiktokDesc(category, filename) {
  const seed = seedNum(category + filename);
  const pattern = pick(DESC_PATTERNS[category] || DESC_PATTERNS.viral, seed);
  const cta =
    category === "community" ? "Comment 1 chữ cũng được!" :
    category === "tutorial" ? "Lưu lại kẻo quên." :
    category === "affiliate" ? "Link bio nhé." :
    category === "business" ? "Dùng cho fanpage là đẹp." :
    category === "food" ? "Tag đứa bạn hay ăn!" :
    category === "tech" ? "Bạn thử kiểu này chưa?" :
    category === "aesthetic" ? "Mood này hợp tối nay." :
    "Đừng lướt vội.";
  return `${pattern} • ${cta}`;
}
function pickPrompt(category, filename) {
  const pool = PROMPT_BANK[category] || PROMPT_BANK.viral;
  const n = seedNum(filename);
  return pool[n % pool.length];
}

function buildTags(filename, idx, category) {
  const f = filename.toLowerCase();
  const tags = new Set([category, "shorts", "viral"]);
  if (idx % 2 === 0) tags.add("cinematic");
  if (idx % 3 === 0) tags.add("pov");
  if (idx % 4 === 0) tags.add("local");
  if (idx % 5 === 0) tags.add("deals");

  if (f.includes("dolly") || f.includes("crane") || f.includes("orbit") || f.includes("rotate")) tags.add("cinematic");
  if (f.includes("smile") || f.includes("thumbs-up") || f.includes("toast")) tags.add("pov");
  if (f.includes("nyc") || f.includes("museum")) tags.add("local");
  if (f.includes("icecream")) tags.add("food"), tags.add("deals"), tags.add("affiliate");

  if (category === "business") tags.add("deals");
  if (category === "affiliate") tags.add("business");
  if (category === "food") tags.add("local");
  if (category === "tech") tags.add("tutorial");
  return Array.from(tags);
}

function primaryLabel(category) {
  const map = {
    viral:"VIRAL", business:"BUSINESS", affiliate:"AFFILIATE", aesthetic:"AESTHETIC",
    tech:"TECH", tutorial:"HOW-TO", food:"FOOD", community:"COMMUNITY"
  };
  return map[category] || "TREND";
}
function modeLabel(tags) {
  if (tags.includes("cinematic")) return "CINEMATIC";
  if (tags.includes("pov")) return "POV";
  if (tags.includes("deals")) return "DEALS";
  if (tags.includes("local")) return "LOCAL";
  return "SHORTS";
}

// Poster cache
const POSTER_CACHE_PREFIX = "poster:v1:";
const POSTER_TTL_MS = 1000 * 60 * 60 * 24 * 7;
function posterKey(url){ return POSTER_CACHE_PREFIX + url; }
function getCachedPoster(url){
  try{
    const raw = localStorage.getItem(posterKey(url));
    if(!raw) return null;
    const obj = JSON.parse(raw);
    if(!obj || !obj.dataUrl || !obj.ts) return null;
    if(Date.now() - obj.ts > POSTER_TTL_MS) return null;
    return obj.dataUrl;
  }catch{ return null; }
}
function setCachedPoster(url, dataUrl){
  try{ localStorage.setItem(posterKey(url), JSON.stringify({ dataUrl, ts: Date.now() })); }catch{}
}

async function capturePoster(url){
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.src = url;

    const cleanup = () => { v.pause(); v.removeAttribute("src"); v.load(); };

    v.addEventListener("error", () => { cleanup(); reject(new Error("video_error")); }, { once:true });

    v.addEventListener("loadeddata", () => {
      try{
        const target = Math.min(0.4, (v.duration || 1) * 0.1);
        const doShot = () => {
          try{
            const canvas = document.createElement("canvas");
            const W = 960, H = 540;
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext("2d");

            const vw = v.videoWidth || 1280;
            const vh = v.videoHeight || 720;
            const srcAR = vw / vh;
            const dstAR = W / H;

            let sx=0, sy=0, sw=vw, sh=vh;
            if(srcAR > dstAR){ sw = Math.floor(vh * dstAR); sx = Math.floor((vw - sw)/2); }
            else { sh = Math.floor(vw / dstAR); sy = Math.floor((vh - sh)/2); }

            ctx.drawImage(v, sx, sy, sw, sh, 0, 0, W, H);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
            cleanup();
            resolve(dataUrl);
          }catch(err){ cleanup(); reject(err); }
        };

        if (!isNaN(v.duration) && v.duration > 0) {
          v.currentTime = target;
          v.addEventListener("seeked", doShot, { once:true });
        } else doShot();
      }catch(err){ cleanup(); reject(err); }
    }, { once:true });
  });
}

const TEMPLATES = URLS.map((url, i) => {
  const filename = filenameFromUrl(url);
  const category = CATEGORIES[i % CATEGORIES.length];
  const id = `tpl_${i + 1}_${slugify(baseName(filename))}`;

  const tags = buildTags(filename, i, category);
  const seed = seedNum(id);
  const social = genSocial(seed);
  const badge = genBadge(category, tags, seed);

  return {
    id,
    videoUrl: url,
    title: tiktokTitle(category, filename),
    desc: tiktokDesc(category, filename),
    tags,
    ratio: "9:16",
    duration: "6–10s",
    prompt: pickPrompt(category, filename),
    primaryCategory: category,
    social,
    badge
  };
});

// DOM
const grid = document.getElementById("grid");
const feedList = document.getElementById("feedList");
const toastEl = document.getElementById("toast");
const consoleStatus = document.getElementById("consoleStatus");
const consoleSelected = document.getElementById("consoleSelected");
const consoleMode = document.getElementById("consoleMode");

const modal = document.getElementById("previewModal");
const btnCloseModal = document.getElementById("btnCloseModal");
const pvTitle = document.getElementById("pvTitle");
const pvSub = document.getElementById("pvSub");
const pvVideo = document.getElementById("pvVideo");
const pvNext = document.getElementById("pvNext");
const pvPrompt = document.getElementById("pvPrompt");
const btnCopyPrompt = document.getElementById("btnCopyPrompt");
const pvProof = document.getElementById("pvProof");

const btnPlayPause = document.getElementById("btnPlayPause");
const btnMute = document.getElementById("btnMute");
const btnUnmute = document.getElementById("btnUnmute");
const btnDownload = document.getElementById("btnDownload");

const btnForYou = document.getElementById("btnForYou");
const btnFollowing = document.getElementById("btnFollowing");
const tabsBar = document.getElementById("tabsBar");

// Mobile overlay
const mobileOverlay = document.getElementById("mobileOverlay");
const overlayTabs = document.getElementById("overlayTabs");
const mForYou = document.getElementById("mForYou");
const mFollowing = document.getElementById("mFollowing");
const mShuffle = document.getElementById("mShuffle");

// Shuffle (sync both)
const btnShuffle = document.getElementById("btnShuffle");
function doShuffle(){
  currentList = shuffle([...currentList]);
  renderFeed(currentList);
  renderGrid(currentList);
  toast("Shuffled");
}
btnShuffle.addEventListener("click", doShuffle);
mShuffle.addEventListener("click", doShuffle);

btnCloseModal.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (modal.classList.contains("show") && (e.key === "ArrowRight" || e.key === "Enter")) pvNext.click();
});

btnCopyPrompt.addEventListener("click", async () => {
  const text = pvPrompt.textContent || "";
  try { await navigator.clipboard.writeText(text); toast("Copied"); }
  catch { toast("Copy failed"); }
});

btnPlayPause.addEventListener("click", async () => {
  if (pvVideo.paused) {
    try { await pvVideo.play(); btnPlayPause.textContent = "⏸"; } catch {}
  } else {
    pvVideo.pause(); btnPlayPause.textContent = "▶";
  }
});

btnMute.addEventListener("click", () => {
  pvVideo.muted = true;
  btnMute.style.display = "none";
  btnUnmute.style.display = "";
  toast("Muted");
});
btnUnmute.addEventListener("click", () => {
  pvVideo.muted = false;
  btnUnmute.style.display = "none";
  btnMute.style.display = "";
  toast("Unmuted");
});

btnDownload.addEventListener("click", () => downloadCurrentVideo());
async function downloadCurrentVideo() {
  const src = pvVideo?.src || "";
  if (!src) return toast("Chưa có video");
  toast("Đang tải…");

  try {
    const a = document.createElement("a");
    a.href = src;
    a.download = filenameFromUrl(src) || "video.mp4";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();

    try {
      const res = await fetch(src, { mode: "cors" });
      if (!res.ok) throw new Error("fetch_not_ok");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a2 = document.createElement("a");
      a2.href = url;
      a2.download = filenameFromUrl(src) || "video.mp4";
      document.body.appendChild(a2);
      a2.click();
      a2.remove();
      URL.revokeObjectURL(url);
    } catch {}
  } catch (e) {
    console.error(e);
    toast("Không tải được 😢");
  }
}

// Modes
let feedMode = "for_you";
function setMode(mode){
  feedMode = mode;

  // desktop buttons
  btnForYou.classList.toggle("active", mode==="for_you");
  btnFollowing.classList.toggle("active", mode==="following");

  // mobile overlay buttons
  mForYou.classList.toggle("active", mode==="for_you");
  mFollowing.classList.toggle("active", mode==="following");

  consoleMode.textContent = mode==="for_you" ? "for_you" : "following";
  applyFilters();
}
btnForYou.addEventListener("click", () => setMode("for_you"));
btnFollowing.addEventListener("click", () => setMode("following"));
mForYou.addEventListener("click", () => setMode("for_you"));
mFollowing.addEventListener("click", () => setMode("following"));

// Filters/tabs state
let activeFilter = "all";
let activeTab = "all";
let currentList = [...TEMPLATES];
let currentIndex = 0;

// Sidebar filter
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter || "all";
    applyFilters();
  });
});

// ✅ Unified tab setter (sync topbar + overlay)
function setActiveTab(tabName, { smooth=true } = {}) {
  activeTab = tabName || "all";

  // topbar
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x.dataset.tab === activeTab));
  // overlay
  document.querySelectorAll(".otab").forEach(x => x.classList.toggle("active", x.dataset.tab === activeTab));

  applyFilters();

  // scroll active into view (center)
  const topActive = document.querySelector(`.tab[data-tab="${CSS.escape(activeTab)}"]`);
  const ovActive  = document.querySelector(`.otab[data-tab="${CSS.escape(activeTab)}"]`);

  try { topActive && topActive.scrollIntoView({ behavior: smooth ? "smooth":"instant", inline:"center", block:"nearest" }); } catch {}
  try { ovActive  && ovActive.scrollIntoView({ behavior: smooth ? "smooth":"instant", inline:"center", block:"nearest" }); } catch {}
}

// topbar click
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => setActiveTab(btn.dataset.tab, { smooth:true }));
});
// overlay click
document.querySelectorAll(".otab").forEach(btn => {
  btn.addEventListener("click", () => setActiveTab(btn.dataset.tab, { smooth:true }));
});

// Modal next
pvNext.addEventListener("click", () => {
  if (!currentList.length) return;
  currentIndex = (currentIndex + 1) % currentList.length;
  openTemplate(currentList[currentIndex]);
});

// Filtering
function applyFilters() {
  let list = [...TEMPLATES];

  if (feedMode === "following") {
    list = list.filter(t => !t.tags.includes("affiliate") || t.tags.includes("aesthetic") || t.tags.includes("business"));
    list.sort((a,b) => (b.social.score - a.social.score));
  } else {
    list.sort((a,b) => (b.social.views - a.social.views));
  }

  if (activeFilter !== "all") list = list.filter(t => t.tags.includes(activeFilter));
  if (activeTab !== "all") list = list.filter(t => t.tags.includes(activeTab));

  if (!list.length) {
    list = [...TEMPLATES];
    if (feedMode === "for_you") list.sort((a,b)=>b.social.views-a.social.views);
    else list.sort((a,b)=>b.social.score-a.social.score);
  }

  currentList = list;
  renderFeed(list);
  renderGrid(list);

  consoleStatus.textContent = "ready";
  consoleSelected.textContent = list.length ? `${list.length} templates` : "none";

  kickPosterJobs(list);
}

// Feed render
function renderFeed(list) {
  feedList.innerHTML = "";
  const subset = list.slice(0, 24);

  subset.forEach((t, idx) => {
    const item = document.createElement("div");
    item.className = "feed-item";
    item.dataset.id = t.id;

    const badgeHtml = t.badge ? `<span class="badge ${t.badge.cls}">${escapeHtml(t.badge.text)}</span>` : "";

    item.innerHTML = `
      <div class="feed-left">
        <div class="feed-frame">
          <div class="feed-badges">${badgeHtml}</div>
          <img alt="poster" data-poster="${escapeHtml(t.id)}" />
        </div>
      </div>

      <div class="feed-meta">
        <h3>${escapeHtml(t.title)}</h3>
        <p>${escapeHtml(t.desc)}</p>

        <div class="proof-row">
          <span class="proof-chip">👀 ${formatK(t.social.views)} views</span>
          <span class="proof-chip">💾 ${formatK(t.social.saves)} saves</span>
          <span class="proof-chip">📈 ${t.social.score}/100</span>
          <span class="proof-chip">${primaryLabel(t.primaryCategory)}</span>
          <span class="proof-chip">${modeLabel(t.tags)}</span>
        </div>

        <div class="feed-actions">
          <button class="btn primary" data-run="${t.id}">Run</button>
          <button class="btn ghost" data-open="${t.id}">Preview</button>
        </div>

        <div class="muted" style="font-size:12px;line-height:1.35">
          Prompt: ${escapeHtml(t.prompt.slice(0, 110))}${t.prompt.length>110?"…":""}
        </div>
      </div>
    `;

    feedList.appendChild(item);

    item.querySelector(`[data-run="${t.id}"]`).addEventListener("click", () => {
      currentIndex = idx;
      runTemplate(t);
    });
    item.querySelector(`[data-open="${t.id}"]`).addEventListener("click", () => {
      currentIndex = idx;
      openTemplate(t);
    });

    item.querySelector(".feed-frame").addEventListener("click", () => {
      currentIndex = idx;
      openTemplate(t);
    });

    const img = item.querySelector(`img[data-poster="${t.id}"]`);
    const cached = getCachedPoster(t.videoUrl);
    if (cached) img.src = cached;
  });
}

// Grid render
function renderGrid(list) {
  grid.innerHTML = "";
  const subset = list.slice(0, 36);

  subset.forEach((t, idx) => {
    const el = document.createElement("div");
    el.className = "card";
    el.dataset.id = t.id;

    const badgeHtml = t.badge
      ? `<div class="badges"><span class="badge ${t.badge.cls}">${escapeHtml(t.badge.text)}</span></div>`
      : "";

    const posterHtml = `
      <div class="poster">
        <img alt="poster" data-poster="${escapeHtml(t.id)}" />
      </div>
    `;

    const proofHtml = `
      <div class="proof-row">
        <span class="proof-chip">👀 ${formatK(t.social.views)} views</span>
        <span class="proof-chip">💾 ${formatK(t.social.saves)} saves</span>
        <span class="proof-chip">📈 ${t.social.score}/100</span>
      </div>
    `;

    el.innerHTML = `
      ${badgeHtml}

      <div class="hover-preview" aria-hidden="true">
        <div class="mini-frame">
          <video muted loop playsinline preload="metadata"></video>
        </div>
      </div>

      <div class="card-content">
        ${posterHtml}
        <h3>${escapeHtml(t.title)}</h3>
        <p>${escapeHtml(t.desc)}</p>
        ${proofHtml}

        <div class="meta">
          <span class="pill">${escapeHtml(primaryLabel(t.primaryCategory))}</span>
          <span class="pill">${escapeHtml(modeLabel(t.tags))}</span>
          <span class="pill">${escapeHtml(t.duration)}</span>
        </div>

        <div class="run">
          <span class="status">${escapeHtml(shortId(t.id))}</span>
          <button class="btn ghost" data-open="${t.id}">Preview</button>
          <button class="btn primary" data-run="${t.id}">Run</button>
        </div>
      </div>
    `;

    grid.appendChild(el);

    el.querySelector(`[data-open="${t.id}"]`).addEventListener("click", () => {
      currentIndex = idx;
      openTemplate(t);
    });
    el.querySelector(`[data-run="${t.id}"]`).addEventListener("click", () => {
      currentIndex = idx;
      runTemplate(t);
    });

    const img = el.querySelector(`img[data-poster="${t.id}"]`);
    const cached = getCachedPoster(t.videoUrl);
    if (cached) img.src = cached;

    const miniVideo = el.querySelector(".hover-preview video");
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    if (miniVideo && !prefersReduced && isFinePointer) {
      miniVideo.src = t.videoUrl;
      miniVideo.load();

      let hoverTimer = null;
      el.addEventListener("mouseenter", () => {
        hoverTimer = setTimeout(() => {
          try { miniVideo.currentTime = 0; miniVideo.play(); } catch {}
        }, 120);
      });
      el.addEventListener("mouseleave", () => {
        if (hoverTimer) clearTimeout(hoverTimer);
        try { miniVideo.pause(); } catch {}
      });
    }
  });
}

// Poster jobs
let posterQueue = [];
let posterRunning = 0;
const POSTER_CONCURRENCY = 2;

function kickPosterJobs(list) {
  const missing = list
    .slice(0, 36)
    .filter(t => !getCachedPoster(t.videoUrl))
    .map(t => t.videoUrl);

  const seen = new Set(posterQueue);
  missing.forEach(u => { if (!seen.has(u)) posterQueue.push(u); });

  drainPosterQueue();
}
function drainPosterQueue() {
  while (posterRunning < POSTER_CONCURRENCY && posterQueue.length) {
    const url = posterQueue.shift();
    posterRunning++;
    capturePoster(url)
      .then(dataUrl => {
        setCachedPoster(url, dataUrl);
        updatePostersInDOM(url, dataUrl);
      })
      .catch(() => {})
      .finally(() => {
        posterRunning--;
        drainPosterQueue();
      });
  }
}
function updatePostersInDOM(url, dataUrl) {
  const ids = TEMPLATES.filter(t => t.videoUrl === url).map(t => t.id);
  ids.forEach(id => {
    document.querySelectorAll(`img[data-poster="${CSS.escape(id)}"]`).forEach(img => {
      img.src = dataUrl;
    });
  });
}

// Modal actions
function runTemplate(t) {
  consoleStatus.textContent = "running";
  consoleSelected.textContent = t.title;
  openTemplate(t, { autoplay:true });
}
function openTemplate(t, { autoplay=true } = {}) {
  pvTitle.textContent = t.title;
  pvSub.textContent = `${t.ratio} • ${primaryLabel(t.primaryCategory)} • ${modeLabel(t.tags)}`;
  pvPrompt.textContent = t.prompt || "";

  pvProof.innerHTML = `
    <span class="proof-chip">👀 ${formatK(t.social.views)} views</span>
    <span class="proof-chip">💾 ${formatK(t.social.saves)} saves</span>
    <span class="proof-chip">📈 ${t.social.score}/100</span>
  `;

  pvVideo.src = t.videoUrl;
  pvVideo.muted = true;
  btnMute.style.display = "none";
  btnUnmute.style.display = "";
  btnPlayPause.textContent = "⏸";

  pvVideo.load();

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  if (autoplay) {
    pvVideo.play().catch(() => { btnPlayPause.textContent = "▶"; });
  }
}
function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  pvVideo.pause();
  pvVideo.removeAttribute("src");
  pvVideo.load();
  consoleStatus.textContent = "ready";
}

// Helpers
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1200);
}
function escapeHtml(s="") {
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function shortId(id) {
  const m = id.match(/^tpl_(\d+)/);
  return m ? `tpl_${m[1]}` : id;
}

// ✅ Swipe to change tab (mobile)
function nextTab(dir){ // dir: +1 or -1
  const i = TAB_ORDER.indexOf(activeTab);
  const ni = Math.max(0, Math.min(TAB_ORDER.length - 1, i + dir));
  if (ni !== i) setActiveTab(TAB_ORDER[ni], { smooth:true });
}

function setupSwipeTabs() {
  let sx=0, sy=0, st=0;
  let tracking = false;

  feedList.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    const t = e.touches[0];
    sx = t.clientX; sy = t.clientY; st = Date.now();
    tracking = true;
  }, { passive:true });

  feedList.addEventListener("touchend", (e) => {
    if (!tracking) return;
    tracking = false;

    const t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
    if (!t) return;

    const dx = t.clientX - sx;
    const dy = t.clientY - sy;
    const dt = Date.now() - st;

    // ignore slow drags
    if (dt > 600) return;

    // horizontal swipe requirement
    if (Math.abs(dx) < 55) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;

    // swipe left -> next tab, right -> prev
    if (dx < 0) nextTab(+1);
    else nextTab(-1);
  }, { passive:true });
}

// Boot
applyFilters();
setupSwipeTabs();

// ✅ On load: keep active tab centered on mobile
setTimeout(() => {
  setActiveTab(activeTab, { smooth:false });
}, 60);
