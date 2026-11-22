/* TnECHO Case Lab (clinical interpretation) and Assessment (level quizzes).
   Educational scenarios — management points are general directions to discuss with the senior team, not prescriptions. */
"use strict";

const CASES = [
 { id: "c_pda", t: "The ventilated 25-weeker", tag: "PDA", img: [N("7.3", "Ductal patterns"), N("7.11", "Descending aorta diastolic flow")],
   hx: "Day 3, 25+5 weeks, 780 g, ventilated with rising FiO₂. Bounding pulses, wide pulse pressure (BP 46/20). Lactate normal.",
   echo: "PDA 3.2 mm, left-to-right, low-velocity pulsatile flow (peak 1.2 m/s). LA:Ao 1.9. Mitral E/A 1.3. LPA diastolic velocity 0.5 m/s. Post-ductal descending aorta: reversed diastolic flow. Celiac: absent diastolic flow.",
   q: [
    { q: "What does a low-velocity (1.2 m/s) pulsatile left-to-right ductal pattern suggest?", o: ["A large, unrestrictive duct", "A restrictive, closing duct", "Pulmonary hypertension with R→L flow", "Coarctation"], a: 0, e: "Low velocity means little pressure difference between aorta and PA across a large duct — an unrestrictive shunt (NPE grading: velocity < 1.5 m/s = large)." },
    { q: "Which findings indicate pulmonary over-circulation?", o: ["LA:Ao 1.9, E/A 1.3 and LPA diastolic 0.5 m/s", "Reversed descending aorta diastolic flow", "Normal lactate", "Wide pulse pressure"], a: 0, e: "LA dilatation, pseudo-normalised E/A (> 1 in a preterm) and high branch-PA diastolic velocity all reflect increased pulmonary venous return/LA loading." },
    { q: "Which findings indicate systemic hypoperfusion ('ductal steal')?", o: ["Reversed post-ductal aortic and absent celiac diastolic flow", "LA:Ao 1.9", "Mitral E/A 1.3", "PDA diameter 3.2 mm"], a: 0, e: "Diastolic run-off into the low-resistance pulmonary circulation steals flow from post-ductal organs." },
    { q: "Best overall physiological summary?", o: ["Haemodynamically significant PDA with over-circulation and systemic steal", "Small PDA, no significance", "PPHN with right-to-left shunting", "Myocardial dysfunction with low output"], a: 0, e: "Multiple large-shunt markers in both domains. Discuss treatment options with the senior team according to unit protocol, and plan follow-up echo." }],
   sum: "Large, unrestrictive left-to-right PDA with pulmonary over-circulation (LA dilatation, raised LA pressure, high LPA diastolic flow) and systemic steal (reversed descending aortic, absent celiac diastolic flow)." },
 { id: "c_pphn", t: "Term baby with labile saturations", tag: "PPHN", img: [N("8.7", "Septal shapes"), N("8.10", "R→L ductal flow"), N("8.3", "TR jet")],
   hx: "39 weeks, meconium aspiration, ventilated on FiO₂ 0.9. Pre-ductal SpO₂ 92%, post-ductal 76%. BP 55/30.",
   echo: "TR Vmax 4.2 m/s. Septum bowing into the LV in systole. PDA with predominantly right-to-left flow. PFO bidirectional. TAPSE reduced for age. Low mitral inflow velocities.",
   q: [
    { q: "Estimate RV systolic pressure (RAP 5 mmHg).", o: ["≈ 76 mmHg", "≈ 21 mmHg", "≈ 42 mmHg", "≈ 109 mmHg"], a: 0, e: "4 × 4.2² = 70.6; + 5 = ≈ 76 mmHg — above the systemic systolic BP of 55." },
    { q: "Which finding best shows supra-systemic RV pressure?", o: ["Septum bowing into the LV in systole", "Reduced TAPSE", "Bidirectional PFO", "Low mitral inflow"], a: 0, e: "Septal shape reflects the RV–LV pressure relationship: flat ≈ ½–systemic, bowing into the LV = RV > LV pressure." },
    { q: "What explains the pre-/post-ductal saturation difference?", o: ["Right-to-left ductal shunting", "Left-to-right atrial shunting", "Aortic coarctation only", "Pulse oximeter error"], a: 0, e: "Deoxygenated PA blood enters the descending aorta through the duct, lowering post-ductal saturation." },
    { q: "Why are mitral inflow velocities low?", o: ["Reduced pulmonary blood flow → low pulmonary venous return/LV preload", "Mitral stenosis", "LV hypertrophy", "Volume overload"], a: 0, e: "Little blood crosses the lungs, so LV filling falls — systemic output can drop even with a normal LV." }],
   sum: "PPHN with supra-systemic pulmonary pressure, right-to-left ductal and bidirectional atrial shunting, RV systolic dysfunction and reduced LV preload. Directions to discuss: optimise lung recruitment/oxygenation, pulmonary vasodilator therapy, support of RV function and systemic pressure." },
 { id: "c_lowflow", t: "Hypotension in the first day", tag: "Low flow", img: [A(13, "RVO"), N("4.4", "FS M-mode")],
   hx: "24+2 weeks, 12 hours old, ventilated. Mean BP 22 mmHg, cool peripheries, CRT 4 s, lactate rising.",
   echo: "RVO 105 mL/kg/min (no significant atrial shunt). FS 21%. Small PDA, bidirectional, low velocity. Septum flat-ish. LV appears poorly contracting.",
   q: [
    { q: "How do you interpret an RVO of 105 mL/kg/min here?", o: ["Low systemic blood flow", "Normal", "High output", "Uninterpretable with any PDA"], a: 0, e: "Without a significant atrial shunt, RVO approximates systemic flow even with a PDA. Normal is ~150–300 mL/kg/min." },
    { q: "FS 21% in this context suggests…", o: ["Reduced LV systolic performance (or high afterload)", "Normal function", "Hyperdynamic LV", "PDA steal"], a: 0, e: "Below the normal range (≈ 28–40% NPE; 30–45% ASE). In the first day the immature myocardium is sensitive to the sudden rise in afterload." },
    { q: "Main physiological problem?", o: ["Low systemic flow from myocardial dysfunction/high afterload in transition", "Large PDA with steal", "Hypovolaemia only", "Pericardial tamponade"], a: 0, e: "Echo separates low flow from myocardial dysfunction from steal or vasodilation — that difference drives the choice of support." }],
   sum: "Transitional low systemic blood flow with impaired LV systolic performance. Directions to discuss: support that improves contractility without raising afterload, cautious volume only if preload is low, repeat echo after each change." },
 { id: "c_tamp", t: "Sudden collapse with a central line", tag: "Safety", img: [A(23, "Pericardial effusion"), A(22, "PICC tip")],
   hx: "27 weeks, day 10, PICC in situ for parenteral nutrition. Sudden bradycardia, hypotension and poor perfusion.",
   echo: "Circumferential pericardial effusion. RA wall collapsing in systole. Small, under-filled ventricles. PICC tip seen within the RA.",
   q: [
    { q: "What is the earliest echo sign of tamponade?", o: ["RA collapse in systole", "RV diastolic collapse only", "Dilated LV", "Mitral regurgitation"], a: 0, e: "Pericardial pressure first exceeds RA pressure — the thin-walled RA collapses in systole." },
    { q: "Most likely cause here?", o: ["PICC-related effusion (extravasation of infusate)", "Viral pericarditis", "Hypoalbuminaemia", "Post-ligation syndrome"], a: 0, e: "A line tip inside the heart can erode or leak — a recognised, life-threatening complication." },
    { q: "Immediate priority?", o: ["Urgent senior help and pericardial drainage; stop the infusion/assess the line", "Repeat echo in 6 hours", "Start a diuretic", "Increase PEEP"], a: 0, e: "Tamponade with haemodynamic compromise is an emergency — drainage relieves it." }],
   sum: "Cardiac tamponade from a PICC-related pericardial effusion. Emergency: senior help, pericardiocentesis, stop infusion and review line position." },
 { id: "c_septic", t: "Warm shock", tag: "Vasodilation", img: [A(8, "LVO"), A(3, "FS")],
   hx: "Term infant, day 5, suspected sepsis. BP 40/18, warm peripheries, bounding pulses, tachycardic. On adequate ventilation.",
   echo: "LVO 420 mL/kg/min, FS 45%. Normal PA pressure estimate. PDA closed. Normal-sized, well-filled ventricles.",
   q: [
    { q: "What pattern do the findings show?", o: ["High output with low pressure — low systemic vascular resistance", "Low output from myocardial failure", "Obstructive shock", "PPHN"], a: 0, e: "A vigorous, well-filled heart pumping a high output against a low BP means the problem is vasodilation." },
    { q: "Which support is most logical to discuss?", o: ["A vasopressor to restore vascular tone", "An inodilator to reduce afterload", "Fluid restriction", "Pulmonary vasodilator"], a: 0, e: "Echo shows the pump is not the problem — raising SVR targets the physiology (alongside treating sepsis)." }],
   sum: "Vasodilatory (warm) shock with hyperdynamic, high-output LV and low SVR. Directions to discuss: vasopressor support with treatment of sepsis; repeat echo to check response." }
];

/* ===== Case Lab UI ===== */
let CS = null;
function renderCases() {
  const T = trainee();
  $("#caseBody").innerHTML = `<p class="sub" style="margin:0 0 10px">Work through real-world scenarios: read the history and echo findings, answer step by step, then compare with the physiological summary.</p>
   ${CASES.map(c => { const r = T.cases[c.id]; return `<button class="ccard" onclick="openCase('${c.id}')"><span class="ctag">${c.tag}</span><b>${c.t}</b><small>${esc(c.hx.slice(0, 90))}…</small><span class="cst">${r && r.done ? `✓ ${r.score}/${r.tot}` : "Start ›"}</span></button>`; }).join("")}`;
}
function openCase(id) {
  const c = CASES.find(x => x.id === id); CS = { c, i: 0, score: 0 };
  $("#caseBody").innerHTML = `<button class="back" onclick="renderCases()">‹ All cases</button><h2 class="ah">${c.t}</h2>
   <div class="card"><h4>History</h4><p>${c.hx}</p><h4>Echo findings</h4><p>${c.echo}</p>
    <div class="cimgs">${c.img.map(m => `<figure class="aimg" onclick="atlasZoom('${imgFile(m)}','${m.cap}','${m.src}','${m.n}')"><img src="${imgFile(m)}" loading="lazy" alt=""><figcaption>${imgLabel(m)} — ${m.cap}</figcaption></figure>`).join("")}</div></div>
   <div class="card quiz" id="caseQ"></div>`;
  caseQ(); window.scrollTo({ top: 0 });
}
function caseQ() {
  const c = CS.c;
  if (CS.i >= c.q.length) {
    markTrainee(T => T.cases[c.id] = { done: true, score: CS.score, tot: c.q.length, date: today() });
    $("#caseQ").innerHTML = `<h2>Physiological summary</h2><p>${c.sum}</p><p class="qscore">You scored ${CS.score}/${c.q.length}.</p>
     <div class="btns"><button class="btn" onclick="renderCases()">More cases</button><button class="btn ghost" onclick="openCase('${c.id}')">Retry</button></div>`; return; }
  const q = c.q[CS.i], order = shuffle(q.o.map((o, i) => i));
  $("#caseQ").innerHTML = `<div style="display:flex;justify-content:space-between"><h2>Question ${CS.i + 1}/${c.q.length}</h2><span class="qscore">${CS.score} correct</span></div><p>${q.q}</p>
   ${order.map(i => `<button class="opt" data-i="${i}">${q.o[i]}</button>`).join("")}<div id="cfb"></div>`;
  $$("#caseQ .opt").forEach(b => b.onclick = () => { if ($("#caseQ").dataset.done === "1") return; $("#caseQ").dataset.done = "1"; const ok = +b.dataset.i === q.a; if (ok) CS.score++;
    $$("#caseQ .opt").forEach(x => { if (+x.dataset.i === q.a) x.classList.add("right"); }); if (!ok) b.classList.add("wrong");
    $("#cfb").innerHTML = `<p class="fbk ${ok ? "ok" : ""}">${ok ? "✓ Correct." : "✗ Not quite."} ${q.e}</p><button class="btn" onclick="CS.i++;$('#caseQ').dataset.done='0';caseQ()">${CS.i + 1 < c.q.length ? "Next question" : "See summary"} ›</button>`; });
}

/* ===== Assessment: level question banks ===== */
const QB = {
 L1: [
  ["A higher-frequency probe gives…", ["Better resolution, less penetration", "Better penetration, less resolution", "Higher frame rate only", "Higher Doppler velocities"], "Higher frequency = shorter wavelength = finer detail but more attenuation — ideal for small preterm infants (10–12 MHz)."],
  ["On spectral Doppler, flow toward the transducer is displayed…", ["Above the baseline", "Below the baseline", "As a mirror image", "Only on colour"], "By convention, flow toward the probe is above the baseline (and red on colour Doppler)."],
  ["Aliasing on PW Doppler occurs when…", ["Velocity exceeds the Nyquist limit (½ PRF)", "The gain is too low", "The angle is 0°", "Flow is laminar"], "Fix by raising the scale, shifting the baseline, or using CW."],
  ["The main advantage of CW over PW Doppler is…", ["It can measure high velocities", "It localises the depth of the signal", "Higher frame rate", "Better 2D image"], "CW measures very high velocities but cannot tell you where along the beam the signal comes from."],
  ["At a 60° angle between beam and flow, measured velocity is…", ["About half the true velocity", "Unchanged", "Doubled", "About 90% of true velocity"], "cos 60° = 0.5. Keep the angle below ~20°; don't angle-correct cardiac Doppler."],
  ["A dark band behind a very bright structure is…", ["Acoustic shadowing", "Reverberation", "Mirror image", "Side-lobe artefact"], "Strong reflectors (calcification, bone, catheters) block the beam."],
  ["In PLAX, the chamber nearest the transducer (top of the screen) is…", ["Right ventricle (outflow)", "Left atrium", "Left ventricle", "Right atrium"], "The RV is the most anterior chamber."],
  ["In the apical 4-chamber view, which AV valve inserts slightly more apically?", ["Tricuspid", "Mitral", "Both at the same level", "Aortic"], "Apical offset of the tricuspid valve helps identify the morphological RV."],
  ["Pulmonary veins drain into the…", ["Left atrium", "Right atrium", "Coronary sinus normally", "SVC"], "Confirm all pulmonary veins enter the LA (crab/apical views)."],
  ["The ductus arteriosus connects…", ["Main PA to descending aorta", "Aorta to SVC", "LA to RA", "RV to LV"], "It joins the PA (near the LPA origin) to the aorta just beyond the left subclavian artery."],
  ["To increase frame rate you can…", ["Narrow the sector and reduce depth", "Widen the sector", "Increase depth", "Add more colour"], "Fewer scan lines and shorter travel time = more frames per second."],
  ["The structure that identifies the morphological RV is…", ["The moderator band", "Papillary muscles", "The aortic valve", "Pulmonary veins"], "The RV is trabeculated with a moderator band; the LV walls are smooth."]
 ],
 L2: [
  ["For PLAX, the probe marker points toward the…", ["Baby's right shoulder", "Baby's left shoulder", "Head", "Left hip"], "Left of the lower sternum, marker to the right shoulder."],
  ["From PLAX, how do you get PSAX?", ["Rotate 90° clockwise (marker to the left shoulder)", "Rotate anticlockwise 180°", "Slide to the apex", "Tilt toward the right hip"], "Rotate clockwise, then sweep from the base to the apex."],
  ["From A4C, how do you open the LVOT (5-chamber)?", ["Tilt anteriorly with slight clockwise rotation", "Tilt posteriorly", "Rotate 90° anticlockwise", "Move subcostally"], "Further anterior tilt brings in the RVOT."],
  ["The ductal view is obtained with the probe…", ["Sagittal at the high left sternal border, marker to the head", "At the apex", "Subcostal, marker to the left", "In the suprasternal notch, transverse"], "Rock gently side to side to find the duct."],
  ["Why is the subcostal view usually done last?", ["It can upset the baby", "It needs a different probe", "It's the least useful", "It requires colour only"], "Abdominal pressure is uncomfortable — get the key views first."],
  ["Where is the PW sample for mitral E/A placed?", ["At the mitral leaflet tips", "In the LA", "At the aortic valve", "In the pulmonary vein"], "Tips give the peak inflow velocities."],
  ["Which modality do you use for the TR jet?", ["CW Doppler", "PW Doppler", "M-mode", "Colour only"], "TR velocities are high — CW avoids aliasing."],
  ["To find pulmonary veins on colour, set the Nyquist limit to about…", ["30–40 cm/s", "100 cm/s", "200 cm/s", "5 cm/s"], "Low venous velocities need a low colour scale."],
  ["TAPSE requires…", ["RV-focused A4C, M-mode through the lateral tricuspid annulus", "PLAX M-mode", "PSAX at papillary level", "Subcostal view"], "Align the cursor with annular motion."],
  ["Why sweep through each view rather than taking a single frame?", ["To see the whole structure and avoid missing defects", "To save time", "To raise the frame rate", "For Doppler alignment only"], "Sweeps show anatomy in 3D and catch VSDs and other lesions."],
  ["In the high parasternal view, the RPA lies on screen…", ["Left (passing behind the aorta)", "Right", "At the top", "It isn't visible"], "Marker to the baby's left: RPA screen-left, LPA screen-right."],
  ["Best view to assess the atrial shunt direction?", ["Subcostal (septum perpendicular to the beam)", "PLAX", "Apical 4-chamber", "Arch view"], "In A4C the septum is parallel to the beam and can drop out."]
 ],
 L3: [
  ["FS (%) = ", ["(LVIDd − LVIDs) ÷ LVIDd × 100", "(LVIDs − LVIDd) ÷ LVIDs × 100", "LVIDd ÷ LVIDs", "(EDV − ESV) ÷ ESV"], "Measured at the mitral leaflet tips."],
  ["The LVOT diameter is measured…", ["Hinge to hinge of the aortic annulus in systole", "At the leaflet tips in diastole", "In the ascending aorta", "On colour"], "Errors are squared in the output calculation."],
  ["Normal LV or RV output (ASE 2024) is about…", ["150–300 mL/kg/min", "50–100 mL/kg/min", "400–600 mL/kg/min", "10–20 mL/kg/min"], "The NPE manual quotes 170–320."],
  ["LA:Ao of 1.8 suggests…", ["Significant LA volume load", "Normal", "LA hypoplasia", "Aortic dilatation only"], "NPE grading: 1.5–1.7 moderate, > 1.7 large."],
  ["TR Vmax 3.5 m/s with RAP 5 mmHg gives RVSP ≈", ["54 mmHg", "19 mmHg", "35 mmHg", "75 mmHg"], "4 × 3.5² = 49; + 5 = 54."],
  ["A normal PAAT relationship is…", ["RVET/PAAT < 4 (PAAT/RVET > 0.25)", "RVET/PAAT > 6", "PAAT longer than RVET", "PAAT/RVET < 0.1"], "Short PAAT (relative to RVET) suggests raised PVR."],
  ["The LV eccentricity index is measured…", ["In PSAX at end-systole; normal ≤ 1.3", "In A4C at end-diastole", "In PLAX on M-mode", "On colour"], "EI = D2 ÷ D1; rises as the septum flattens."],
  ["PDA diameter should be measured…", ["At the narrowest point (usually the pulmonary end) in 2D", "At the aortic end on colour", "Mid-duct on colour", "In the LPA"], "Colour overestimates size."],
  ["A left-to-right PDA velocity below 1.5 m/s suggests…", ["A large, unrestrictive duct", "A closing duct", "Normal PA pressure", "A right-to-left shunt"], "Low gradient = big connection."],
  ["Should angle correction be applied to cardiac Doppler?", ["No", "Yes, always", "Only for TR", "Only above 2 m/s"], "Align the beam instead."],
  ["Normal RV FAC (ASE 2024) is…", ["≥ 35%", "≥ 10%", "≥ 70%", "Exactly 50%"], "NPE quotes 25–40% and includes trabeculations — be consistent."],
  ["TDI sample volume should be…", ["1–2 mm, just below the annulus, angle < 20°", "10 mm in the cavity", "In the LA", "Wide open across the ventricle"], "A small gate limits contamination."]
 ],
 L4: [
  ["Reversed diastolic flow in the post-ductal descending aorta suggests…", ["Ductal steal from a significant PDA", "Coarctation", "Normal transition", "PPHN"], "Rarely aortic regurgitation."],
  ["RVO approximates systemic blood flow when…", ["There is no significant atrial shunt (even with a PDA)", "There is a large PFO", "The duct is closed only", "Never"], "Atrial left-to-right shunting adds to RVO."],
  ["With a large left-to-right PDA, LVO…", ["Overestimates systemic flow", "Underestimates systemic flow", "Equals SVC flow", "Is unaffected"], "LVO includes the ductal shunt volume."],
  ["The septum bowing into the LV in systole means…", ["RV pressure exceeds LV pressure", "Normal", "LV volume overload", "Pericardial effusion"], "Supra-systemic pulmonary pressure."],
  ["Post-ductal SpO₂ lower than pre-ductal is explained by…", ["Right-to-left ductal shunting", "Left-to-right atrial shunting", "High LVO", "Anaemia"], "Classic PPHN physiology."],
  ["In PPHN, low mitral inflow velocities reflect…", ["Reduced pulmonary venous return (low LV preload)", "Mitral stenosis", "Volume overload", "Hyperdynamic LV"], "Low pulmonary blood flow starves the LV of preload."],
  ["The earliest echo sign of tamponade is…", ["RA collapse in systole", "RV hypertrophy", "Mitral regurgitation", "Dilated IVC alone"], ""],
  ["Hyperdynamic LV, high output and low BP suggest…", ["Low systemic vascular resistance (vasodilation)", "Myocardial failure", "Hypovolaemia only", "Tamponade"], "Points toward vasopressor rather than inotrope."],
  ["L→R PDA peak velocity 3 m/s with systolic BP 50 → PA systolic pressure ≈", ["14 mmHg", "86 mmHg", "50 mmHg", "36 mmHg"], "PASP = SBP − 4V² = 50 − 36."],
  ["In a preterm with a PDA, mitral E/A > 1 suggests…", ["Raised LA pressure ('pseudo-normalisation')", "Normal preterm pattern", "Mitral stenosis", "Low preload"], "Preterms are normally A-dominant."],
  ["IVRT < 35 ms in a preterm with a PDA suggests…", ["A large shunt with raised LA pressure", "A closed duct", "Normal", "Pulmonary hypertension"], "Early mitral opening from high LA pressure shortens IVRT."],
  ["Which combination best indicates a haemodynamically significant PDA?", ["Large duct + markers of over-circulation + systemic hypoperfusion", "Duct size alone", "Murmur alone", "Low ductal velocity alone"], "Integrate several markers — no single one is enough."]
 ]
};
let QZL = null;
function renderAssess() {
  const T = trainee();
  $("#assessBody").innerHTML = `<p class="sub" style="margin:0 0 10px">Ten questions per level with instant feedback. Pass mark ${TARGETS.L1.quiz}%. Your best score counts toward that level.</p>
   ${LEVELS.map(L => { const r = T.quiz[L.k]; return `<button class="ccard" onclick="startLevelQuiz('${L.k}')"><span class="ctag">${L.icon} Level ${L.n}</span><b>${L.t}</b><small>${L.focus}</small><span class="cst ${r && r.best >= TARGETS[L.k].quiz ? "pass" : ""}">${r ? `Best ${r.best}%` : "Start ›"}</span></button>`; }).join("")}
   <button class="ccard" onclick="go('train');startQuiz()"><span class="ctag">🖼 Mixed</span><b>Image & topic quiz</b><small>Random questions from the training library, including images</small><span class="cst">Practice ›</span></button>
`;
}
function startLevelQuiz(k) {
  const qs = shuffle(QB[k].slice()).slice(0, 10).map(([q, o, e]) => ({ q, o, e, a: 0 }));
  QZL = { k, qs, i: 0, ok: 0 };
  $("#assessBody").innerHTML = `<button class="back" onclick="renderAssess()">‹ Assessment</button><h2 class="ah">Level ${k[1]} — ${LEVELS.find(l => l.k === k).t}</h2><div class="card quiz" id="lq"></div>`;
  levelQ();
}
function levelQ() {
  const Z = QZL;
  if (Z.i >= Z.qs.length) {
    const pct = Math.round(Z.ok / Z.qs.length * 100), pass = pct >= TARGETS[Z.k].quiz;
    markTrainee(T => { const r = T.quiz[Z.k] || { best: 0, attempts: 0 }; r.best = Math.max(r.best, pct); r.last = pct; r.attempts++; r.date = today(); T.quiz[Z.k] = r; });
    $("#lq").innerHTML = `<h2>${pass ? "✓ Passed" : "Keep going"} — ${pct}%</h2><p>${Z.ok}/${Z.qs.length} correct. ${pass ? "This counts toward your level." : `You need ${TARGETS[Z.k].quiz}% to pass.`}</p>
      <div class="btns"><button class="btn" onclick="startLevelQuiz('${Z.k}')">Try again</button><button class="btn ghost" onclick="renderAssess()">Back</button></div>`; return; }
  const q = Z.qs[Z.i], order = shuffle(q.o.map((o, i) => i));
  $("#lq").innerHTML = `<div style="display:flex;justify-content:space-between"><b>Question ${Z.i + 1}/${Z.qs.length}</b><span class="qscore">${Z.ok} correct</span></div><p style="font-size:16px">${q.q}</p>
   ${order.map(i => `<button class="opt" data-i="${i}">${q.o[i]}</button>`).join("")}<div id="lfb"></div>`;
  $("#lq").dataset.done = "0";
  $$("#lq .opt").forEach(b => b.onclick = () => { if ($("#lq").dataset.done === "1") return; $("#lq").dataset.done = "1"; const ok = +b.dataset.i === 0; if (ok) Z.ok++;
    $$("#lq .opt").forEach(x => { if (+x.dataset.i === 0) x.classList.add("right"); }); if (!ok) b.classList.add("wrong");
    $("#lfb").innerHTML = `<p class="fbk ${ok ? "ok" : ""}">${ok ? "✓ Correct." : "✗ Not quite."} ${q.e}</p><button class="btn" onclick="QZL.i++;levelQ()">${Z.i + 1 < Z.qs.length ? "Next" : "See result"} ›</button>`; });
}
