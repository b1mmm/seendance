// web/assets/app.js
// Demo UI (AdbPad-like) — no settings, no auth, one-click preview

// 1) Bạn chỉ cần gắn MP4 link ở đây sau:
const VIDEO_URLS = {
  // Audit Camera Bot Ads (dán link mp4 của bạn vào value)
  audit_warning: "",        // e.g. "https://.../audit_warning.mp4"
  ai_scan: "",
  telegram_alert: "",
  before_after: "",
  cta_audit_now: "",

  // Cafe / local (nếu bạn muốn demo thêm)
  cafe_mediterranean: "",
  cafe_sunset: ""
};

// 2) Danh sách card demo (hiện ngay trên web)
const TEMPLATES = [
  {
    id: "audit_warning",
    title: "Camera Exposed — Warning",
    desc: "Intro đánh mạnh tâm lý: camera lộ internet → cảnh báo đỏ.",
    tags: ["audit", "ads"],
    ratio: "9:16",
    style: "Cinematic",
    duration: "6s"
  },
  {
    id: "ai_scan",
    title: "AI Scan IP — Risk Score",
    desc: "AI quét IP + chấm điểm rủi ro + UI cyber.",
    tags: ["audit", "ads"],
    ratio: "9:16",
    style: "Cyber UI",
    duration: "6s"
  },
  {
    id: "telegram_alert",
    title: "Telegram Alert — Push",
    desc: "Thông báo Telegram bật lên: phát hiện camera rủi ro.",
    tags: ["audit", "comm"],
    ratio: "9:16",
    style: "Neon",
    duration: "6s"
  },
  {
    id: "before_after",
    title: "Before / After — Secured",
    desc: "So sánh trước/sau: insecure → secured (shield effect).",
    tags: ["audit", "brand"],
    ratio: "9:16",
    style: "Dramatic",
    duration: "6s"
  },
  {
    id: "cta_audit_now",
    title: "CTA — Audit Now",
    desc: "Cảnh kết: logo + call to action (đăng TikTok/Reels).",
    tags: ["audit", "brand"],
    ratio: "9:16",
    style: "Cinematic",
    duration: "6s"
  },
  {
    id: "cafe_mediterranean",
    title: "Cafe — Mediterranean Vibe",
    desc: "Demo style địa trung hải: hoa giấy, biển, ánh nắng.",
    tags: ["cafe", "ads"],
    ratio: "9:16",
    style: "Realistic",
    duration: "6s"
  },
  {
    id: "cafe_sunset",
    title: "Cafe — Sunset Reel",
    desc: "Golden hour, biển, chuyển động camera mượt.",
    tags: ["cafe", "brand"],
    ratio: "9:16",
    style: "Cinematic",
    duration: "6s"
  }
];

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
    // map tab -> tags
    const tabTag = activeTab === "comm" ? "comm" : activeTab; // audit/brand/comm
    list = list.filter(t => t.tags.includes(tabTag));
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
  consoleStatus.textContent = "running (demo)";
  consoleSelected.textContent = t.title;

  // In demo mode, Run = open preview immediately
  openTemplate(t);
}

function openTemplate(t) {
  const url = VIDEO_URLS[t.id] || "";
  pvTitle.textContent = t.title;
  pvSub.textContent = `${t.ratio} • ${t.style} • ${t.duration}`;

  if (!url) {
    pvVideo.removeAttribute("src");
    pvVideo.load();
    pvOpen.href = "#";
    pvOpen.classList.add("disabled");
    pvOpen.textContent = "MP4 chưa gắn";
    toast("Chưa có link MP4 — bạn gắn vào VIDEO_URLS (app.js)");
  } else {
    pvVideo.src = url;
    pvVideo.load();
    pvOpen.href = url;
    pvOpen.classList.remove("disabled");
    pvOpen.textContent = "Open MP4";
  }

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
  setTimeout(() => toastEl.classList.remove("show"), 2200);
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
