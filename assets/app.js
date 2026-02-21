// === CONFIG ===
// You can keep API_BASE here or set it in Admin panel to override.
const API_BASE_DEFAULT = "https://YOUR_WORKER_DOMAIN.workers.dev";

// LocalStorage keys
const LS_API_BASE = "va_api_base";
const LS_ADMIN_TOKEN = "va_admin_token";

const state = {
  templates: [],
  jobs: [],
  apiBase: localStorage.getItem(LS_API_BASE) || API_BASE_DEFAULT,
  adminToken: localStorage.getItem(LS_ADMIN_TOKEN) || ""
};

// DOM
const grid = document.getElementById("grid");
const jobsEl = document.getElementById("jobs");
const toastEl = document.getElementById("toast");

document.getElementById("btnRefresh").addEventListener("click", refreshAll);

// Admin drawer UI
const adminDrawer = document.getElementById("adminDrawer");
const btnAdminToggle = document.getElementById("btnAdminToggle");
const btnAdminClose = document.getElementById("btnAdminClose");
const btnSetting = document.getElementById("btnSetting");

const adminApiBase = document.getElementById("adminApiBase");
const adminToken = document.getElementById("adminToken");
const adminStatus = document.getElementById("adminStatus");
const btnSaveAdmin = document.getElementById("btnSaveAdmin");
const btnClearAdmin = document.getElementById("btnClearAdmin");

// quick actions
const qJobId = document.getElementById("qJobId");
const qVideoUrl = document.getElementById("qVideoUrl");
const qThumbUrl = document.getElementById("qThumbUrl");
const qFailReason = document.getElementById("qFailReason");
const btnQuickComplete = document.getElementById("btnQuickComplete");
const btnQuickStart = document.getElementById("btnQuickStart");
const btnQuickFail = document.getElementById("btnQuickFail");

// Init admin fields
adminApiBase.value = state.apiBase;
adminToken.value = state.adminToken;
updateAdminStatus();

// Open/close drawer
btnAdminToggle.addEventListener("click", toggleAdminDrawer);
btnAdminClose.addEventListener("click", () => setDrawer(false));
adminDrawer.addEventListener("click", (e) => {
  if (e.target === adminDrawer) setDrawer(false);
});

// Secret open (Ctrl+K)
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    toggleAdminDrawer();
  }
});

// Easter: click Setting 5 times
let settingClicks = 0;
btnSetting.addEventListener("click", () => {
  settingClicks++;
  if (settingClicks >= 5) {
    settingClicks = 0;
    setDrawer(true);
  }
});

// Save/Clear admin creds
btnSaveAdmin.addEventListener("click", () => {
  state.apiBase = adminApiBase.value.trim() || API_BASE_DEFAULT;
  state.adminToken = adminToken.value.trim();

  localStorage.setItem(LS_API_BASE, state.apiBase);
  localStorage.setItem(LS_ADMIN_TOKEN, state.adminToken);

  updateAdminStatus();
  toast("Saved");
  refreshAll();
});

btnClearAdmin.addEventListener("click", () => {
  state.adminToken = "";
  localStorage.removeItem(LS_ADMIN_TOKEN);
  adminToken.value = "";
  updateAdminStatus();
  toast("Cleared token");
});

// Quick actions
btnQuickComplete.addEventListener("click", async () => {
  await adminComplete(qJobId.value.trim(), qVideoUrl.value.trim(), qThumbUrl.value.trim());
});
btnQuickStart.addEventListener("click", async () => {
  await adminStart(qJobId.value.trim());
});
btnQuickFail.addEventListener("click", async () => {
  await adminFail(qJobId.value.trim(), qFailReason.value.trim());
});

function toggleAdminDrawer(){
  setDrawer(!adminDrawer.classList.contains("show"));
}
function setDrawer(open){
  adminDrawer.classList.toggle("show", open);
  adminDrawer.setAttribute("aria-hidden", open ? "false" : "true");
}
function updateAdminStatus(){
  adminStatus.textContent = state.adminToken ? "unlocked" : "locked";
}

// ==== API ====
function apiBase(){ return state.apiBase; }

async function refreshAll(){
  await loadTemplates();
  renderTemplates();
  await loadRecentJobs();
  renderJobs();
}

async function loadTemplates(){
  const res = await fetch(`${apiBase()}/api/templates`);
  const data = await res.json();
  state.templates = data.items || [];
}

async function loadRecentJobs(){
  const res = await fetch(`${apiBase()}/api/jobs?recent=1`);
  const data = await res.json();
  state.jobs = (data.items || []).slice(0, 10);
}

// ==== Templates UI ====
function renderTemplates(){
  grid.innerHTML = "";
  for (const t of state.templates){
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <h3>${escapeHtml(t.title)}</h3>
      <p>${escapeHtml(t.desc || "")}</p>
      <div class="meta">
        <span class="pill">${escapeHtml(t.ratio || "9:16")}</span>
        <span class="pill">${escapeHtml(t.style || "Cinematic")}</span>
        <span class="pill">${escapeHtml(t.duration || "6s")}</span>
      </div>
      <div class="run">
        <span class="status" id="st_${t.id}">ready</span>
        <button class="btn ghost" data-copy="${t.id}">Copy prompt</button>
        <button class="btn primary" data-run="${t.id}">Run</button>
      </div>
    `;
    grid.appendChild(el);
  }

  grid.querySelectorAll("[data-copy]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-copy");
      const tpl = state.templates.find(x=>x.id===id);
      navigator.clipboard.writeText(tpl?.prompt || "");
      toast("Copied prompt");
    });
  });

  grid.querySelectorAll("[data-run]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const tplId = btn.getAttribute("data-run");
      await runJob(tplId);
    });
  });
}

async function runJob(tplId){
  setTplStatus(tplId, "queueing...");
  const res = await fetch(`${apiBase()}/api/jobs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tplId,
      input: {
        product: "Audit Camera Bot",
        goal: "ads_short"
      }
    })
  });
  const data = await res.json();
  if (!data.ok){
    setTplStatus(tplId, "error");
    toast(`Create job failed: ${data.error || "unknown"}`);
    return;
  }
  setTplStatus(tplId, `queued`);
  toast(`Job queued`);
  await loadRecentJobs();
  renderJobs();
}

function setTplStatus(tplId, text){
  const el = document.getElementById(`st_${tplId}`);
  if (el) el.textContent = text;
}

// ==== Jobs UI ====
function renderJobs(){
  jobsEl.innerHTML = "";
  const canAdmin = !!state.adminToken;

  for (const j of state.jobs){
    const badgeClass =
      j.status === "done" ? "done" :
      j.status === "running" ? "running" :
      j.status === "failed" ? "failed" : "";

    const download =
      j.result?.videoUrl
        ? `<a class="btn ghost" href="${escapeAttr(j.result.videoUrl)}" target="_blank" rel="noreferrer">Download</a>`
        : `<button class="btn ghost" disabled>Download</button>`;

    const adminBtn = canAdmin
      ? `<button class="btn ghost" data-admin="${escapeAttr(j.id)}">Admin</button>`
      : ``;

    const el = document.createElement("div");
    el.className = "job";
    el.innerHTML = `
      <div>
        <div><strong>${escapeHtml(j.tplId)}</strong> <small>(${new Date(j.createdAt).toLocaleString()})</small></div>
        <small>${escapeHtml(j.id)}</small>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        ${download}
        ${adminBtn}
        <span class="badge ${badgeClass}">${escapeHtml(j.status)}</span>
      </div>
    `;
    jobsEl.appendChild(el);
  }

  // Admin per job: fill quick form + open drawer
  jobsEl.querySelectorAll("[data-admin]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = btn.getAttribute("data-admin");
      qJobId.value = id;

      // auto-fill existing result if any
      const job = state.jobs.find(x => x.id === id);
      qVideoUrl.value = job?.result?.videoUrl || "";
      qThumbUrl.value = job?.result?.thumbUrl || "";

      setDrawer(true);
    });
  });
}

// ==== Admin API calls ====
function authHeaders(){
  return {
    "content-type": "application/json",
    "Authorization": `Bearer ${state.adminToken}`
  };
}

async function adminStart(jobId){
  if (!jobId) return toast("Job ID required");
  if (!state.adminToken) return toast("Admin token required");

  const res = await fetch(`${apiBase()}/api/admin/jobs/${encodeURIComponent(jobId)}/start`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({})
  });
  const data = await res.json();
  if (!data.ok) return toast(`Start failed: ${data.error || "unknown"}`);
  toast("Marked running");
  await loadRecentJobs();
  renderJobs();
}

async function adminComplete(jobId, videoUrl, thumbUrl){
  if (!jobId) return toast("Job ID required");
  if (!state.adminToken) return toast("Admin token required");
  if (!videoUrl) return toast("Video URL required");

  const res = await fetch(`${apiBase()}/api/admin/jobs/${encodeURIComponent(jobId)}/complete`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ videoUrl, thumbUrl })
  });
  const data = await res.json();
  if (!data.ok) return toast(`Complete failed: ${data.error || "unknown"}`);
  toast("Completed ✅");
  await loadRecentJobs();
  renderJobs();
}

async function adminFail(jobId, reason){
  if (!jobId) return toast("Job ID required");
  if (!state.adminToken) return toast("Admin token required");

  const res = await fetch(`${apiBase()}/api/admin/jobs/${encodeURIComponent(jobId)}/fail`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ reason: reason || "unknown" })
  });
  const data = await res.json();
  if (!data.ok) return toast(`Fail failed: ${data.error || "unknown"}`);
  toast("Marked failed");
  await loadRecentJobs();
  renderJobs();
}

// ==== Toast + Escape ====
function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function escapeHtml(s=""){
  return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
function escapeAttr(s=""){
  return String(s).replace(/"/g, "%22");
}

// Boot
refreshAll();
setInterval(async () => {
  await loadRecentJobs();
  renderJobs();
}, 4000);
