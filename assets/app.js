// web/assets/app.js
// Trending demo UI (AdbPad-like) — no settings, no hints, one-click preview

// Local videos folder on GitHub Pages:
// Put your 8 local mp4 files into: web/videos/
const LOCAL_BASE = "./videos/";

// Provided videos
const PROVIDED_VIDEOS = [
  // Local (SND) — stored in web/videos/
  "[SND]BethGulfofMexico.mp4",
  "[SND]Breecker-crane-over-head-with-LOTR-Nazgul.mp4",
  "[SND]breecker-dolly-left-swipe-in-person.mp4",
  "[SND]ed-angel-gorilla-2.mp4",
  "[SND]ed-angel-gorilla.mp4",
  "[SND]errand-missed-catch.mp4",
  "[SND]Graydon_RxBurn.mp4",
  "[SND]nyc-lateshow-icecream.mp4",

  // Remote URLs
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

// ---- Build a normalized list with URL + meta ----
function normalizeVideo(item) {
  if (item.startsWith("[SND]")) {
    const filename = item.replace("[SND]", "").trim();
    return {
      source: "local",
      filename,
      url: `${LOCAL_BASE}${encodeURIComponent(filename)}`
    };
  }
  // remote
  const url = item.trim();
  const filename = decodeURIComponent(url.split("/").pop() || "video.mp4");
  return { source: "remote", filename, url };
}

const VIDEOS = PROVIDED_VIDEOS.map(normalizeVideo);

// ---- Tagging / categorization heuristics (for your new index.html filters) ----
function baseName(filename) {
  return filename.replace(/\.mp4$/i, "");
}

function titleFromFilename(filename) {
  // Make it feel like “trending template cards”
  const name = baseName(filename)
    .replace(/[_-]+/g, " ")
    .replace(/\bai\b/gi, "AI")
    .replace(/\bnyc\b/gi, "NYC")
    .trim();

  // Title case-ish
  return name
    .split(" ")
    .filter(Boolean)
    .map(w => w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function pickTags(filename) {
  const f = filename.toLowerCase();

  // Primary categories (must match sidebar filters in index.html)
  const tags = new Set(["viral"]); // default trending feed

  // Motion / cinematic feel
  if (f.includes("dolly") || f.includes("crane") || f.includes("orbit") || f.includes("rotate") || f.includes("bulletcam")) {
    tags.add("cinematic");
  }

  // POV vibes
  if (f.includes("in-person") || f.includes("missed") || f.includes("catch") || f.includes("smile")) {
    tags.add("pov");
  }

  // Tech & AI vibe
  if (f.includes("ai") || f.includes("bulletcam")) {
    tags.add("tech");
  }

  // Aesthetic / lifestyle
  if (f.includes("nyc") || f.includes("icecream") || f.includes("beth") || f.includes("gulf") || f.includes("museum") || f.includes("sunset")) {
    tags.add("aesthetic");
  }

  // Community / reactions
  if (f.includes("thumbs-up") || f.includes("toast") || f.includes("smile")) {
    tags.add("community");
  }

  // Business/Affiliate/Local/Food — map lightly based on words (can expand later)
  if (f.includes("icecream")) tags.add("food");
  if (f.includes("nyc") || f.includes("museum")) tags.add("local");

  // Secondary feed tabs in index.html
  tags.add("shorts"); // all are short clips style

  // Optional: affiliate-ready for “product-like” clips (you can refine later)
  // tags.add("affiliate");

  return Array.from(tags);
}

function shortDesc(filename, source) {
  const f = filename.toLowerCase();
  const motion =
    f.includes("dolly") ? "Dolly shot" :
    f.includes("crane") ? "Crane overhead" :
    f.includes("orbit") ? "Orbit camera" :
    f.includes("rotate") ? "Rotate move" :
    f.includes("bulletcam") ? "Bullet-cam" :
    "Trending clip";

  const vibe =
    f.includes("nazgul") ? "Fantasy vibe" :
    f.includes("gorilla") ? "Surreal creature" :
    f.includes("icecream") ? "Street snack vibe" :
    f.includes("thumbs-up") ? "Reaction-friendly" :
    f.includes("toast") ? "Social moment" :
    f.includes("museum") ? "Aesthetic travel" :
    f.includes("smile") ? "Feel-good" :
    f.includes("burn") ? "Action vibe" :
    "Viral-ready";

  return `${motion} • ${vibe} • ${source === "local" ? "local" : "cloud"}`;
}

// ---- Build templates directly from your video list ----
const TEMPLATES = VIDEOS.map((v, i) => {
  const id = `tpl_${i + 1}`;
  return {
    id,
    videoUrl: v.url,
    title: titleFromFilename(v.filename),
    desc: shortDesc(v.filename, v.source),
    tags: pickTags(v.filename),
    ratio: "9:16",
    style: v.source === "local" ? "Local" : "Cloud",
    duration: "6s"
  };
});

// Build lookup for video URLs
const VIDEO_URLS = Object.fromEntries(TEMPLATES.map(t => [t.id, t.videoUrl]));

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

document.getElementById("btnShuffle").addEventListener("click", () => {
  currentList = shuffle([...currentList]);
  renderGrid(currentList);
  toast("Shuffled");
});

btnCloseModal.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Keyboard support
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (modal.classList.contains("show") && (e.key === "ArrowRight" || e.key === "Enter")) {
    pvNext.click();
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

// ---------- Render ----------
function applyFilters() {
  let list = [...TEMPLATES];

  if (activeFilter !== "all") {
    list = list.filter(t => t.tags.includes(activeFilter));
  }

  if (activeTab !== "all") {
    list = list.filter(t => t.tags.includes(activeTab));
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
    empty.innerHTML = `<h3>No templates</h3><p>Không có mẫu phù hợp filter hiện tại.</p>`;
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
        <span class="pill">${escapeHtml(t.ratio)}</span>
        <span class="pill">${escapeHtml(t.style)}</span>
        <span class="pill">${escapeHtml(t.duration)}</span>
      </div>
      <div class="run">
        <span class="status">${escapeHtml(t.id)}</span>
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
  const url = VIDEO_URLS[t.id];

  pvTitle.textContent = t.title;
  pvSub.textContent = `${t.ratio} • ${t.style} • ${t.duration}`;

  pvVideo.src = url;
  pvVideo.load();

  pvOpen.href = url;
  pvOpen.textContent = "Open MP4";

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
  // Minimal toast: no hints, no guidance
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1600);
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

// Boot
applyFilters();
