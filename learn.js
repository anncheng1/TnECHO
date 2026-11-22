/* TnECHO curriculum, trainee progress store and Learn section. */
"use strict";

/* ===== Trainee store (separate from studies; this device only) ===== */
const TKEY = "tnecho_trainee";
function trainee() {
  let T = null; try { T = JSON.parse(localStorage.getItem(TKEY) || "null"); } catch (e) {}
  T = T || {};
  for (const k of ["profile", "studied", "atlas", "probe", "quiz", "cases", "signoff"]) T[k] = T[k] || {};
  T.drills = T.drills || [];
  return T;
}
function saveTrainee(T) { try { localStorage.setItem(TKEY, JSON.stringify(T)); } catch (e) { toast("Couldn't save progress (storage full?)"); } }
function markTrainee(fn) { const T = trainee(); fn(T); saveTrainee(T); return T; }

/* ===== Suggested targets — edit to match your training programme ===== */
const TARGETS = {
  L1: { topics: ["windows", "artefacts"], atlasViews: 6, quiz: 80 },
  L2: { topics: ["w_sub", "w_api", "w_plax", "w_psax", "w_highps", "w_ductal", "w_arch", "w_ssn"], topicsMin: 6, probeViews: 6, scans: 10, viewAcq: 5, quiz: 80 },
  L3: { topics: ["fs", "simpson", "laao", "lvo", "rvo", "tapse", "rvfac", "tr", "paat", "ei", "pdad", "pdadop", "mitral", "dao"], topicsMin: 8, drillTypes: 6, measScans: 10, measPerScan: 3, quiz: 80 },
  L4: { topics: ["pdagrade", "pphn", "pfo", "ivc", "organ", "effusion"], topicsMin: 4, cases: 4, signedScans: 5, quiz: 80 }
};
const LEVELS = [
  { k: "L1", n: 1, t: "Foundation", focus: "Ultrasound physics, anatomy, orientation", comp: "Recognise cardiac structures", icon: "🧭" },
  { k: "L2", n: 2, t: "Image acquisition", focus: "Standard views, probe handling, Doppler", comp: "Obtain reproducible views", icon: "🎯" },
  { k: "L3", n: 3, t: "Measurement", focus: "LV/RV function, PDA, output, PA pressure", comp: "Perform accurate measurements", icon: "📏" },
  { k: "L4", n: 4, t: "Clinical integration", focus: "Haemodynamics and case interpretation", comp: "Formulate a physiological assessment", icon: "🧠" }
];

/* ===== Study-derived statistics (async) ===== */
let STATS = null;
async function computeStats() {
  let studies = [], media = [];
  try { studies = await DB.all("studies"); } catch (e) {}
  try { media = await DB.all("media"); } catch (e) {}
  const views = {}; P.forEach(sec => views[sec.id] = 0);
  let measScans = 0, signed = 0, sup = 0, ind = 0, obs = 0, rev = 0;
  const perStudy = studies.map(r => {
    const St = r.S; const acq = [];
    withStudy(St, () => { visSecs().forEach(sec => { const ids = leafIds(sec); if (ids.length && ids.every(u => St.chk[u] || St.na[u]) && ids.some(u => St.chk[u])) acq.push(sec.id); }); });
    acq.forEach(v => views[v]++);
    const nMeas = Object.values(St.c || {}).filter(v => v !== "" && v != null).length;
    if (nMeas >= TARGETS.L3.measPerScan) measScans++;
    const lv = (St.f || {}).level || "";
    if (lv === "Performed – supervised") sup++; else if (lv === "Performed – independent") ind++; else if (lv === "Observed") obs++; else if (lv === "Reported / reviewed") rev++;
    const isSigned = !!(St.review && St.review.signed); if (isSigned) signed++;
    return { id: r.id, acq: acq.length, nMeas, signed: isSigned };
  });
  const q = media.filter(m => m.q); const qc = { Good: 0, Adequate: 0, Poor: 0 }; q.forEach(m => qc[m.q] = (qc[m.q] || 0) + 1);
  const coreViews = P.filter(sec => sec.steps.some(st => BEG[sec.id + "." + st[0]])).map(s => s.id);
  STATS = { n: studies.length, views, coreViews, measScans, signed, sup, ind, obs, rev, perStudy, quality: qc, rated: q.length, clips: media.length,
    scansWithViews: perStudy.filter(p => p.acq >= 1).length };
  return STATS;
}

/* ===== Level criteria ===== */
function criteria(k, T, St) {
  const t = TARGETS[k], st = St || { n: 0, views: {}, coreViews: [], measScans: 0, signed: 0 };
  const studiedN = (t.topics || []).filter(id => T.studied[id]).length;
  const quiz = T.quiz[k] || {};
  const c = [];
  const add = (label, have, need, act) => c.push({ label, have, need, ok: have >= need, act });
  if (k === "L1") {
    add("Study: echo windows & artefacts", studiedN, t.topics.length, "topics");
    add(`Explore ${t.atlasViews} Atlas views (tap the structures)`, Object.keys(T.atlas).length, t.atlasViews, "atlas");
  }
  if (k === "L2") {
    add(`Study ${t.topicsMin} probe-position topics`, studiedN, t.topicsMin, "topics");
    add(`Watch probe movement for ${t.probeViews} views`, Object.keys(T.probe).length, t.probeViews, "atlas");
    add(`Log ${t.scans} scans`, st.n, t.scans, "scan");
    const minView = st.coreViews.length ? Math.min(...st.coreViews.map(v => st.views[v] || 0)) : 0;
    add(`Acquire every core view ${t.viewAcq}×`, minView, t.viewAcq, "scan");
  }
  if (k === "L3") {
    add(`Study ${t.topicsMin} measurement topics`, studiedN, t.topicsMin, "topics");
    const types = new Set(T.drills.filter(d => d.ok).map(d => d.type)); add(`Pass all ${t.drillTypes} measurement drills`, types.size, t.drillTypes, "lab");
    add(`${t.measScans} scans with ≥ ${t.measPerScan} measurements`, st.measScans, t.measScans, "scan");
  }
  if (k === "L4") {
    add(`Study ${t.topicsMin} interpretation topics`, studiedN, t.topicsMin, "topics");
    add(`Complete ${t.cases} Case Lab cases`, Object.values(T.cases).filter(x => x.done).length, t.cases, "case");
    add(`${t.signedScans} scans reviewed & signed by supervisor`, st.signed, t.signedScans, "portfolio");
  }
  add(`Level ${k[1]} quiz ≥ ${t.quiz}%`, quiz.best || 0, t.quiz, "quiz");
  return c;
}
function levelProgress(k, T, St) { const c = criteria(k, T, St); return { c, done: c.filter(x => x.ok).length, tot: c.length }; }

/* ===== Learn page ===== */
const ACT = { topics: "📖 Study", atlas: "🖼 Atlas", scan: "🫀 Scan", lab: "📏 Practise", case: "🧩 Case Lab", portfolio: "👤 Portfolio", quiz: "✅ Take quiz" };
function actGo(a, k) {
  if (a === "topics") { const ids = TARGETS[k].topics; tcat = "All"; $("#tsearch").value = ""; go("train"); TOPIC_FILTER = ids; renderTrain(); return; }
  if (a === "atlas") return go("atlas"); if (a === "scan") return go("protocol"); if (a === "lab") return go("measure");
  if (a === "case") return go("case"); if (a === "portfolio") return go("portfolio"); if (a === "quiz") { go("assess"); startLevelQuiz(k); }
}
let TOPIC_FILTER = null;
async function renderLearn() {
  const T = trainee(); let seen = false; try { seen = localStorage.getItem("tnecho_welcome") === "1"; } catch (e) {}
  const draw = St => {
    $("#learnBody").innerHTML = `
    ${seen ? "" : `<div class="card welcome" id="welcome"><h2>👋 Welcome to TnECHO</h2>
      <p class="sub">A structured path from your first view to a full haemodynamic assessment.</p>
      <ol class="flow"><li><b>Learn & explore</b><span>Lessons and the Echo Atlas — tap structures, watch the probe move</span></li>
      <li><b>Practise</b><span>Measurement drills with instant feedback, Case Lab and quizzes</span></li>
      <li><b>Scan & log</b><span>Tap ▶ Scan at the top at the bedside; each scan goes into My Portfolio for supervisor sign-off</span></li></ol>
      <button class="btn" onclick="dismissWelcome();renderLearn()">Got it</button></div>`}
    <h3 class="grp">Your training path</h3>
    ${LEVELS.map(L => { const p = levelProgress(L.k, T, St), so = T.signoff[L.k], pct = Math.round(p.done / p.tot * 100);
      return `<details class="card lvl ${so ? "signed" : ""}" ${(!so && p.done < p.tot && !LEVELS.slice(0, L.n - 1).some(x => !T.signoff[x.k] && levelProgress(x.k, T, St).done < levelProgress(x.k, T, St).tot)) ? "open" : ""}>
        <summary><span class="lic">${L.icon}</span><span class="lt"><small>Level ${L.n}</small><b>${L.t}</b><span class="lbar"><i style="width:${pct}%"></i></span></span><span class="lst">${so ? "✓ Signed off" : `${p.done}/${p.tot}`}</span></summary>
        <div class="lbody"><div class="lfc"><div><small>Training focus</small>${L.focus}</div><div><small>Expected competency</small>${L.comp}</div></div>
         <ul class="crit">${p.c.map(c => `<li class="${c.ok ? "ok" : ""}"><span>${c.ok ? "✓" : "○"}</span><div>${c.label}<small>${c.act === "quiz" ? (c.have ? `best ${c.have}%` : "not taken") : `${Math.min(c.have, c.need)} / ${c.need}`}</small></div><button onclick="actGo('${c.act}','${L.k}')">${ACT[c.act]}</button></li>`).join("")}</ul>
         <div class="ltopics">${TARGETS[L.k].topics.map(id => { const t = TRAIN.find(x => x.id === id); return t ? `<button class="${T.studied[id] ? "done" : ""}" onclick="openTrain('${id}')">${T.studied[id] ? "✓ " : ""}${short(t)}</button>` : ""; }).join("")}</div>
         ${so ? `<p class="sub" style="margin-top:8px">Signed off by <b>${esc(so.name)}</b> on ${esc(so.date)}.</p>` : `<button class="btn ghost" style="margin-top:8px" onclick="levelSignoff('${L.k}')">✍ Supervisor sign-off</button>`}
        </div></details>`; }).join("")}
    <div class="card"><h2>📚 Lesson library</h2><p class="sub">${TRAIN.length} topics with annotated images from the ASE 2024 guideline and the NPE Teaching Manual. ${Object.keys(T.studied).length} studied.</p>
      <div class="btns"><button class="btn" onclick="TOPIC_FILTER=null;go('train')">Browse all topics</button><button class="btn ghost" onclick="go('approach')">Approach to haemodynamics</button></div></div>
    <p class="sub" style="font-size:11.5px">Targets are suggestions — your supervisor or programme can change them in <code>learn.js</code> (TARGETS).</p>`;
  };
  draw(STATS); draw(await computeStats());
}
function dismissWelcome() { try { localStorage.setItem("tnecho_welcome", "1"); } catch (e) {} const w = $("#welcome"); if (w) w.style.display = "none"; }
