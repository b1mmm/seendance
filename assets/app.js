// web/assets/app.js
// Guaranteed content per category + trending titles + prompt suggestions
// 100% remote mp4 URLs

// If your SND files are hosted elsewhere, change this base:
const SND_BASE = "https://guerin.acequia.io/ai/";

// Original list you gave (some are file names, some are full URLs)
const RAW_LIST = [
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
  } catch {
    return "video.mp4";
  }
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function humanTitle(filename) {
  const name = filename.replace(/\.mp4$/i, "").replace(/[_-]+/g, " ").trim();
  return name
    .split(" ")
    .filter(Boolean)
    .map(w => w.length <= 2 ? w.toUpperCase() : (w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

// ---- Trend labels + prompts ----
const PROMPT_BANK = {
  viral: [
    "Hook 0–1s bằng text giật tít: 'Bạn sẽ bất ngờ vì điều này…' + quick zoom, high contrast, upbeat cut.",
    "POV tình huống đời thường, text ngắn 5–7 từ, nhịp cắt nhanh, nhấn reaction cuối clip.",
    "Loop mượt (end frame match start), thêm sound cue nhẹ để tăng rewatch."
  ],
  business: [
    "Quảng cáo local business: 3 shot (establish → product/service → CTA), overlay giá/ưu đãi, logo nhỏ góc dưới.",
    "Social proof: review 1 câu + 3 bullet lợi ích + CTA 'Inbox nhận ưu đãi'.",
    "Story brand: trước/sau + con số cụ thể (vd: 'giảm 70% rủi ro')."
  ],
  affiliate: [
    "Affiliate template: 'Top 3 món đáng mua tuần này' + on-screen price + CTA 'link bio'.",
    "Before/After: 'đắt vs đáng' + 2 cảnh so sánh + 1 câu kết chốt mua.",
    "Deal countdown: 10s, 3 mốc thời gian, chữ lớn dễ đọc trên mobile."
  ],
  aesthetic: [
    "Aesthetic cinematic: ánh sáng mềm, motion chậm, color grading nhẹ, chữ tối giản.",
    "Travel vibe: establishing wide → medium → close-up texture, nhạc chill, cảm giác 'muốn đi ngay'.",
    "Golden hour: flare nhẹ, bokeh, slow pan, text 1 dòng."
  ],
  tech: [
    "Tech/AI vibe: UI overlay, scan lines, neon accent nhẹ, highlight keyword (AI / Auto / Score).",
    "Explainer nhanh: 1 câu vấn đề → 1 câu giải pháp → 1 CTA 'Try now'.",
    "Cyber trailer: warning card, risk score, icon shield, kết thúc bằng hotline."
  ],
  tutorial: [
    "How-to 3 bước: Step 1/2/3 xuất hiện rõ, mỗi bước 1–2s, chữ to.",
    "Before/After kèm checklist: 'Bật/Tắt' + icon tick/cross, kết thúc bằng 'làm ngay'.",
    "Fail case → fix: show lỗi 1s rồi chuyển sang giải pháp 4s."
  ],
  food: [
    "Food close-up: macro texture, steam/sizzle, text 'must try' + địa điểm.",
    "Menu highlight: 3 món signature, giá/ưu đãi, CTA 'đặt bàn'.",
    "Street vibe: handheld nhẹ, cut nhanh, nhạc vui."
  ],
  community: [
    "Reaction: 'Bạn chọn cái nào?' + 2 lựa chọn, cuối clip hỏi comment.",
    "Duet-ready: để khoảng trống bên trái cho người duet, text câu hỏi.",
    "Challenge: hashtag + rule 1 dòng + call-to-action tham gia."
  ]
};

// Ensure every category always has content:
// We'll assign each URL into multiple categories by rotation to guarantee filters always return videos.
const CATEGORIES = ["viral","business","affiliate","aesthetic","tech","tutorial","food","community"];

// Additional tags for top tabs
const TAB_TAGS = ["shorts","pov","cinematic","deals","local"];

function buildTags(filename, idx, category) {
  const f = filename.toLowerCase();
  const tags = new Set([category, "shorts"]); // always shorts

  // some deterministic variety so each tab also gets content
  if (idx % 2 === 0) tags.add("cinematic");
  if (idx % 3 === 0) tags.add("pov");
  if (idx % 4 === 0) tags.add("local");
  if (idx % 5 === 0) tags.add("deals");

  // add some content-aware hints
  if (f.includes("dolly") || f.includes("crane") || f.includes("orbit") || f.includes("rotate")) tags.add("cinematic");
  if (f.includes("smile") || f.includes("thumbs-up") || f.includes("toast")) tags.add("pov");
  if (f.includes("nyc") || f.includes("museum")) tags.add("local");
  if (f.includes("icecream")) tags.add("food"), tags.add("deals"), tags.add("affiliate");

  // ALSO add viral always to keep exploration fun
  tags.add("viral");

  return Array.from(tags);
}

function pickPrompt(category, filename) {
  const pool = PROMPT_BANK[category] || PROMPT_BANK.viral;
  // deterministic pick by filename hash-ish
  const n = Array.from(filename).reduce((a,c)=>a+c.charCodeAt(0), 0);
  return pool[n % pool.length];
}

function buildDesc(category, filename) {
  const map = {
    viral: "Hook mạnh 0–2s • loop mượt • dễ viral",
    business: "Quảng cáo nhanh • rõ lợi ích • có CTA",
    affiliate: "Gắn link bio • chốt mua nhanh • deals",
    aesthetic: "Chill đẹp • cinematic • minimal text",
    tech: "AI/Tech vibe • UI overlay • scan effect",
    tutorial: "How-to 3 bước • dễ hiểu • nhanh gọn",
    food: "Ngon mắt • texture • địa điểm rõ",
    community: "Kêu gọi comment • reaction • duet-ready"
  };
  const base = map[category] || "Trending template";
  return `${base} • ${humanTitle(filename)}`;
}

// Build templates: rotate primary category so every filter always has items.
const TEMPLATES = URLS.map((url, i) => {
  const filename = filenameFromUrl(url);
  const category = CATEGORIES[i % CATEGORIES.length];
  const id = `tpl_${i + 1}_${slugify(filename.replace(/\.mp4$/i,""))}`;

  return {
    id,
    videoUrl: url,
    title: `${humanTitle(filename)} — ${category.toUpperCase()}`,
    desc: buildDesc(category, filename),
    tags: buildTags(filename, i, category),
    ratio: "9:16",
    style: "Trending",
    duration: "6–10s",
    prompt: pickPrompt(category, filename)
  };
});

// ---------- DOM ----------
const grid = document.getElementById("grid");
const toastEl = document.getElementById("toast");
const consoleStatus = document.getElementById("consoleStatus");
const consoleSelected = document.getElementById("consoleSelected");

const modal = document.getElementById("previewModal");
const btnCloseModal = document.getElementById("btnCloseModal");
const pvTitle = document.getElementById("pvTitle");
const pvSub = document.getElementById("pvSub");
const pvVideo = document.getElementById("pvVideo");
const pvOpen = document.getElementById("pvOpen");
const pvNext = document.getElementById("pvNext");
const pvPrompt = document.getElementById("pvPrompt");
const btnCopyPrompt = document.getElementById("btnCopyPrompt");

document.getElementById("btnShuffle").addEventListener("click", () => {
  currentList = shuffle([...currentList]);
  renderGrid(currentList);
  toast("Shuffled");
});

btnCloseModal.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (modal.classList.contains("show") && (e.key === "ArrowRight" || e.key === "Enter")) {
    pvNext.click();
  }
});

btnCopyPrompt.addEventListener("click", async () => {
  const text = pvPrompt.textContent || "";
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied");
  } catch {
    toast("Copy failed");
  }
});

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

// Top tabs
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    activeTab = btn.dataset.tab || "all";
    applyFilters();
  });
});

// Next button
pvNext.addEventListener("click", () => {
  if (!currentList.length) return;
  currentIndex = (currentIndex + 1) % currentList.length;
  openTemplate(currentList[currentIndex]);
});

// ---------- Filtering (guarantee non-empty) ----------
function applyFilters() {
  let list = [...TEMPLATES];

  if (activeFilter !== "all") {
    list = list.filter(t => t.tags.includes(activeFilter));
  }
  if (activeTab !== "all") {
    list = list.filter(t => t.tags.includes(activeTab));
  }

  // Guarantee: if somehow empty, fallback to a curated selection for that category/tab.
  if (!list.length) {
    if (activeFilter !== "all") {
      list = TEMPLATES.filter(t => t.tags.includes(activeFilter));
    }
    if (!list.length && activeTab !== "all") {
      list = TEMPLATES.filter(t => t.tags.includes(activeTab));
    }
    if (!list.length) list = [...TEMPLATES];
  }

  currentList = list;
  renderGrid(list);

  consoleStatus.textContent = "ready";
  consoleSelected.textContent = list.length ? `${list.length} templates` : "none";
}

function renderGrid(list) {
  grid.innerHTML = "";
  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<h3>No templates</h3><p>Không có mẫu phù hợp.</p>`;
    grid.appendChild(empty);
    return;
  }

  list.forEach((t, idx) => {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <h3>${escapeHtml(t.title)}</h3>
      <p>${escapeHtml(t.desc)}</p>
      <div class="meta">
        <span class="pill">${escapeHtml(activePrimaryTag(t))}</span>
        <span class="pill">${escapeHtml(pickBadge(t))}</span>
        <span class="pill">${escapeHtml(t.duration)}</span>
      </div>
      <div class="run">
        <span class="status">${escapeHtml(shortId(t.id))}</span>
        <button class="btn ghost" data-open="${t.id}">Preview</button>
        <button class="btn primary" data-run="${t.id}">Run</button>
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
  });
}

// ---------- Actions ----------
function runTemplate(t) {
  consoleStatus.textContent = "running";
  consoleSelected.textContent = t.title;
  openTemplate(t);
}

function openTemplate(t) {
  pvTitle.textContent = t.title;
  pvSub.textContent = `${t.ratio} • ${t.style} • ${t.duration}`;
  pvPrompt.textContent = t.prompt || "";

  pvVideo.src = t.videoUrl;
  pvVideo.load();

  pvOpen.href = t.videoUrl;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  pvVideo.pause();
  pvVideo.removeAttribute("src");
  pvVideo.load();
  consoleStatus.textContent = "ready";
}

// ---------- Helpers ----------
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1300);
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
  // keep it compact on UI
  const parts = id.split("_");
  return parts.slice(0, 2).join("_"); // tpl_#
}

function activePrimaryTag(t) {
  // show a meaningful category pill
  const priority = ["viral","affiliate","business","aesthetic","tech","tutorial","food","community"];
  for (const p of priority) if (t.tags.includes(p)) return p.toUpperCase();
  return "TREND";
}

function pickBadge(t) {
  // show a second pill as “mode”
  if (t.tags.includes("cinematic")) return "CINEMATIC";
  if (t.tags.includes("pov")) return "POV";
  if (t.tags.includes("deals")) return "DEALS";
  if (t.tags.includes("local")) return "LOCAL";
  return "SHORTS";
}

// Boot
applyFilters();
