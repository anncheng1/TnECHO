/* TnECHO Echo Atlas — original schematic diagrams (not to scale), probe-movement animations,
   reference and normal-vs-abnormal images, and unit teaching loops (atlas/loops.json). */
"use strict";

/* Shape helpers: each structure = {id, label, info, kind:'blood'|'wall'|'valve'|'vessel'|'other', d|c|e|line} */
const E = (cx, cy, rx, ry, rot) => ({ e: [cx, cy, rx, ry, rot || 0] });
const C = (cx, cy, r) => ({ e: [cx, cy, r, r, 0] });
const Pth = d => ({ d });
const Tube = (pts, w) => ({ tube: pts, w });   // polyline drawn thick (vessel)
const Ln = (pts, w) => ({ line: pts, w: w || 4 }); // valve leaflet / wall line

const ATLAS = [
 { id: "plax", t: "Parasternal long axis (PLAX)", lvl: 1, win: "w_plax",
   orient: "Anterior (chest wall) at the top; LV apex on screen left; aorta and LA on screen right.",
   s: [
    { id: "rv", ab: "RVOT", label: "RV (outflow)", kind: "blood", ...E(205, 82, 125, 26, -6), info: "Right ventricular outflow — the most anterior chamber, nearest the probe. Dilated in RV volume load." },
    { id: "ivs", ab: "IVS", label: "Interventricular septum", kind: "wall", ...Pth("M60 135 Q150 108 240 112 L242 126 Q150 124 64 152 Z"), info: "Continuous with the anterior aortic wall. Check for VSDs and septal motion; measured for wall thickness on M-mode." },
    { id: "lv", ab: "LV", label: "Left ventricle", kind: "blood", ...E(148, 185, 98, 42, -4), info: "Measure LVIDd/LVIDs at the mitral leaflet tips (M-mode or 2D) for fractional shortening." },
    { id: "lvpw", ab: "LVPW", label: "LV posterior wall", kind: "wall", ...Pth("M58 220 Q150 240 236 228 L238 244 Q150 258 60 236 Z"), info: "Its endocardium is the line with the steepest systolic slope on M-mode." },
    { id: "ao", ab: "Ao", label: "Aortic root", kind: "blood", ...Pth("M240 112 L340 106 L342 152 L242 156 Z"), info: "Measure LVOT/annulus hinge-to-hinge in systole for LV output; M-mode here for LA:Ao." },
    { id: "av", ab: "AV", lp: [258, 168], label: "Aortic valve", kind: "valve", ...Ln([[250, 116], [272, 134], [250, 152]], 3), info: "Right and non-coronary cusps seen opening in systole." },
    { id: "la", ab: "LA", label: "Left atrium", kind: "blood", ...C(300, 210, 46), info: "Enlarged LA (LA:Ao > 1.5) suggests volume load, e.g. a significant PDA." },
    { id: "mv", ab: "MV", label: "Mitral valve", kind: "valve", ...Ln([[246, 158], [214, 196], [246, 240]], 3), info: "Anterior leaflet continuous with the posterior aortic wall (aorto-mitral continuity)." },
    { id: "dao", ab: "DAo", label: "Descending aorta", kind: "blood", ...C(300, 292, 14), info: "Seen in cross-section behind the LA." },
    { id: "peri", ab: "Peri", label: "Pericardium", kind: "other", ...Ln([[60, 252], [180, 266], [262, 262], [330, 268]], 5), info: "Bright posterior line. Look for fluid between it and the LV/LA." }
   ] },
 { id: "psax_av", t: "Parasternal short axis — aortic valve level", lvl: 1, win: "w_psax",
   orient: "'Mercedes-Benz' aortic valve in the centre; RV outflow wraps around it from screen left to right.",
   s: [
    { id: "ao", ab: "AoV", label: "Aortic valve (3 cusps)", kind: "valve", ...C(200, 168, 36), info: "Three cusps closing in a 'Mercedes' sign in diastole. Bicuspid valves look different." },
    { id: "rvot", ab: "RVOT", label: "RV outflow tract", kind: "blood", ...Pth("M108 175 Q110 95 200 88 Q270 88 290 120 L268 136 Q250 116 200 118 Q140 122 136 178 Z"), info: "Wraps anteriorly around the aorta from the tricuspid valve to the pulmonary valve." },
    { id: "tv", ab: "TV", label: "Tricuspid valve", kind: "valve", ...Ln([[118, 186], [132, 204], [146, 214]], 3), info: "At about 9 o'clock. Look for TR with colour and CW." },
    { id: "pv", ab: "PV", label: "Pulmonary valve", kind: "valve", ...Ln([[272, 120], [286, 140]], 3), info: "PW at the leaflet tips for PAAT/RVET and VTI." },
    { id: "mpa", ab: "MPA", label: "Main pulmonary artery", kind: "blood", ...Tube([[282, 132], [312, 170], [326, 214]], 26), info: "Runs posteriorly toward the bifurcation; a PDA jet may be seen entering here." },
    { id: "ra", ab: "RA", label: "Right atrium", kind: "blood", ...C(122, 236, 38), info: "Screen left-lower." },
    { id: "ias", ab: "IAS", label: "Interatrial septum", kind: "wall", ...Ln([[166, 212], [178, 270]], 5), info: "Check for an atrial shunt with colour." },
    { id: "la", ab: "LA", label: "Left atrium", kind: "blood", ...E(222, 246, 52, 32, 0), info: "Posterior to the aorta." }
   ] },
 { id: "psax_pm", t: "Parasternal short axis — papillary level", lvl: 1, win: "w_psax",
   orient: "LV round in the centre; RV a crescent at top-left; papillary muscles at about 4 and 8 o'clock.",
   s: [
    { id: "rv", ab: "RV", label: "Right ventricle", kind: "blood", ...Pth("M90 170 Q110 92 200 86 Q160 110 150 160 Q140 186 150 212 Q112 206 90 170 Z"), info: "Crescent-shaped normally. A dilated, rounded RV suggests pressure or volume load." },
    { id: "ivs", ab: "IVS", label: "Septum", kind: "wall", ...Pth("M200 112 Q156 128 150 190 L170 192 Q174 142 206 132 Z"), info: "Judge its shape at end-systole: curved into the RV (normal), flat (½–systemic RV pressure) or bowing into the LV." },
    { id: "lv", ab: "LV", label: "Left ventricle", kind: "blood", ...C(222, 196, 62), info: "Should be round. A D-shaped LV means high RV pressure. Measure eccentricity index here (D2÷D1)." },
    { id: "pmal", ab: "ALPM", label: "Anterolateral papillary muscle", kind: "wall", ...C(266, 222, 12), info: "Smooth, rounded — don't include in wall measurements." },
    { id: "pmpm", ab: "PMPM", label: "Posteromedial papillary muscle", kind: "wall", ...C(194, 244, 12), info: "Distinguish from the ventricular wall by its rounded outline." },
    { id: "lvw", ab: "LV wall", lp: [300, 120], label: "LV wall", kind: "other", ...Pth("M222 120 A76 76 0 1 1 221.9 120 Z M222 134 A62 62 0 1 0 222.1 134 Z"), info: "Assess regional and global wall motion." }
   ] },
 { id: "a4c", t: "Apical 4-chamber", lvl: 1, win: "w_api",
   orient: "Apex at the top; LV on screen right, RV on screen left; atria at the bottom.",
   s: [
    { id: "lv", ab: "LV", label: "Left ventricle", kind: "blood", ...E(252, 140, 46, 88, -12), info: "Bullet-shaped, smooth walls. Use LV-focused view for Simpson EF." },
    { id: "rv", ab: "RV", label: "Right ventricle", kind: "blood", ...E(150, 150, 42, 74, 16), info: "Triangular, trabeculated, with a moderator band. Use RV-focused view for TAPSE and FAC." },
    { id: "ivs", ab: "IVS", lp: [205, 70], label: "Interventricular septum", kind: "wall", ...Pth("M198 50 L212 50 L212 228 L198 228 Z"), info: "May shift leftward when the RV is dilated or pressure-loaded. Septal 'drop-out' can mimic a defect." },
    { id: "mb", ab: "MB", lp: [146, 182], label: "Moderator band", kind: "wall", ...Ln([[124, 168], [196, 150]], 5), info: "Identifies the morphological right ventricle." },
    { id: "mv", ab: "MV", label: "Mitral valve", kind: "valve", ...Ln([[214, 236], [250, 224], [292, 236]], 3), info: "PW at the leaflet tips → E and A waves." },
    { id: "tv", ab: "TV", label: "Tricuspid valve", kind: "valve", ...Ln([[108, 222], [150, 212], [196, 224]], 3), info: "Inserts slightly more apically than the mitral valve. CW of TR jet; M-mode of the lateral annulus for TAPSE." },
    { id: "la", ab: "LA", label: "Left atrium", kind: "blood", ...C(258, 286, 42), info: "Pulmonary veins enter from below." },
    { id: "ra", ab: "RA", label: "Right atrium", kind: "blood", ...C(146, 286, 42), info: "Dilated with raised RA pressure." },
    { id: "ias", ab: "IAS", label: "Interatrial septum", kind: "wall", ...Ln([[204, 244], [204, 324]], 5), info: "Lies parallel to the beam here — shunts are better seen subcostally." },
    { id: "pv", ab: "PVs", label: "Pulmonary veins", kind: "vessel", ...Tube([[236, 324], [226, 348]], 10), info: "Low-Nyquist colour to find; PW at entry → S, D, A waves." }
   ] },
 { id: "a5c", t: "Apical 5-chamber", lvl: 2, win: "w_api",
   orient: "From A4C, tilt anteriorly: the LV outflow and aortic valve appear between the atria.",
   s: [
    { id: "lv", ab: "LV", label: "Left ventricle", kind: "blood", ...E(252, 140, 46, 88, -12), info: "LV inflow and outflow both visible." },
    { id: "rv", ab: "RV", label: "Right ventricle", kind: "blood", ...E(150, 150, 42, 74, 16), info: "" },
    { id: "ivs", ab: "IVS", label: "Septum", kind: "wall", ...Pth("M198 50 L212 50 L212 210 L198 210 Z"), info: "" },
    { id: "lvot", ab: "LVOT", label: "LVOT / aortic valve", kind: "blood", ...Tube([[226, 214], [214, 258], [206, 312]], 30), info: "PW just above the aortic valve → aortic VTI for LV output; inflow–outflow junction for IVRT." },
    { id: "av", ab: "AV", lp: [250, 256], label: "Aortic valve", kind: "valve", ...Ln([[198, 246], [232, 250]], 3), info: "" },
    { id: "mv", ab: "MV", label: "Mitral valve", kind: "valve", ...Ln([[240, 232], [270, 222], [298, 234]], 3), info: "" },
    { id: "la", ab: "LA", label: "Left atrium", kind: "blood", ...C(276, 292, 34), info: "" },
    { id: "ra", ab: "RA", label: "Right atrium", kind: "blood", ...C(140, 288, 40), info: "" }
   ] },
 { id: "sub", t: "Subcostal — atrial septum", lvl: 2, win: "w_sub",
   orient: "Liver at the top (near field); RA on screen left, LA on screen right; septum perpendicular to the beam.",
   s: [
    { id: "liver", ab: "Liver", label: "Liver", kind: "other", ...Pth("M40 70 L360 70 L340 118 Q200 104 60 120 Z"), info: "Acoustic window. Done last — subcostal pressure can upset the baby." },
    { id: "rv", ab: "RV", label: "Right ventricle", kind: "blood", ...E(176, 140, 62, 18, -4), info: "Anterior, just beneath the liver." },
    { id: "lv", ab: "LV", label: "Left ventricle", kind: "blood", ...E(286, 150, 40, 22, 10), info: "" },
    { id: "ra", ab: "RA", label: "Right atrium", kind: "blood", ...C(138, 222, 50), info: "Systemic venous return from IVC and SVC." },
    { id: "la", ab: "LA", label: "Left atrium", kind: "blood", ...C(272, 228, 48), info: "" },
    { id: "ias", ab: "IAS", label: "Interatrial septum / PFO", kind: "wall", ...Pth("M200 182 L212 182 L212 210 L200 210 Z M200 228 L212 228 L212 274 L200 274 Z"), info: "Perpendicular to the beam — best view for shunt size and direction (colour + PW, gate 1–2 mm)." },
    { id: "ivc", ab: "IVC", label: "IVC", kind: "vessel", ...Tube([[70, 330], [100, 290], [116, 260]], 22), info: "A dilated IVC with low-velocity bidirectional flow suggests raised RA pressure." }
   ] },
 { id: "ductal", t: "Ductal view", lvl: 2, win: "w_ductal",
   orient: "Sagittal: main PA rising on the left, the duct arching across to the descending aorta on the right.",
   s: [
    { id: "mpa", ab: "MPA", label: "Main pulmonary artery", kind: "blood", ...Tube([[118, 320], [140, 230], [170, 150]], 34), info: "Arises from the RV outflow." },
    { id: "pv", ab: "PV", label: "Pulmonary valve", kind: "valve", ...Ln([[100, 296], [138, 306]], 3), info: "" },
    { id: "pda", ab: "PDA", label: "Ductus arteriosus", kind: "blood", ...Tube([[172, 142], [212, 118], [252, 128]], 16), info: "Measure diameter at the narrowest (usually pulmonary) end; Doppler for direction and velocity." },
    { id: "dao", ab: "DAo", label: "Descending aorta", kind: "blood", ...Tube([[262, 112], [276, 220], [290, 340]], 30), info: "PW below the ductal insertion for diastolic flow (forward, absent or reversed)." },
    { id: "arch", ab: "Arch", label: "Aortic arch (distal)", kind: "blood", ...Tube([[150, 70], [210, 56], [262, 100]], 22), info: "Angling too far right brings the arch into view instead of the duct." },
    { id: "lpa", ab: "LPA", label: "Left pulmonary artery", kind: "vessel", ...Tube([[176, 168], [214, 196]], 14), info: "Branches off posteriorly; diastolic run-off here suggests a large shunt." }
   ] },
 { id: "arch", t: "Aortic arch", lvl: 2, win: "w_arch",
   orient: "Candy-cane: ascending aorta on the left, three head vessels from the top, descending aorta on the right.",
   s: [
    { id: "asc", ab: "AAo", label: "Ascending aorta", kind: "blood", ...Tube([[118, 320], [128, 200], [150, 120]], 30), info: "PW for pre-ductal flow." },
    { id: "arch", ab: "Arch", label: "Transverse arch", kind: "blood", ...Tube([[150, 120], [200, 86], [256, 104]], 26), info: "Check continuity and size — exclude coarctation/interruption." },
    { id: "dao", ab: "DAo", label: "Descending aorta", kind: "blood", ...Tube([[256, 104], [282, 200], [300, 336]], 26), info: "Post-ductal PW: diastolic reversal = ductal steal." },
    { id: "bca", ab: "BCA", label: "Brachiocephalic artery", kind: "vessel", ...Tube([[160, 112], [150, 44]], 12), info: "First branch — confirms a left arch when it goes to the right." },
    { id: "lcca", ab: "LCCA", label: "Left common carotid", kind: "vessel", ...Tube([[204, 88], [206, 38]], 10), info: "" },
    { id: "lsa", ab: "LSA", label: "Left subclavian", kind: "vessel", ...Tube([[244, 98], [262, 44]], 10), info: "The duct inserts opposite/distal to this." },
    { id: "rpa", ab: "RPA", label: "Right pulmonary artery", kind: "blood", ...C(208, 162, 22), info: "Cross-section beneath the arch." }
   ] },
 { id: "highps", t: "High parasternal — branch PAs", lvl: 2, win: "w_highps",
   orient: "'Trousers': main PA dividing into RPA (screen left) and LPA (screen right); aorta and SVC in cross-section.",
   s: [
    { id: "mpa", ab: "MPA", label: "Main pulmonary artery", kind: "blood", ...Tube([[214, 336], [214, 196]], 36), info: "" },
    { id: "rpa", ab: "RPA", label: "Right pulmonary artery", kind: "blood", ...Tube([[208, 196], [150, 182], [84, 196]], 20), info: "Passes behind the aorta." },
    { id: "lpa", ab: "LPA", label: "Left pulmonary artery", kind: "blood", ...Tube([[222, 196], [280, 210], [330, 252]], 20), info: "PW just beyond the bifurcation: diastolic velocity > 0.3 m/s suggests increased pulmonary blood flow." },
    { id: "ao", ab: "Ao", label: "Ascending aorta", kind: "blood", ...C(142, 118, 30), info: "" },
    { id: "svc", ab: "SVC", label: "SVC", kind: "blood", ...C(78, 128, 18), info: "" },
    { id: "pdajet", ab: "jet", label: "Colour jet into PA", kind: "other", ...E(236, 176, 16, 10, 20), info: "A red jet entering near the bifurcation usually indicates left-to-right ductal flow (exclude branch PA stenosis)." }
   ] }
];

/* Probe-movement sequences on an infant chest (screen coordinates: patient's left = screen right).
   rot = marker direction in degrees (0 → baby's left, -90 → head, -135 → right shoulder, -45 → left shoulder). */
const PROBE = {
  plax:    [{ x: 222, y: 210, rot: -135, l: "Left of the lower sternum, perpendicular to the chest; marker to the baby's right shoulder." }, { x: 222, y: 210, rot: -135, tilt: "↗", l: "Tilt the beam toward the left shoulder → RV outflow and pulmonary valve." }, { x: 222, y: 210, rot: -135, tilt: "↘", l: "Tilt toward the right hip → RV inflow and tricuspid valve." }],
  psax_av: [{ x: 222, y: 210, rot: -135, l: "Start from PLAX." }, { x: 222, y: 210, rot: -45, l: "Rotate 90° clockwise — marker to the baby's left shoulder." }, { x: 222, y: 210, rot: -45, tilt: "↖", l: "Angle toward the right shoulder (base) → aortic valve level." }],
  psax_pm: [{ x: 222, y: 210, rot: -45, l: "PSAX, marker to the left shoulder." }, { x: 222, y: 210, rot: -45, tilt: "↘", l: "Sweep toward the left hip: mitral valve → papillary muscles → apex." }],
  a4c:     [{ x: 262, y: 258, rot: 0, beam: -140, l: "At the apex (below the left nipple), beam toward the right shoulder, marker to the baby's left." }, { x: 268, y: 262, rot: 0, beam: -140, l: "Slide laterally if the image is foreshortened (move to the true apex)." }],
  a5c:     [{ x: 262, y: 258, rot: 0, beam: -140, l: "From A4C…" }, { x: 262, y: 258, rot: 10, beam: -140, tilt: "⤴", l: "Tilt anteriorly with slight clockwise rotation → LVOT and aortic valve appear." }],
  sub:     [{ x: 200, y: 318, rot: 0, beam: -90, l: "Below the xiphoid, probe flat, marker to the baby's left." }, { x: 200, y: 318, rot: 0, beam: -90, tilt: "⤴", l: "Tilt the beam up toward the anterior chest until the atria appear." }, { x: 200, y: 318, rot: -90, beam: -90, l: "Rotate 90° (marker to head) for IVC and abdominal aorta." }],
  ductal:  [{ x: 214, y: 150, rot: -90, l: "High left sternal border, fully sagittal, marker to the head." }, { x: 218, y: 150, rot: -90, tilt: "↔", l: "Rock gently side to side to find the duct." }],
  arch:    [{ x: 214, y: 150, rot: -90, l: "Start in the ductal view." }, { x: 190, y: 146, rot: -80, tilt: "↙", l: "Slide just right of the sternum, rotate slightly clockwise and angle leftward." }],
  highps:  [{ x: 214, y: 140, rot: 0, l: "Upper left sternal edge, transverse, marker to the baby's left." }, { x: 214, y: 140, rot: 0, tilt: "⤴", l: "Angle slightly superiorly to open the PA bifurcation." }]
};
const ATLAS_IMGS = {
  plax: { ref: [N("3.6", "PLAX with RV outflow and inflow tilts")], na: [N("7.5", "Normal vs volume-loaded LA/LV (large PDA)"), N("7.4", "M-mode LA:Ao and LVEDD")] },
  psax_av: { ref: [N("3.7", "PSAX sweep: aortic valve → mitral → papillary")], na: [N("8.4", "Pulmonary insufficiency on colour")] },
  psax_pm: { ref: [N("3.7", "PSAX at papillary level (C)")], na: [N("8.7", "Normal septal curvature vs flat vs bowing into LV"), A(16, "Eccentricity index: normal vs raised RV pressure")] },
  a4c: { ref: [N("3.5", "Apical 4-chamber, 5-chamber and PA views"), N("4.6", "A4C with mitral and tricuspid inflow")], na: [N("8.8", "Septal bowing and RV dilatation"), N("8.9", "Reduced mitral inflow in PPHN vs normal")] },
  a5c: { ref: [N("3.5", "Apical 5-chamber (B)"), N("4.1", "Apical long axis and aortic VTI")], na: [A(6, "IVRT/IVCT at the inflow–outflow junction")] },
  sub: { ref: [N("3.2", "Subcostal atria, LVOT and RVOT"), N("3.3", "Subcostal IVC and abdominal aorta")], na: [N("7.10", "High-velocity left-to-right atrial shunt"), N("8.2", "Right-to-left / bidirectional PFO flow"), N("8.1", "Dilated IVC with bidirectional flow")] },
  ductal: { ref: [N("3.9", "Ductal view"), N("7.1", "Probe position and ductal view")], na: [N("7.3", "Ductal flow patterns: non-restrictive, restrictive, bidirectional, R→L"), N("8.10", "Right-to-left ductal flow")] },
  arch: { ref: [N("3.10", "Aortic arch with head and neck vessels")], na: [N("7.11", "Descending aorta: forward, absent and reversed diastolic flow")] },
  highps: { ref: [N("3.8", "PA bifurcation with aorta and SVC")], na: [N("7.8", "Normal LPA flow vs diastolic run-off with a large PDA")] }
};
let UNIT_LOOPS = {};
fetch("atlas/loops.json").then(r => r.ok ? r.json() : {}).then(j => { UNIT_LOOPS = j || {}; }).catch(() => {});

/* ---------- rendering ---------- */
const KORD = { other: 0, blood: 1, vessel: 2, wall: 3, valve: 4 };
const FILL = { blood: "#0b0b0b", wall: "#bdbdbd", valve: "none", vessel: "#0b0b0b", other: "rgba(160,160,160,.55)" };
function shapeSVG(st, on) {
  const stroke = on ? "#29b6f6" : (st.kind === "blood" || st.kind === "vessel" ? "#8a8a8a" : st.kind === "valve" ? "#e0e0e0" : "#9e9e9e");
  const sw = on ? 4 : (st.kind === "blood" || st.kind === "vessel" ? 7 : 2);
  const a = `data-s="${st.id}" class="ash${on ? " on" : ""}"`;
  if (st.e) { const [cx, cy, rx, ry, r] = st.e; return `<ellipse ${a} cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${cx} ${cy})" fill="${FILL[st.kind]}" stroke="${stroke}" stroke-width="${sw}"/>`; }
  if (st.d) return `<path ${a} d="${st.d}" fill="${FILL[st.kind]}" fill-rule="evenodd" stroke="${on ? stroke : "none"}" stroke-width="${on ? 3 : 0}"/>`;
  if (st.tube) { const pts = st.tube.map(p => p.join(",")).join(" ");
    return `<g ${a}><polyline points="${pts}" fill="none" stroke="${on ? "#29b6f6" : "#9a9a9a"}" stroke-width="${st.w + 12}" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="#0b0b0b" stroke-width="${st.w}" stroke-linecap="round" stroke-linejoin="round"/></g>`; }
  if (st.line) { const pts = st.line.map(p => p.join(",")).join(" "); return `<g ${a}><polyline points="${pts}" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round" pointer-events="stroke"/><polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="${on ? st.w + 3 : st.w}" stroke-linecap="round" stroke-linejoin="round"/></g>`; }
  return "";
}
function centroid(st) {
  if (st.lp) return st.lp;
  if (st.e) return [st.e[0], st.e[1]];
  const pts = st.tube || st.line; if (pts) { const m = pts[Math.floor(pts.length / 2)]; return m; }
  const nums = st.d.match(/-?\d+(\.\d+)?/g).map(Number); let xs = [], ys = []; for (let i = 0; i + 1 < nums.length; i += 2) { xs.push(nums[i]); ys.push(nums[i + 1]); }
  return [xs.reduce((a, b) => a + b) / xs.length, ys.reduce((a, b) => a + b) / ys.length];
}
let AT = { id: null, sel: null, labels: true, step: 0, timer: null };
function atlasSVG(v) {
  const sector = "M200 0 L-75 247.6 A370 370 0 0 0 475 247.6 Z";
  return `<svg viewBox="0 0 400 360" class="asvg" role="img" aria-label="${v.t} schematic">
   <defs><clipPath id="sec_${v.id}"><path d="${sector}"/></clipPath>
    <radialGradient id="g_${v.id}" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="#3a3a3a"/><stop offset="1" stop-color="#1c1c1c"/></radialGradient>
    <filter id="spk"><feTurbulence baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .6  0 0 0 0 .6  0 0 0 0 .6  0 0 0 .18 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
   <rect width="400" height="360" fill="#000"/>
   <g clip-path="url(#sec_${v.id})"><path d="${sector}" fill="url(#g_${v.id})"/><path d="${sector}" fill="#888" filter="url(#spk)"/>
    <g transform="translate(20 30) scale(.9)">${v.s.slice().sort((p, q) => KORD[p.kind] - KORD[q.kind]).map(st => shapeSVG(st, AT.sel === st.id)).join("")}
    ${AT.labels ? v.s.map(st => { const [x, y] = centroid(st); return `<text x="${x}" y="${y}" class="alab${AT.sel === st.id ? " on" : ""}" data-s="${st.id}">${st.ab}</text>`; }).join("") : ""}</g>
   </g><path d="${sector}" fill="none" stroke="#555" stroke-width="1"/>
   <circle cx="222" cy="12" r="4" fill="#ffb300"/><text x="352" y="350" class="anote">schematic · not to scale</text></svg>`;
}
function chestSVG(st, view) {
  const r = st.rot, bx = st.beam;
  return `<svg viewBox="0 0 400 380" class="chest">
   <path d="M120 40 Q200 20 280 40 L330 70 Q350 80 352 110 L340 360 L60 360 L48 110 Q50 80 70 70 Z" fill="#f3e1d3" stroke="#d2b8a4" stroke-width="2"/>
   <circle cx="200" cy="96" r="7" fill="none" stroke="#c9a68c" stroke-width="2"/><text x="200" y="78" class="cl">notch</text>
   <line x1="200" y1="104" x2="200" y2="285" stroke="#d6bba6" stroke-width="10" stroke-linecap="round"/><path d="M192 288 L200 304 L208 288 Z" fill="#d6bba6"/>
   <circle cx="135" cy="200" r="5" fill="#d9a48d"/><circle cx="265" cy="200" r="5" fill="#d9a48d"/>
   <text x="100" y="60" class="cl">R shoulder</text><text x="300" y="60" class="cl">L shoulder</text><text x="70" y="352" class="cl">baby's right</text><text x="330" y="352" class="cl">baby's left</text>
   <g class="probe" style="transform:translate(${st.x}px,${st.y}px) rotate(${r}deg)">
     ${bx != null ? `<path d="M0 0 L120 -36 L120 36 Z" fill="rgba(29,111,165,.18)" transform="rotate(${bx - r})"/>` : ""}
     <rect x="-26" y="-9" width="52" height="18" rx="7" fill="#263238"/><circle cx="22" cy="0" r="5" fill="#ffb300"/></g>
   ${st.tilt ? `<text x="${st.x + 26}" y="${st.y - 22}" class="tilt">${st.tilt}</text>` : ""}
  </svg>`;
}
function renderAtlasList() {
  const T = trainee();
  $("#atlasBody").innerHTML = `<p class="sub" style="margin:0 0 10px">Tap a view. Each has a labelled diagram (tap any structure), an animation of the probe movement, real reference images, and normal-vs-abnormal examples.</p>
   <div class="alist">${ATLAS.map(v => `<button onclick="openAtlas('${v.id}')"><span class="amini">${atlasSVG(Object.assign({}, v, { s: v.s }))}</span><b>${v.t}</b><small>${T.atlas[v.id] ? "✓ explored" : "Level " + v.lvl}</small></button>`).join("")}</div>`;
  $$(".alist .amini svg text").forEach(t => t.remove());
}
function openAtlas(id) {
  const v = ATLAS.find(x => x.id === id); AT = Object.assign(AT, { id, sel: null, step: 0 }); clearInterval(AT.timer);
  markTrainee(T => { T.atlas[id] = true; });
  const im = ATLAS_IMGS[id] || { ref: [], na: [] }, loops = UNIT_LOOPS[id] || [];
  $("#atlasBody").innerHTML = `<button class="back" onclick="renderAtlasList()">‹ All views</button>
   <h2 class="ah">${v.t}</h2><p class="sub">${v.orient}</p>
   <div class="card ap"><div class="atabs"><button class="on" data-p="anat">🫀 Anatomy</button><button data-p="probe">✋ Probe movement</button><button data-p="imgs">🖼 Images</button>${loops.length ? '<button data-p="loops">🎞 Loops</button>' : ""}</div>
    <div data-pane="anat"><div id="asvgWrap"></div>
      <div class="abar"><label><input type="checkbox" id="albl" ${AT.labels ? "checked" : ""}> Labels</label><span>Tap a structure</span><button class="learn" onclick="openTrain('${v.win}')">📖 Probe position card</button></div>
      <div class="ainfo" id="ainfo">Tap any structure in the diagram to learn what it is and what to measure there.</div>
      <div class="achips">${v.s.map(st => `<button data-s="${st.id}">${st.label}</button>`).join("")}</div></div>
    <div data-pane="probe" hidden><div id="chestWrap"></div><div class="pstep" id="pstep"></div>
      <div class="btns"><button class="btn ghost" onclick="probeStep(-1)">‹</button><button class="btn" id="pplay" onclick="probePlay()">▶ Play</button><button class="btn ghost" onclick="probeStep(1)">›</button></div>
      <p class="sub" style="font-size:12px;margin-top:8px">Orange dot = probe marker. Shaded fan = beam direction. Arrows show tilt.</p></div>
    <div data-pane="imgs" hidden>
      <h4>Reference</h4>${im.ref.map(m => atlasImg(m)).join("")}
      ${im.na.length ? `<h4>Normal vs abnormal</h4>${im.na.map(m => atlasImg(m)).join("")}` : ""}</div>
    ${loops.length ? `<div data-pane="loops" hidden>${loops.map(l => `<figure class="aimg"><video src="${l.src}" controls loop muted playsinline preload="metadata"></video><figcaption>${esc(l.cap || "")}</figcaption></figure>`).join("")}</div>` : ""}
   </div>
   <p class="sub" style="font-size:12px">Your unit can add its own anonymised teaching loops for this view — see README (atlas/loops.json).</p>`;
  $$("#atlasBody .atabs button").forEach(b => b.onclick = () => { $$("#atlasBody .atabs button").forEach(x => x.classList.toggle("on", x === b)); $$("#atlasBody [data-pane]").forEach(p => p.hidden = p.dataset.pane !== b.dataset.p); if (b.dataset.p === "probe") drawProbe(); else { clearInterval(AT.timer); AT.timer = null; } });
  $("#albl").onchange = e => { AT.labels = e.target.checked; drawAtlas(); };
  $$("#atlasBody .achips button").forEach(b => b.onclick = () => selectStruct(b.dataset.s));
  drawAtlas(); window.scrollTo({ top: 0 });
}
function atlasImg(m) { const f = imgFile(m); return `<figure class="aimg" onclick="atlasZoom('${f}','${esc(m.cap).replace(/'/g, "&#39;")}','${m.src}','${m.n}')"><img src="${f}" loading="lazy" alt=""><figcaption><span class="badge ${m.src}" style="position:static">${imgLabel(m)}</span> ${esc(m.cap)}</figcaption></figure>`; }
function atlasZoom(f, cap, src, n) { LB = { id: null, i: 0 }; $("#lbi").src = f; $("#lbt").textContent = cap; $("#lbc").innerHTML = SRC[src].credit(n); $("#lprev").style.visibility = $("#lnext").style.visibility = "hidden"; $("#lsc").classList.remove("z"); $("#lbx").classList.add("on"); document.body.style.overflow = "hidden"; }
function drawAtlas() {
  const v = ATLAS.find(x => x.id === AT.id); $("#asvgWrap").innerHTML = atlasSVG(v);
  $$("#asvgWrap [data-s]").forEach(el => el.addEventListener("click", () => selectStruct(el.dataset.s)));
  $$("#atlasBody .achips button").forEach(b => b.classList.toggle("on", b.dataset.s === AT.sel));
}
function selectStruct(sid) {
  const v = ATLAS.find(x => x.id === AT.id), st = v.s.find(x => x.id === sid); AT.sel = sid; drawAtlas();
  $("#ainfo").innerHTML = `<b>${st.label}</b><br>${st.info || "—"}`;
}
function drawProbe() {
  const seq = PROBE[AT.id] || []; if (!seq.length) return;
  AT.step = (AT.step + seq.length) % seq.length; const st = seq[AT.step];
  if (!$("#chestWrap .chest")) $("#chestWrap").innerHTML = chestSVG(st);
  else { const g = $("#chestWrap .probe"); g.style.transform = `translate(${st.x}px,${st.y}px) rotate(${st.rot}deg)`; const t = $("#chestWrap .tilt"); if (t) t.remove();
    const fan = g.querySelector("path"); if (fan && st.beam != null) fan.setAttribute("transform", `rotate(${st.beam - st.rot})`);
    if (st.tilt) $("#chestWrap .chest").insertAdjacentHTML("beforeend", `<text x="${st.x + 26}" y="${st.y - 22}" class="tilt">${st.tilt}</text>`); }
  $("#pstep").innerHTML = `<b>Step ${AT.step + 1} of ${seq.length}</b> — ${st.l}`;
  markTrainee(T => { T.probe[AT.id] = true; });
}
function probeStep(d) { AT.step += d; drawProbe(); }
function probePlay() { if (AT.timer) { clearInterval(AT.timer); AT.timer = null; $("#pplay").textContent = "▶ Play"; return; } $("#pplay").textContent = "⏸ Pause"; AT.timer = setInterval(() => { AT.step++; drawProbe(); }, 2600); }
