/* TnECHO v2 — study logbook, clip capture, measurement tools, OCR and PDF report.
   All data stays on the device (IndexedDB). No network calls except loading bundled libraries. */
"use strict";

/* ================= IndexedDB ================= */
const DB = (() => {
  let p;
  const open = () => p || (p = new Promise((res, rej) => {
    const r = indexedDB.open("tnecho", 1);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains("studies")) d.createObjectStore("studies", { keyPath: "id" });
      if (!d.objectStoreNames.contains("media")) d.createObjectStore("media", { keyPath: "id" }).createIndex("study", "studyId");
    };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const tx = (store, mode, fn) => open().then(d => new Promise((res, rej) => {
    const t = d.transaction(store, mode), req = fn(t.objectStore(store));
    t.oncomplete = () => res(req && "result" in req ? req.result : undefined);
    t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
  }));
  return {
    put: (s, v) => tx(s, "readwrite", st => st.put(v)),
    get: (s, k) => tx(s, "readonly", st => st.get(k)),
    del: (s, k) => tx(s, "readwrite", st => st.delete(k)),
    all: s => tx(s, "readonly", st => st.getAll()),
    byStudy: id => tx("media", "readonly", st => st.index("study").getAll(id)),
    countStudy: id => tx("media", "readonly", st => st.index("study").count(id))
  };
})();
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}

/* ================= Study persistence ================= */
if (!S.id) { S.id = uid("s"); S.created = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
let _pt;
function persistStudy(now) {
  clearTimeout(_pt);
  const run = () => DB.put("studies", { id: S.id, updated: Date.now(), S: JSON.parse(JSON.stringify(S)) }).catch(() => {});
  if (now) return run();
  _pt = setTimeout(run, 400);
}
persistStudy(true);
function freshState(mode) {
  return { id: uid("s"), created: Date.now(), mode: mode || "beginner", f: { date: today() }, c: {}, chk: {}, na: {}, notes: {}, comfort: {}, timer: { start: 0, acc: 0, run: false } };
}
async function newStudy() {
  if (!confirm("Start a new study? The current study stays saved in the Logbook.")) return;
  await persistStudy(true);
  const n = freshState(S.mode);
  try { localStorage.setItem(KEY, JSON.stringify(n)); } catch (e) {}
  await DB.put("studies", { id: n.id, updated: Date.now(), S: n });
  location.hash = ""; location.reload();
}
async function openStudy(id) {
  await persistStudy(true);
  const r = await DB.get("studies", id); if (!r) return toast("Study not found");
  try { localStorage.setItem(KEY, JSON.stringify(r.S)); } catch (e) {}
  location.reload();
}
async function deleteStudy(id) {
  const r = await DB.get("studies", id);
  const label = r ? `${r.S.f.pid || "unnamed"} (${r.S.f.date || ""})` : id;
  if (!confirm(`Delete study ${label} and all its clips? This cannot be undone.`)) return;
  const media = await DB.byStudy(id);
  for (const m of media) await DB.del("media", m.id);
  await DB.del("studies", id);
  if (id === S.id) { const n = freshState(S.mode); localStorage.setItem(KEY, JSON.stringify(n)); await DB.put("studies", { id: n.id, updated: Date.now(), S: n }); location.reload(); return; }
  renderLog();
}
function withStudy(St, fn) { const old = S; S = St; try { return fn(); } finally { S = old; } }

/* ================= Logbook ================= */
async function allStudiesSorted() {
  const all = await DB.all("studies");
  all.sort((a, b) => (a.S.created || 0) - (b.S.created || 0));
  all.forEach((r, i) => r.caseNo = (r.S.f.caseno || "").trim() || String(i + 1));
  return all;
}
async function caseNoFor(id) { const all = await allStudiesSorted(); const r = all.find(x => x.id === id); return r ? r.caseNo : "1"; }
async function renderLog() {
  const all = await allStudiesSorted();
  const list = all.slice().sort((a, b) => (b.S.f.date || "").localeCompare(a.S.f.date || "") || (b.updated - a.updated));
  const lv = l => all.filter(r => (r.S.f.level || "") === l).length;
  $("#logstats").innerHTML = `<div><b>${all.length}</b>studies</div><div><b>${lv("Performed – supervised")}</b>supervised</div><div><b>${lv("Performed – independent")}</b>independent</div><div><b>${lv("Observed")}</b>observed</div>`;
  const counts = await Promise.all(list.map(r => DB.countStudy(r.id).catch(() => 0)));
  $("#loglist").innerHTML = list.length ? list.map((r, i) => {
    const f = r.S.f, comp = withStudy(r.S, () => completeness());
    return `<div class="logcard ${r.id === S.id ? "cur" : ""}">
      <h3>Case ${esc(r.caseNo)} · ${esc(f.date || "no date")} · ${esc(f.pid || "No ID")}${r.id === S.id ? ' <span class="tag">open</span>' : ""}</h3>
      <div class="lm">${[f.ga && "GA " + esc(f.ga), f.dol && "DOL " + esc(f.dol), f.wt && esc(f.wt) + " kg", f.level && esc(f.level)].filter(Boolean).join(" · ") || "—"}<br>
      ${esc((f.ind || "No indication recorded").slice(0, 110))}<br>${comp.text} · ${counts[i]} clip${counts[i] === 1 ? "" : "s"}</div>
      <div class="btns">${r.id === S.id ? `<button class="btn" onclick="go('protocol')">Continue</button>` : `<button class="btn" onclick="openStudy('${r.id}')">Open</button>`}
        <button class="btn ghost" onclick="downloadPDF('${r.id}')">⬇ PDF</button>
        <button class="btn danger" onclick="deleteStudy('${r.id}')">Delete</button></div></div>`;
  }).join("") : '<p class="sub">No studies yet.</p>';
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const e = await navigator.storage.estimate();
      $("#storageInfo").textContent = `Storage used on this device: ${(e.usage / 1048576).toFixed(1)} MB of ~${(e.quota / 1048576 / 1024).toFixed(1)} GB available. Delete video clips after exporting PDFs to save space.`;
    }
  } catch (e) {}
}
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// hook tab change
const _go = go;
go = function (v) { _go(v); if (v === "log") renderLog(); };
$$("nav button").forEach(b => b.onclick = () => go(b.dataset.v));

async function exportCSV() {
  const all = await allStudiesSorted();
  const cols = ["Case no", "Date", "Study ID", "GA", "Day of life", "Weight (kg)", "Indication", "Level", "Operator", "Supervisor", "Protocol", "Completeness", "LVO", "RVO", "LA:Ao", "FS", "RV function", "RVSP", "PDA", "Impression", "Clips"];
  const rows = [cols];
  for (const r of all) {
    const n = await DB.countStudy(r.id).catch(() => 0);
    const out = withStudy(r.S, () => { calc(); const f = S.f; return [r.caseNo, f.date, f.pid, f.ga, f.dol, f.wt, f.ind, f.level, f.op, f.rev, S.mode === "full" ? "Full" : "Beginner", completeness().text, R.LVO, R.RVO, R["LA:Ao"], R.FS, R["RV function"], R.RVSP, R.PDA, f.r_imp, n]; });
    rows.push(out);
  }
  calc();
  const csv = rows.map(r => r.map(v => `"${String(v == null ? "" : v).replace(/"/g, '""').replace(/\n/g, " ")}"`).join(",")).join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
  a.download = `TnECHO_logbook_${today()}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

/* ================= Media capture ================= */
let pendingStep = "";
function stepLabel(u) {
  if (!u) return "General";
  const [sid, id] = u.split("."); const sec = P.find(s => s.id === sid); if (!sec) return u;
  const st = sec.steps.find(x => x[0] === id); const short = sec.t.replace(/ \(.*\)/, "");
  return `${short} · ${BEG[u] ? BEG[u][0].split(/[—→:;]/)[0].trim() : (st ? st[3] : id)}`;
}
function pickMedia(step, kind) {
  pendingStep = step || "";
  if (!kind) { $("#sheetT").textContent = "Add clip — " + stepLabel(pendingStep); $("#sheet").classList.add("on"); return; }
  const inp = $(kind === "photo" ? "#inPhoto" : kind === "video" ? "#inVideo" : "#inUpload"); inp.value = ""; inp.click();
}
function closeSheet() { $("#sheet").classList.remove("on"); }
["#inPhoto", "#inVideo", "#inUpload"].forEach(sel => $(sel).addEventListener("change", async e => {
  const files = [...e.target.files]; if (!files.length) return;
  for (const f of files) { try { await addMedia(f, pendingStep); } catch (err) { toast("Couldn't add " + (f.name || "file")); } }
  refreshStepMedia(); toast(files.length > 1 ? `${files.length} files added` : "Added — tap the thumbnail to measure");
}));
function loadImage(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
function canvasFrom(img, maxSide) {
  const w = img.naturalWidth || img.videoWidth || img.width, h = img.naturalHeight || img.videoHeight || img.height;
  const k = maxSide ? Math.min(1, maxSide / Math.max(w, h)) : 1, c = document.createElement("canvas");
  c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); return c;
}
const toBlob = (c, q) => new Promise(r => c.toBlob(r, "image/jpeg", q || 0.9));
function videoPoster(blob) {
  return new Promise(res => {
    const v = document.createElement("video"), url = URL.createObjectURL(blob); let done = false;
    const fin = d => { if (done) return; done = true; URL.revokeObjectURL(url); res(d); };
    v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = url;
    v.addEventListener("loadeddata", () => { try { v.currentTime = Math.min(0.2, (v.duration || 1) / 2); } catch (e) { fin(null); } });
    v.addEventListener("seeked", () => { try { fin(canvasFrom(v, 480).toDataURL("image/jpeg", 0.75)); } catch (e) { fin(null); } });
    v.addEventListener("error", () => fin(null)); setTimeout(() => fin(null), 6000);
  });
}
async function addMedia(file, step) {
  const kind = (file.type || "").startsWith("video") ? "video" : "image";
  let blob = file, thumb = null;
  if (kind === "image") {
    const url = URL.createObjectURL(file); const img = await loadImage(url); URL.revokeObjectURL(url);
    const c = canvasFrom(img, 2400); blob = await toBlob(c, 0.92); thumb = canvasFrom(img, 360).toDataURL("image/jpeg", 0.75);
  } else {
    if (file.size > 150 * 1048576 && !confirm("This video is large (" + Math.round(file.size / 1048576) + " MB). Keep it?")) return;
    thumb = await videoPoster(file);
  }
  const rec = { id: uid("m"), studyId: S.id, step: step || "", kind, blob, thumb, cap: "", created: Date.now(), cal: {}, meas: [], inReport: true };
  await DB.put("media", rec); return rec;
}
const VIDICON = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 44"><rect width="64" height="44" fill="#123"/><path d="M26 14l14 8-14 8z" fill="#fff"/></svg>');
function thumbHTML(m, withLabel) {
  return `<div><button class="mth" onclick="openViewer('${m.id}')" title="${esc(stepLabel(m.step))}"><img src="${m.thumb || VIDICON}" alt="">${m.kind === "video" ? '<span class="vi">▶</span>' : ""}${m.meas && m.meas.length ? `<span class="ms">${m.meas.length}</span>` : ""}</button>${withLabel ? `<div class="ml">${esc(m.cap || stepLabel(m.step))}</div>` : ""}</div>`;
}
async function refreshStepMedia() {
  let media = []; try { media = await DB.byStudy(S.id); } catch (e) {}
  media.sort((a, b) => a.created - b.created);
  $$(".mthumbs").forEach(el => { el.innerHTML = media.filter(m => m.step === el.dataset.mu).map(m => thumbHTML(m)).join(""); });
  const g = $("#mgrid"); if (g) g.innerHTML = media.length ? media.map(m => thumbHTML(m, true)).join("") : '<p class="sub" style="grid-column:1/-1;margin:0">No clips yet. You can also add clips from each protocol step.</p>';
}

/* ================= Viewer & measurement tools ================= */
const FIELDS = [
  ["lvotd", "LVOT diameter", "mm"], ["rvotd", "RVOT / PV diameter", "mm"], ["la", "LA", "mm"], ["ao", "Ao root", "mm"], ["lvidd", "LVIDd", "mm"], ["lvids", "LVIDs", "mm"],
  ["pdad", "PDA diameter", "mm"], ["tapse", "TAPSE", "mm"], ["eid1", "EI D1", "mm"], ["eid2", "EI D2", "mm"],
  ["trv", "TR Vmax", "m/s"], ["pdav", "PDA peak velocity", "m/s"], ["pdaed", "PDA end-diastolic velocity", "m/s"], ["padv", "PI end-diastolic velocity", "m/s"],
  ["me", "Mitral E", "cm/s"], ["ma", "Mitral A", "cm/s"], ["ep", "Lateral e′", "cm/s"], ["psv", "Organ Doppler PSV", "cm/s"], ["edv", "Organ Doppler EDV", "cm/s"], ["mv", "Organ Doppler mean V", "cm/s"],
  ["paat", "PAAT", "ms"], ["rvet", "RVET", "ms"], ["lvti", "Aortic VTI", "cm"], ["rvti", "Pulmonary VTI", "cm"], ["rveda", "RV EDA", "cm²"], ["rvesa", "RV ESA", "cm²"], ["hr", "Heart rate", "bpm", 1]
].map(([k, l, u, study]) => ({ k, l, u, study: !!study }));
const AXES = { dist: { l: "Distance", u: "mm", dp: 1 }, vel: { l: "Velocity", u: "m/s", dp: 2 }, time: { l: "Time", u: "ms", dp: 0 } };
let VW = null;
function setField(k, val) {
  const f = FIELDS.find(x => x.k === k); if (!f) return;
  if (f.study) { S.f[k] = String(val); const el = document.querySelector(`[data-k="${k}"]`); if (el) el.value = val; }
  else { S.c[k] = String(val); const el = document.querySelector(`[data-c="${k}"]`); if (el) el.value = val; }
  save(); calc();
}
function convertTo(val, fromU, toU) {
  if (fromU === toU) return val;
  const t = { "m/s>cm/s": 100, "cm/s>m/s": 0.01, "cm>mm": 10, "mm>cm": 0.1, "s>ms": 1000, "ms>s": 0.001 }[fromU + ">" + toU];
  return t ? val * t : null;
}
const rnd = (v, dp) => Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp);
async function openViewer(id) {
  const rec = await DB.get("media", id); if (!rec) return;
  VW = { rec, mode: null, axis: "dist", pts: [], box: null, url: URL.createObjectURL(rec.blob) };
  $("#mvT").textContent = stepLabel(rec.step);
  $("#mv").classList.add("on"); document.body.style.overflow = "hidden";
  if (rec.kind === "video") return showVideo();
  await showImage();
}
function closeViewer() {
  if (VW && VW.url) URL.revokeObjectURL(VW.url);
  VW = null; $("#mv").classList.remove("on"); $("#mvStage").innerHTML = ""; document.body.style.overflow = ""; refreshStepMedia();
}
function stepOptions(sel) {
  const opts = ['<option value="">General (no step)</option>'];
  P.forEach(sec => leafIds(sec).forEach(u => opts.push(`<option value="${u}" ${u === sel ? "selected" : ""}>${esc(stepLabel(u))}</option>`)));
  return opts.join("");
}
function footHTML() {
  const r = VW.rec;
  return `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" ${r.inReport ? "checked" : ""} onchange="VW.rec.inReport=this.checked;saveRec()"> Include in PDF</label>
   <label style="display:flex;gap:6px;align-items:center">Image quality <select style="background:#1d2a35;color:#fff;border:1px solid #2e4050;border-radius:8px;padding:5px" onchange="VW.rec.q=this.value;saveRec()">${["", "Good", "Adequate", "Poor"].map(o => `<option ${o === (r.q || "") ? "selected" : ""} value="${o}">${o || "—"}</option>`).join("")}</select></label></div>
   <select style="margin-top:6px;width:100%;background:#1d2a35;color:#fff;border:1px solid #2e4050;border-radius:8px;padding:7px" onchange="VW.rec.step=this.value;saveRec();$('#mvT').textContent=stepLabel(this.value)">${stepOptions(r.step)}</select>
   <input type="text" placeholder="Caption (e.g. Day 3, large L→R PDA)" value="${esc(r.cap)}" oninput="VW.rec.cap=this.value;saveRec()">
   ${r.meas.length ? `<div style="margin-top:8px"><b>Measurements on this image</b>${r.meas.map((m, i) => `<div class="mrow"><span>${esc(m.label)}: <b>${m.value} ${m.unit}</b> <small style="color:#8aa">(${m.src})</small></span><button onclick="delMeas(${i})">✕</button></div>`).join("")}</div>` : ""}`;
}
let _sr; function saveRec() { clearTimeout(_sr); _sr = setTimeout(() => DB.put("media", VW.rec), 300); }
function delMeas(i) { VW.rec.meas.splice(i, 1); saveRec(); $("#mvFoot").innerHTML = footHTML(); draw(); }
function showVideo() {
  $("#mvTools").innerHTML = `<button onclick="grabFrame()">📸 Capture frame to measure</button><button class="dang" onclick="delMedia()">🗑 Delete</button>`;
  $("#mvHint").textContent = "Pause on the frame you want (e.g. end-diastole or the Doppler trace), then capture it as an image to measure.";
  $("#mvStage").innerHTML = `<video id="mvVid" src="${VW.url}" controls playsinline loop style="width:100%"></video>`;
  $("#mvFoot").innerHTML = footHTML();
}
async function grabFrame() {
  const v = $("#mvVid"); if (!v || !v.videoWidth) return toast("Video not ready yet");
  const c = canvasFrom(v); const blob = await toBlob(c, 0.92);
  const rec = { id: uid("m"), studyId: S.id, step: VW.rec.step, kind: "image", blob, thumb: canvasFrom(c, 360).toDataURL("image/jpeg", 0.75), cap: (VW.rec.cap ? VW.rec.cap + " — " : "") + "frame " + v.currentTime.toFixed(2) + " s", created: Date.now(), cal: {}, meas: [], inReport: true };
  await DB.put("media", rec); URL.revokeObjectURL(VW.url); toast("Frame captured"); openViewer(rec.id);
}
async function showImage() {
  const img = await loadImage(VW.url); VW.img = img;
  const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight; c.id = "mvCan";
  $("#mvStage").innerHTML = ""; $("#mvStage").appendChild(c); VW.c = c;
  $("#mvTools").innerHTML = `<select id="mvAxis" onchange="VW.axis=this.value;setMode(VW.mode)">${Object.entries(AXES).map(([k, a]) => `<option value="${k}" ${k === VW.axis ? "selected" : ""}>${a.l} (${a.u})</option>`).join("")}</select>
    <button data-m="cal" onclick="setMode('cal')">📐 Set scale</button><button data-m="meas" onclick="setMode('meas')">📏 Measure</button>
    <button data-m="box" onclick="setMode('box')">⬚ Select panel</button><button onclick="runOCR()">🔤 Read values</button>
    <button data-m="red" onclick="setMode('red')">⬛ Redact</button><button onclick="saveImage()">⬇ Save</button><button class="dang" onclick="delMedia()">🗑</button>`;
  $("#mvFoot").innerHTML = footHTML();
  bindCanvas(); setMode(null); draw();
}
function setMode(m) {
  VW.mode = m; VW.pts = []; $$("#mvTools button[data-m]").forEach(b => b.classList.toggle("on", b.dataset.m === m));
  const a = AXES[VW.axis], cal = VW.rec.cal[VW.axis];
  const H = {
    null: `Pick a tool. Scale: ${Object.keys(AXES).map(k => `${AXES[k].l} ${VW.rec.cal[k] ? "✓" : "—"}`).join(" · ")}. For machine measurements, use “Read values”.`,
    cal: VW.axis === "dist" ? "Set scale: tap two depth-scale ticks a known distance apart (e.g. 10 mm)." : VW.axis === "vel" ? "Set scale: tap the Doppler baseline (0), then a velocity-scale tick you can read." : "Set scale: tap two time markers a known interval apart.",
    meas: cal ? (VW.axis === "dist" ? "Measure: tap the two caliper points." : VW.axis === "vel" ? "Measure: tap the baseline, then the peak velocity." : "Measure: tap the start, then the end of the interval.") : `Set the ${a.l.toLowerCase()} scale first (📐).`,
    box: "Drag a box around the machine's measurement panel, then tap “Read values”.",
    red: "Drag a box over the patient's name/IC or other identifiers. It will be blacked out permanently."
  };
  $("#mvHint").textContent = H[m];
  draw();
}
function bindCanvas() {
  const c = VW.c;
  const pt = e => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * c.width / r.width, y: (e.clientY - r.top) * c.height / r.height }; };
  let drag = null;
  c.onpointerdown = e => {
    if (!VW.mode) return; const p = pt(e);
    if (VW.mode === "box" || VW.mode === "red") { drag = { x0: p.x, y0: p.y, x1: p.x, y1: p.y }; c.setPointerCapture(e.pointerId); return; }
    if (VW.mode === "meas" && !VW.rec.cal[VW.axis]) return;
    VW.pts.push(p); draw();
    if (VW.pts.length === 2) (VW.mode === "cal" ? finishCal : finishMeas)();
  };
  c.onpointermove = e => { if (!drag) return; const p = pt(e); drag.x1 = p.x; drag.y1 = p.y; VW.box = norm(drag); draw(); };
  c.onpointerup = () => { if (!drag) return; const b = norm(drag); drag = null; if (b.w < 6 || b.h < 6) { VW.box = null; draw(); return; } VW.box = b; draw(); if (VW.mode === "red") applyRedact(b); };
}
const norm = d => ({ x: Math.min(d.x0, d.x1), y: Math.min(d.y0, d.y1), w: Math.abs(d.x1 - d.x0), h: Math.abs(d.y1 - d.y0) });
function pixLen(a, b, axis) { return axis === "vel" ? Math.abs(b.y - a.y) : axis === "time" ? Math.abs(b.x - a.x) : Math.hypot(b.x - a.x, b.y - a.y); }
function finishCal() {
  const [a, b] = VW.pts, px = pixLen(a, b, VW.axis);
  const q = VW.axis === "dist" ? "Known distance between the two points (mm)?" : VW.axis === "vel" ? "Velocity at the second point, measured from the baseline (m/s)? e.g. 1.0" : "Time between the two points (ms)? e.g. 200";
  const v = parseFloat((prompt(q) || "").replace(",", "."));
  if (!(v > 0) || !(px > 2)) { toast("Scale not set"); setMode("cal"); return; }
  VW.rec.cal[VW.axis] = { k: v / px, a, b }; saveRec(); toast(`${AXES[VW.axis].l} scale set`); setMode("meas");
}
function finishMeas() {
  const [a, b] = VW.pts, ax = AXES[VW.axis], val = rnd(pixLen(a, b, VW.axis) * VW.rec.cal[VW.axis].k, ax.dp);
  assignDialog([{ label: ax.l, value: val, unit: ax.u, pts: [a, b], axis: VW.axis, src: "caliper" }], `Measured ${val} ${ax.u}`);
}
function fieldOptions(unit, pre) {
  const ok = FIELDS.filter(f => f.u === unit || convertTo(1, unit, f.u) != null);
  return `<option value="">— note only —</option>` + ok.map(f => `<option value="${f.k}" ${f.k === pre ? "selected" : ""}>${f.l} (${f.u})</option>`).join("");
}
/* shared dialog: rows = [{label,value,unit,field?,pts?,axis?,src}] */
function assignDialog(rows, title) {
  VW.pending = rows;
  $("#ocrBody").innerHTML = `<div class="sheet-t">${esc(title)}</div>
   <p class="sub" style="margin:0 0 8px">Check each value and choose where it goes. Ticked values are copied into the calculators and saved on this image.</p>
   <table class="ocrt"><tr><th></th><th>Read</th><th>Use for</th><th>Value</th></tr>
   ${rows.map((r, i) => `<tr><td><input type="checkbox" id="oc${i}" ${r.field || rows.length === 1 ? "checked" : ""}></td>
     <td>${esc(r.label)}<br><small>${r.value} ${esc(r.unit || "")}</small></td>
     <td><select id="of${i}" onchange="ocrConv(${i})">${fieldOptions(r.unit, r.field)}</select></td>
     <td><input type="number" step="any" id="ov${i}" value="${r.field ? fmtConv(r, r.field) : r.value}"></td></tr>`).join("")}
   </table>
   <div class="btns" style="margin-top:10px"><button class="btn" onclick="applyAssign()">Apply</button><button class="btn ghost" onclick="$('#ocrSheet').classList.remove('on');VW.pts=[];draw()">Cancel</button></div>`;
  $("#ocrSheet").classList.add("on");
}
function fmtConv(r, k) { const f = FIELDS.find(x => x.k === k); const v = convertTo(r.value, r.unit, f.u); return v == null ? r.value : rnd(v, f.u === "mm" || f.u === "cm" ? 1 : f.u === "m/s" ? 2 : f.u === "cm/s" ? 1 : 0); }
function ocrConv(i) { const r = VW.pending[i], k = $("#of" + i).value; $("#ov" + i).value = k ? fmtConv(r, k) : r.value; if (k) $("#oc" + i).checked = true; }
function applyAssign() {
  let n = 0;
  VW.pending.forEach((r, i) => {
    if (!$("#oc" + i).checked) return;
    const k = $("#of" + i).value, v = parseFloat($("#ov" + i).value); if (!isFinite(v)) return;
    const f = FIELDS.find(x => x.k === k);
    if (f) { setField(k, v); n++; }
    VW.rec.meas.push({ label: f ? f.l : r.label, value: v, unit: f ? f.u : r.unit, field: k || null, pts: r.pts || null, axis: r.axis || null, src: r.src });
  });
  saveRec(); $("#ocrSheet").classList.remove("on"); VW.pts = []; $("#mvFoot").innerHTML = footHTML(); draw();
  toast(n ? `${n} value${n > 1 ? "s" : ""} added to calculators` : "Saved on image");
}
function draw() {
  if (!VW || !VW.c) return; const c = VW.c, x = c.getContext("2d"), s = Math.max(1, c.width / 700);
  x.drawImage(VW.img, 0, 0);
  const line = (a, b, col, dash) => { x.save(); x.strokeStyle = col; x.lineWidth = 2.5 * s; x.setLineDash(dash ? [6 * s, 5 * s] : []); x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); x.restore(); [a, b].forEach(p => { x.fillStyle = col; x.beginPath(); x.arc(p.x, p.y, 4.5 * s, 0, 7); x.fill(); }); };
  const label = (p, t, col) => { x.font = `bold ${13 * s}px system-ui`; const w = x.measureText(t).width; x.fillStyle = "rgba(0,0,0,.7)"; x.fillRect(p.x + 6 * s, p.y - 16 * s, w + 8 * s, 19 * s); x.fillStyle = col; x.fillText(t, p.x + 10 * s, p.y - 2 * s); };
  const cal = VW.rec.cal[VW.axis]; if (cal && cal.a) line(cal.a, cal.b, "#ffd54f", true);
  VW.rec.meas.forEach(m => { if (m.pts) { line(m.pts[0], m.pts[1], "#69f0ae"); label(m.pts[1], `${m.label} ${m.value} ${m.unit}`, "#69f0ae"); } });
  VW.pts.forEach((p, i) => { x.fillStyle = "#4fc3f7"; x.beginPath(); x.arc(p.x, p.y, 5 * s, 0, 7); x.fill(); if (i) line(VW.pts[0], p, "#4fc3f7"); });
  if (VW.box && (VW.mode === "box" || VW.mode === "red")) { x.save(); x.strokeStyle = VW.mode === "red" ? "#ff5252" : "#4fc3f7"; x.lineWidth = 2 * s; x.setLineDash([6 * s, 4 * s]); x.strokeRect(VW.box.x, VW.box.y, VW.box.w, VW.box.h); x.restore(); }
}
async function applyRedact(b) {
  if (!confirm("Black out the selected area permanently?")) { VW.box = null; draw(); return; }
  const c = canvasFrom(VW.img); const x = c.getContext("2d"); x.fillStyle = "#000"; x.fillRect(b.x, b.y, b.w, b.h);
  VW.rec.blob = await toBlob(c, 0.92); VW.rec.thumb = canvasFrom(c, 360).toDataURL("image/jpeg", 0.75); VW.rec.redacted = true;
  await DB.put("media", VW.rec); URL.revokeObjectURL(VW.url); VW.url = URL.createObjectURL(VW.rec.blob); VW.box = null;
  VW.img = await loadImage(VW.url); draw(); toast("Area redacted");
}
function saveImage() {
  const c = document.createElement("canvas"); c.width = VW.c.width; c.height = VW.c.height; c.getContext("2d").drawImage(VW.c, 0, 0);
  c.toBlob(b => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `TnECHO_${(S.f.pid || "study").replace(/\W+/g, "_")}_${VW.rec.id}.jpg`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500); }, "image/jpeg", 0.92);
}
async function delMedia() {
  if (!confirm("Delete this clip/image?")) return;
  await DB.del("media", VW.rec.id); closeViewer(); toast("Deleted");
}

/* ================= OCR of machine measurement panels ================= */
let _tess = null;
function loadScript(src) { return new Promise((res, rej) => { if (document.querySelector(`script[src="${src}"]`)) return res(); const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
async function getWorker() {
  if (_tess) return _tess;
  await loadScript("vendor/tesseract/tesseract.min.js");
  _tess = await Tesseract.createWorker("eng", 1, {
    workerPath: "vendor/tesseract/worker.min.js", corePath: "vendor/tesseract/core", langPath: "vendor/tesseract/lang", gzip: true,
    logger: m => { if (VW && m.status) $("#mvHint").textContent = `Reading values… ${m.status} ${m.progress ? Math.round(m.progress * 100) + "%" : ""}`; }
  });
  await _tess.setParameters({ preserve_interword_spaces: "1" });
  return _tess;
}
function prepForOCR() {
  const b = VW.box || { x: 0, y: 0, w: VW.img.naturalWidth, h: VW.img.naturalHeight };
  const k = Math.max(1, Math.min(3, 1400 / b.w));
  const c = document.createElement("canvas"); c.width = Math.round(b.w * k); c.height = Math.round(b.h * k);
  const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(VW.img, b.x, b.y, b.w, b.h, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data; let sum = 0;
  for (let i = 0; i < p.length; i += 4) { const g = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]; p[i] = p[i + 1] = p[i + 2] = g; sum += g; }
  const inv = sum / (p.length / 4) < 128; // echo screens: light text on dark background
  for (let i = 0; i < p.length; i += 4) { let g = p[i]; if (inv) g = 255 - g; g = g < 150 ? Math.max(0, g - 60) : Math.min(255, g + 60); p[i] = p[i + 1] = p[i + 2] = g; }
  x.putImageData(d, 0, 0); return c;
}
const OCRMAP = [
  [/^(lvot|av|ao|aortic)\s*vti/i, "lvti"], [/^(pv|rvot|pa|mpa|pulm\w*)\s*vti/i, "rvti"], [/^vti/i, "lvti"],
  [/^lvid\s*d|^lvedd|^lvidd|^lvdd/i, "lvidd"], [/^lvid\s*s|^lvesd|^lvids|^lvsd/i, "lvids"],
  [/^lvot/i, "lvotd"], [/^(rvot|pv\s*ann|pv\s*diam|pa\s*diam|pv)/i, "rvotd"],
  [/^tr\s*(v\s*max|vmax|max|vel|peak|v)/i, "trv"], [/^tapse/i, "tapse"],
  [/^(paat|pa\s*at|pa\s*acct|acct|act|at)\b/i, "paat"], [/^(rvet|et)\b/i, "rvet"],
  [/^(mv\s*)?e['′`]|^(lat|lateral)\s*e|^e\s*prime/i, "ep"], [/^(mv\s*e|e\s*vel|e\s*wave|e)\b/i, "me"], [/^(mv\s*a|a\s*vel|a\s*wave|a)\b/i, "ma"],
  [/^pda\s*(v|vel|vmax|max|peak)/i, "pdav"], [/^pda/i, "pdad"],
  [/^(la\s*\/\s*ao|la\s*:\s*ao)/i, null], [/^(ao\s*root|aor|ao\s*diam|ao)\b/i, "ao"], [/^(la\s*diam|la\s*dim|la)\b/i, "la"],
  [/^(hr|heart\s*rate)\b/i, "hr"], [/^(psv|vs|ps)\b/i, "psv"], [/^(edv|ved|vd|ed)\b/i, "edv"], [/^(fs|%fs|ef|lvef)\b/i, null]
];
function guessUnit(field, val, unit) {
  if (unit) return unit.replace("cm2", "cm²").toLowerCase().replace("cm²", "cm²");
  const f = FIELDS.find(x => x.k === field); if (!f) return "";
  if (f.u === "mm") return val < 5 ? "cm" : "mm";
  if (f.u === "m/s") return val > 10 ? "cm/s" : "m/s";
  if (f.u === "cm/s") return val < 3 ? "m/s" : "cm/s";
  if (f.u === "ms") return val < 2 ? "s" : "ms";
  return f.u;
}
function parseOCR(text) {
  const out = [], seen = new Set();
  const re = /([A-Za-z%][A-Za-z0-9'′`%\/:. ]{0,16}?)\s*[:=]?\s*(-?\d{1,4}(?:[.,]\d{1,3})?)\s*(mm|cm\/s|m\/s|cm2|cm²|cm|ms|s|bpm|%)?(?![\w])/g;
  text.split(/\n/).forEach(line => {
    line = line.replace(/[|]/g, " ").replace(/\s{2,}/g, "  ");
    let m; re.lastIndex = 0;
    while ((m = re.exec(line))) {
      const label = m[1].trim().replace(/[.:]+$/, ""), val = parseFloat(m[2].replace(",", ".")), unitRaw = m[3] || "";
      if (!label || !isFinite(val)) continue;
      const hit = OCRMAP.find(([r]) => r.test(label));
      if (!hit && !unitRaw) continue;
      const field = hit ? hit[1] : null;
      const unit = field ? guessUnit(field, val, unitRaw) : (unitRaw || "");
      const key = label.toLowerCase() + val; if (seen.has(key)) continue; seen.add(key);
      const fo = field && FIELDS.find(f => f.k === field);
      const ok = fo && (fo.u === unit || convertTo(1, unit, fo.u) != null);
      out.push({ label, value: val, unit, field: ok ? field : null, src: "OCR" });
    }
  });
  return out;
}
async function runOCR() {
  if (!VW || !VW.img) return;
  $("#mvHint").textContent = "Loading text recognition (first use downloads ~10 MB, then works offline)…";
  try {
    const w = await getWorker(); const { data } = await w.recognize(prepForOCR());
    const rows = parseOCR(data.text || "");
    if (!rows.length) { $("#mvHint").textContent = "No measurement values recognised. Try “Select panel” around the measurement box, or use 📏 Measure."; return; }
    $("#mvHint").textContent = `Found ${rows.length} value${rows.length > 1 ? "s" : ""} — please check them.`;
    assignDialog(rows, "Values read from the image");
  } catch (e) { $("#mvHint").textContent = "Text recognition failed: " + (e && e.message || e); }
}

/* ================= PDF logbook report ================= */
const pdfSafe = t => String(t).replace(/→/g, "->").replace(/←/g, "<-").replace(/≥/g, ">=").replace(/≤/g, "<=").replace(/²/g, "2").replace(/[′’‘]/g, "'").replace(/[“”]/g, '"')
  .replace(/⅓/g, "1/3").replace(/⅔/g, "2/3").replace(/×/g, "x").replace(/÷/g, "/").replace(/≈/g, "~").replace(/−/g, "-").replace(/≡/g, "=").replace(/[▲▼✓⚠💡📷]/g, "").replace(/[^\x00-\xFF–—•…]/g, "");
async function annotatedDataURL(m) {
  const url = URL.createObjectURL(m.blob);
  try {
    const img = await loadImage(url); const c = canvasFrom(img); const x = c.getContext("2d"), s = Math.max(1, c.width / 700);
    (m.meas || []).forEach(q => { if (!q.pts) return; const [a, b] = q.pts;
      x.strokeStyle = "#69f0ae"; x.lineWidth = 2.5 * s; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
      [a, b].forEach(p => { x.fillStyle = "#69f0ae"; x.beginPath(); x.arc(p.x, p.y, 4.5 * s, 0, 7); x.fill(); });
      const t = `${q.label} ${q.value} ${q.unit}`; x.font = `bold ${13 * s}px sans-serif`; const w = x.measureText(t).width;
      x.fillStyle = "rgba(0,0,0,.7)"; x.fillRect(b.x + 6 * s, b.y - 16 * s, w + 8 * s, 19 * s); x.fillStyle = "#69f0ae"; x.fillText(t, b.x + 10 * s, b.y - 2 * s); });
    return canvasFrom(c, 1100).toDataURL("image/jpeg", 0.82);
  } finally { URL.revokeObjectURL(url); }
}
async function blobToDataURL(blob, maxSide) {
  const url = URL.createObjectURL(blob); try { const img = await loadImage(url); return canvasFrom(img, maxSide || 1100).toDataURL("image/jpeg", 0.82); } finally { URL.revokeObjectURL(url); }
}
async function iconData() { try { const img = await loadImage("icon-192.png"); return canvasFrom(img, 192).toDataURL("image/png"); } catch (e) { return null; } }
async function downloadPDF(studyId) {
  if (!window.jspdf) { await loadScript("vendor/jspdf.umd.min.js").catch(() => {}); }
  if (!window.jspdf) return toast("PDF library not loaded");
  toast("Building PDF…");
  await persistStudy(true);
  const rec = studyId ? await DB.get("studies", studyId) : { id: S.id, S };
  const St = rec.S, caseNo = await caseNoFor(rec.id);
  const text = withStudy(St, () => { calc(); return reportText(); }); calc();
  const media = (await DB.byStudy(rec.id)).filter(m => m.inReport).sort((a, b) => a.created - b.created);
  const { jsPDF } = window.jspdf; const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 15, CW = W - 2 * M; let y = 0;
  const icon = await iconData();
  const header = () => {
    doc.setFillColor(11, 16, 51); doc.rect(0, 0, W, 22, "F");
    if (icon) doc.addImage(icon, "PNG", M, 4, 14, 14);
    doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.text("TnECHO Study Report", M + 18, 11);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text(`Targeted neonatal echocardiography · Logbook case ${caseNo}`, M + 18, 16.5);
    doc.setTextColor(20); y = 30;
  };
  const need = h => { if (y + h > 280) { doc.addPage(); header(); } };
  header();
  const lines = pdfSafe(text).split("\n").slice(2);
  lines.forEach(l => {
    if (/^=+$/.test(l)) return;
    if (!l.trim()) { y += 2; return; }
    const isHead = /^[A-Z0-9 ()&:\-\/]+$/.test(l) && l.length < 60 && !/: /.test(l);
    if (isHead) { need(10); y += 2; doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(15, 61, 94); doc.text(l, M, y); doc.setDrawColor(200); doc.line(M, y + 1.2, M + CW, y + 1.2); y += 6; doc.setTextColor(20); return; }
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
    const parts = doc.splitTextToSize(l, CW); need(parts.length * 4.4);
    const m = /^([^:]{2,28}): (.*)$/.exec(l);
    if (m && parts.length === 1) { doc.setFont("helvetica", "bold"); doc.text(m[1] + ":", M, y); const w = doc.getTextWidth(m[1] + ": "); doc.setFont("helvetica", "normal"); doc.text(m[2], M + w, y); y += 4.4; }
    else { doc.text(parts, M, y); y += parts.length * 4.4; }
  });
  if (media.length) {
    need(14); y += 3; doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(15, 61, 94); doc.text("IMAGES & CLIPS", M, y); doc.line(M, y + 1.2, M + CW, y + 1.2); y += 6; doc.setTextColor(20);
    const colW = (CW - 6) / 2; let col = 0, rowH = 0;
    for (const m of media) {
      let data = null; try { data = m.kind === "image" ? await annotatedDataURL(m) : m.thumb; } catch (e) {}
      if (!data) continue;
      const im = await loadImage(data); let h = colW * im.height / im.width; if (h > 70) h = 70; const w = h * im.width / im.height;
      const capLines = doc.splitTextToSize(pdfSafe(`${m.kind === "video" ? "[Video still] " : ""}${stepLabel(m.step)}${m.cap ? " — " + m.cap : ""}${m.meas.length ? " | " + m.meas.map(q => `${q.label} ${q.value} ${q.unit}`).join("; ") : ""}`), colW);
      const blockH = h + 2 + capLines.length * 3.4 + 4;
      if (col === 0) { need(blockH); rowH = 0; }
      const x0 = M + col * (colW + 6);
      doc.addImage(data, "JPEG", x0, y, w, h); doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(70); doc.text(capLines, x0, y + h + 3.5); doc.setTextColor(20);
      rowH = Math.max(rowH, blockH);
      if (col === 1) { y += rowH; col = 0; } else col = 1;
    }
    if (col === 1) y += rowH;
  }
  // supervisor review
  const rv = St.review;
  if (rv && (rv.feedback || rv.quality || rv.meas)) {
    need(20); y += 3; doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(15, 61, 94); doc.text("SUPERVISOR REVIEW", M, y); doc.line(M, y + 1.2, M + CW, y + 1.2); y += 6; doc.setTextColor(20);
    doc.setFontSize(9.5); doc.setFont("helvetica", "normal");
    const rl = [["Image quality", rv.quality], ["Views acquired", rv.views], ["Measurement accuracy", rv.meas], ["Interpretation", rv.interp]].filter(x => x[1]).map(x => `${x[0]}: ${x[1]}`).join("   ·   ");
    if (rl) { const ls = doc.splitTextToSize(pdfSafe(rl), CW); doc.text(ls, M, y); y += ls.length * 4.4; }
    if (rv.feedback) { const ls = doc.splitTextToSize(pdfSafe("Feedback: " + rv.feedback), CW); need(ls.length * 4.4); doc.text(ls, M, y); y += ls.length * 4.4; }
  }
  // sign-off
  need(46); y += 4;
  doc.setDrawColor(150); doc.roundedRect(M, y, CW, 38, 2, 2);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(15, 61, 94); doc.text("Logbook sign-off", M + 4, y + 6); doc.setTextColor(20);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  const f = St.f, row = (lab, val, yy, x) => { doc.text(lab, x, yy); doc.setDrawColor(180); doc.line(x + 30, yy + 0.8, x + 85, yy + 0.8); if (val) doc.text(pdfSafe(val).slice(0, 34), x + 31, yy); };
  row("Performed by:", f.op, y + 14, M + 4); row("Level:", f.level, y + 14, M + 94);
  row("Supervisor:", f.rev, y + 22, M + 4); row("Date:", f.date, y + 22, M + 94);
  row("Trainee signature:", "", y + 31, M + 4); row("Supervisor sign.:", "", y + 31, M + 94);
  if (rv && rv.signed && rv.sig) { try { doc.addImage(rv.sig, "PNG", M + 125, y + 22, 34, 10); } catch (e) {} doc.setFontSize(7.5); doc.setTextColor(17, 99, 63); doc.text(pdfSafe(`Signed off by ${rv.name || ""} on ${rv.date || ""}`), M + 94, y + 36); doc.setTextColor(20); }
  // footers
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(120);
    doc.text(pdfSafe(`TnECHO v${APP_VERSION} · Case ${caseNo} · ${f.pid || ""} · generated ${new Date().toLocaleString()} · Educational/logbook record — verify all values.`), M, 290);
    doc.text(`Page ${i} of ${n}`, W - M, 290, { align: "right" }); }
  doc.save(`TnECHO_Case${caseNo}_${(f.pid || "study").replace(/\W+/g, "_")}_${f.date || today()}.pdf`);
}

/* ================= init ================= */
refreshStepMedia();
addEventListener("pagehide", () => persistStudy(true));
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") persistStudy(true); });
