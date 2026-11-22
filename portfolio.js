/* TnECHO My Portfolio — trainee profile, competency dashboard, supervisor review & sign-off, portfolio PDF. */
"use strict";

/* ===== signature pad ===== */
function sigPadHTML(id) { return `<div class="sigwrap"><canvas id="${id}" width="600" height="170"></canvas><button class="btn ghost" type="button" onclick="clearSig('${id}')">Clear</button></div>`; }
function bindSig(id) {
  const c = document.getElementById(id), x = c.getContext("2d"); x.lineWidth = 2.6; x.lineCap = "round"; x.strokeStyle = "#0b1033"; let on = false; c._dirty = false;
  const p = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
  c.onpointerdown = e => { on = true; c.setPointerCapture(e.pointerId); const [a, b] = p(e); x.beginPath(); x.moveTo(a, b); };
  c.onpointermove = e => { if (!on) return; const [a, b] = p(e); x.lineTo(a, b); x.stroke(); c._dirty = true; };
  c.onpointerup = () => on = false;
}
function clearSig(id) { const c = document.getElementById(id); c.getContext("2d").clearRect(0, 0, c.width, c.height); c._dirty = false; }
function sigData(id) { const c = document.getElementById(id); return c && c._dirty ? c.toDataURL("image/png") : null; }
function openForm(html, onSave) {
  $("#ocrBody").innerHTML = html + `<div class="btns" style="margin-top:12px"><button class="btn" id="fSave">Save</button><button class="btn ghost" onclick="$('#ocrSheet').classList.remove('on')">Cancel</button></div>`;
  $("#ocrSheet").classList.add("on"); $("#fSave").onclick = () => { if (onSave() !== false) $("#ocrSheet").classList.remove("on"); };
}

/* ===== level sign-off ===== */
function levelSignoff(k) {
  const T = trainee(), L = LEVELS.find(l => l.k === k), p = levelProgress(k, T, STATS);
  openForm(`<div class="sheet-t">Supervisor sign-off — Level ${L.n}: ${L.t}</div>
   <p class="sub">Expected competency: <b>${L.comp}</b>. Criteria met: ${p.done}/${p.tot}.${p.done < p.tot ? " ⚠ Not all suggested criteria are met — sign only if you are satisfied the trainee is competent." : ""}</p>
   <label class="f">Supervisor name<input id="soName" value="${esc(T.profile.supervisor || "")}"></label>
   <label class="f" style="margin-top:8px">Comment<textarea id="soCom" placeholder="Strengths, areas to develop"></textarea></label>
   <p class="sub" style="margin:8px 0 4px">Signature</p>${sigPadHTML("soSig")}`, () => {
    const name = $("#soName").value.trim(); if (!name) { toast("Enter the supervisor's name"); return false; }
    markTrainee(T => T.signoff[k] = { name, comment: $("#soCom").value.trim(), sig: sigData("soSig"), date: today(), met: `${p.done}/${p.tot}` });
    toast(`Level ${L.n} signed off`); renderLearn(); if ($("#v-portfolio").classList.contains("on")) renderPortfolio(); });
  bindSig("soSig");
}
function revokeSignoff(k) { if (!confirm("Remove this sign-off?")) return; markTrainee(T => delete T.signoff[k]); renderPortfolio(); }

/* ===== per-study supervisor review ===== */
async function reviewStudy(id) {
  const r = await DB.get("studies", id); if (!r) return; const St = r.S, rv = St.review || {}, T = trainee();
  const opt = (name, opts, v) => `<select id="${name}">${["", ...opts].map(o => `<option ${o === v ? "selected" : ""}>${o}</option>`).join("")}</select>`;
  openForm(`<div class="sheet-t">Supervisor review — ${esc(St.f.pid || "study")} (${esc(St.f.date || "")})</div>
   <div class="grid" style="grid-template-columns:1fr 1fr">
    <label class="f">Image quality${opt("rvQ", ["Good", "Adequate", "Poor"], rv.quality)}</label>
    <label class="f">Views acquired${opt("rvV", ["All required", "Most", "Some", "Few"], rv.views)}</label>
    <label class="f">Measurement accuracy${opt("rvM", ["Competent", "Minor corrections", "Needs practice"], rv.meas)}</label>
    <label class="f">Interpretation${opt("rvI", ["Competent", "Developing", "Not assessed"], rv.interp)}</label>
    <label class="f">Level of involvement${opt("rvL", ["Observed", "Performed – supervised", "Performed – independent", "Reported / reviewed"], St.f.level)}</label>
    <label class="f">Supervisor${`<input id="rvN" value="${esc(rv.name || St.f.rev || T.profile.supervisor || "")}">`}</label></div>
   <label class="f" style="margin-top:8px">Feedback<textarea id="rvF" placeholder="What went well, what to improve">${esc(rv.feedback || "")}</textarea></label>
   <label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="rvS" ${rv.signed ? "checked" : ""} style="width:20px;height:20px"> I have reviewed this study and sign it off</label>
   <p class="sub" style="margin:8px 0 4px">Signature ${rv.sig ? "(saved — draw again to replace)" : ""}</p>${sigPadHTML("rvSig")}`, () => {
    const name = $("#rvN").value.trim(); const signed = $("#rvS").checked; if (signed && !name) { toast("Enter the supervisor's name"); return false; }
    St.review = { quality: $("#rvQ").value, views: $("#rvV").value, meas: $("#rvM").value, interp: $("#rvI").value, feedback: $("#rvF").value.trim(), name, signed, sig: sigData("rvSig") || rv.sig || null, date: today() };
    if ($("#rvL").value) St.f.level = $("#rvL").value; if (name) St.f.rev = name;
    const save2 = id === S.id ? (S.review = St.review, S.f.level = St.f.level, S.f.rev = St.f.rev, save(), persistStudy(true)) : DB.put("studies", { id, updated: Date.now(), S: St });
    Promise.resolve(save2).then(() => { toast(signed ? "Study signed off" : "Review saved"); renderPortfolio(); });
  });
  bindSig("rvSig");
}

/* ===== profile ===== */
function editProfile() {
  const p = trainee().profile;
  openForm(`<div class="sheet-t">Trainee profile</div><div class="grid" style="grid-template-columns:1fr 1fr">
   <label class="f">Name<input id="pfN" value="${esc(p.name || "")}"></label><label class="f">Grade / post<input id="pfG" value="${esc(p.grade || "")}" placeholder="e.g. Neonatal trainee"></label>
   <label class="f">Hospital<input id="pfH" value="${esc(p.hospital || "")}"></label><label class="f">Supervisor<input id="pfS" value="${esc(p.supervisor || "")}"></label>
   <label class="f">Training start<input id="pfD" type="date" value="${esc(p.start || "")}"></label></div>`, () => {
    markTrainee(T => T.profile = { name: $("#pfN").value.trim(), grade: $("#pfG").value.trim(), hospital: $("#pfH").value.trim(), supervisor: $("#pfS").value.trim(), start: $("#pfD").value });
    renderPortfolio(); });
}

/* ===== dashboard ===== */
async function renderPortfolio() {
  const T = trainee(), St = await computeStats(), p = T.profile, f = S.f, c = completeness(), pct = c.tot ? Math.round(c.done / c.tot * 100) : 0;
  const drills = T.drills, dOk = drills.filter(d => d.ok).length, types = new Set(drills.filter(d => d.ok).map(d => d.type)).size;
  const avgErr = drills.length ? (drills.slice(-20).reduce((a, d) => a + d.err, 0) / Math.min(20, drills.length)).toFixed(1) : "—";
  const qTot = St.rated, qGood = St.quality.Good || 0, qAd = St.quality.Adequate || 0;
  const vmax = Math.max(1, ...St.coreViews.map(v => St.views[v] || 0));
  $("#pfBody").innerHTML = `
   <div class="card hero"><div class="htop"><div><small class="k">Current scan</small><h2>${esc(f.pid || "New baby")}</h2>
     <div class="hm">${[f.ga && esc(f.ga) + " wk", f.dol && "Day " + esc(f.dol), f.wt && esc(f.wt) + " kg", esc(f.date || "")].filter(Boolean).join(" · ")}</div></div><div class="ring" style="--p:${pct}"><b>${pct}%</b></div></div>
     <div class="btns" style="margin-top:12px"><button class="btn" onclick="go('protocol')">▶ Continue scan</button><button class="btn ghost" onclick="newStudy()">＋ New scan</button></div></div>
   <div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h2>👤 ${esc(p.name || "Trainee profile")}</h2><button class="btn ghost" style="padding:6px 10px" onclick="editProfile()">Edit</button></div>
     <p class="sub" style="margin:0">${[p.grade, p.hospital, p.supervisor && "Supervisor: " + p.supervisor, p.start && "Since " + p.start].filter(Boolean).map(esc).join(" · ") || "Add your name, grade and supervisor for the portfolio PDF."}</p></div>
   <h3 class="grp">Competency dashboard</h3>
   <div class="kpis">
    <div><b>${St.n}</b>scans logged</div><div><b>${St.sup}</b>supervised</div><div><b>${St.ind}</b>independent</div><div><b>${St.signed}</b>signed off</div>
    <div><b>${qTot ? Math.round((qGood + qAd) / qTot * 100) + "%" : "—"}</b>clips good/adequate<small>${qTot} rated</small></div>
    <div><b>${types}/6</b>drill types passed<small>${dOk}/${drills.length} attempts · avg error ${avgErr}%</small></div>
    <div><b>${Object.values(T.cases).filter(x => x.done).length}/${CASES.length}</b>cases done</div>
    <div><b>${LEVELS.filter(l => T.signoff[l.k]).length}/4</b>levels signed</div></div>
   <div class="card"><h2>Views acquired</h2><p class="sub">Number of scans in which each view was completed.</p>
    ${St.coreViews.map(v => `<div class="vbar"><span>${VSHORT[v]}</span><i><em style="width:${(St.views[v] || 0) / vmax * 100}%"></em></i><b>${St.views[v] || 0}</b></div>`).join("")}</div>
   <div class="card"><h2>Levels</h2>${LEVELS.map(L => { const pr = levelProgress(L.k, T, St), so = T.signoff[L.k], q = T.quiz[L.k];
      return `<div class="lrow"><span class="lic">${L.icon}</span><div><b>Level ${L.n} · ${L.t}</b><small>${pr.done}/${pr.tot} criteria · quiz ${q ? q.best + "%" : "—"}${so ? ` · ✓ ${esc(so.name)}, ${esc(so.date)}` : ""}</small></div>${so ? `<button class="btn ghost" onclick="revokeSignoff('${L.k}')">Undo</button>` : `<button class="btn ghost" onclick="levelSignoff('${L.k}')">Sign off</button>`}</div>`; }).join("")}</div>
   <div class="btns" style="margin-bottom:12px"><button class="btn big" onclick="downloadPortfolio()">⬇ Download training portfolio (PDF)</button></div>
   <h3 class="grp">Logbook</h3>
   <div class="btns"><button class="btn ghost" onclick="exportCSV()">⬇ Logbook CSV</button></div>
   <div class="logstats" id="logstats" style="display:none"></div><div id="loglist" style="margin-top:10px"></div><p class="sub" id="storageInfo" style="font-size:12px"></p>`;
  await renderLog();
  // add review buttons + sign status to log cards
  const studies = await DB.all("studies");
  $$("#loglist .logcard").forEach(card => { const m = card.innerHTML.match(/downloadPDF\('([^']+)'\)/); if (!m) return; const r = studies.find(s => s.id === m[1]); const rv = r && r.S.review;
    card.querySelector(".btns").insertAdjacentHTML("afterbegin", `<button class="btn ${rv && rv.signed ? "ghost" : ""}" onclick="reviewStudy('${m[1]}')">${rv && rv.signed ? "✓ Signed" : "✍ Review"}</button>`);
    if (rv && rv.signed) card.querySelector("h3").insertAdjacentHTML("beforeend", ' <span class="tag" style="background:#e3f5ec;color:#11633f">signed</span>'); });
}

/* ===== portfolio PDF ===== */
async function downloadPortfolio() {
  if (!window.jspdf) await loadScript("vendor/jspdf.umd.min.js").catch(() => {}); if (!window.jspdf) return toast("PDF library not loaded");
  toast("Building portfolio…");
  const T = trainee(), St = await computeStats(), p = T.profile, all = await allStudiesSorted();
  const { jsPDF } = window.jspdf, doc = new jsPDF({ unit: "mm", format: "a4" }), W = 210, M = 15, CW = W - 2 * M; let y;
  const icon = await iconData();
  const header = t => { doc.setFillColor(11, 16, 51); doc.rect(0, 0, W, 22, "F"); if (icon) doc.addImage(icon, "PNG", M, 4, 14, 14);
    doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.text("TnECHO Training Portfolio", M + 18, 11);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text(pdfSafe(t || `${p.name || "Trainee"} · ${p.hospital || ""}`), M + 18, 16.5); doc.setTextColor(20); y = 30; };
  const need = h => { if (y + h > 280) { doc.addPage(); header(); } };
  const H = t => { need(12); y += 2; doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(15, 61, 94); doc.text(pdfSafe(t), M, y); doc.setDrawColor(200); doc.line(M, y + 1.3, M + CW, y + 1.3); y += 7; doc.setTextColor(20); };
  const kv = (k, v) => { need(5); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.text(pdfSafe(k + ":"), M, y); doc.setFont("helvetica", "normal"); doc.text(pdfSafe(String(v == null || v === "" ? "—" : v)), M + 48, y); y += 5; };
  const para = t => { doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); const ls = doc.splitTextToSize(pdfSafe(t), CW); need(ls.length * 4.4); doc.text(ls, M, y); y += ls.length * 4.4; };
  header();
  H("Trainee"); kv("Name", p.name); kv("Grade / post", p.grade); kv("Hospital", p.hospital); kv("Supervisor", p.supervisor); kv("Training start", p.start); kv("Generated", new Date().toLocaleString());
  H("Competency summary");
  kv("Scans logged", St.n); kv("Supervised / independent", `${St.sup} / ${St.ind}`); kv("Observed / reported", `${St.obs} / ${St.rev}`); kv("Signed off by supervisor", St.signed);
  kv("Clip quality (rated)", St.rated ? `Good ${St.quality.Good || 0}, Adequate ${St.quality.Adequate || 0}, Poor ${St.quality.Poor || 0}` : "not rated");
  const dr = T.drills; kv("Measurement drills", `${dr.filter(d => d.ok).length}/${dr.length} passed; ${new Set(dr.filter(d => d.ok).map(d => d.type)).size}/6 types`);
  kv("Case Lab", `${Object.values(T.cases).filter(x => x.done).length}/${CASES.length} cases completed`);
  H("Views acquired (number of scans)"); para(St.coreViews.map(v => `${VSHORT[v]}: ${St.views[v] || 0}`).join("   ·   "));
  H("Curriculum levels");
  for (const L of LEVELS) { const pr = levelProgress(L.k, T, St), so = T.signoff[L.k];
    need(30); doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text(pdfSafe(`Level ${L.n} — ${L.t}`), M, y); y += 4.5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.8); doc.setTextColor(90); doc.text(pdfSafe(`Focus: ${L.focus}. Expected: ${L.comp}.`), M, y); doc.setTextColor(20); y += 4.5;
    pr.c.forEach(c => { need(4.4); doc.setFontSize(9); doc.text(pdfSafe(`${c.ok ? "[x]" : "[ ]"} ${c.label} — ${c.act === "quiz" ? (c.have ? c.have + "%" : "not taken") : `${Math.min(c.have, c.need)}/${c.need}`}`), M + 3, y); y += 4.4; });
    if (so) { need(22); doc.setFontSize(9); doc.text(pdfSafe(`Signed off by ${so.name} on ${so.date}${so.comment ? ' — "' + so.comment + '"' : ""}`), M + 3, y); y += 2; if (so.sig) { doc.addImage(so.sig, "PNG", M + 3, y, 45, 13); y += 15; } else y += 3; }
    else { doc.setFontSize(9); doc.setTextColor(150); doc.text("Not yet signed off", M + 3, y); doc.setTextColor(20); y += 6; } y += 2; }
  H("Quiz results"); LEVELS.forEach(L => { const q = T.quiz[L.k]; kv(`Level ${L.n} quiz`, q ? `best ${q.best}% (last ${q.last}%, ${q.attempts} attempt${q.attempts > 1 ? "s" : ""})` : "not taken"); });
  H("Logbook");
  const cols = [["Case", 12], ["Date", 20], ["ID", 22], ["GA/DOL", 20], ["Indication", 52], ["Level", 30], ["Signed", 24]];
  const row = (vals, bold) => { need(6); let x = M; doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(8);
    vals.forEach((v, i) => { doc.text(doc.splitTextToSize(pdfSafe(String(v || "")), cols[i][1] - 1.5)[0] || "", x, y); x += cols[i][1]; }); y += 5; };
  row(cols.map(c => c[0]), true);
  all.forEach(r => { const f = r.S.f, rv = r.S.review; row([r.caseNo, f.date, f.pid, [f.ga, f.dol && "D" + f.dol].filter(Boolean).join(" "), f.ind, f.level, rv && rv.signed ? (rv.name || "yes") : ""]); });
  const fb = all.filter(r => r.S.review && r.S.review.feedback);
  if (fb.length) { H("Supervisor feedback"); fb.forEach(r => para(`Case ${r.caseNo} (${r.S.f.date || ""}, ${r.S.review.name || ""}): ${r.S.review.feedback}`)); }
  const n = doc.getNumberOfPages(); for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(120); doc.text(pdfSafe(`TnECHO v${APP_VERSION} · training portfolio · self-recorded on device; sign-offs are as entered by the supervisor`), M, 290); doc.text(`Page ${i} of ${n}`, W - M, 290, { align: "right" }); }
  doc.save(`TnECHO_Portfolio_${(p.name || "trainee").replace(/\W+/g, "_")}_${today()}.pdf`);
}
