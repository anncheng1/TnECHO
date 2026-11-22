/* TnECHO Measurement training lab — synthetic M-mode and Doppler tracings with known true values.
   Trainees place calipers; the app scores against the truth and shows the correct placement. */
"use strict";

const rr = (a, b) => a + Math.random() * (b - a);
const LW = 720, LH = 420;
/* systolic contraction profile: 0 at end-diastole (φ=0), 1 at end-systole (φ=ES) */
const ESP = 0.38;
function g(phi) { phi = ((phi % 1) + 1) % 1; if (phi <= ESP) return Math.pow(Math.sin(Math.PI * phi / (2 * ESP)), 2); if (phi <= ESP + 0.22) return Math.pow(Math.cos((phi - ESP) / 0.22 * Math.PI / 2), 2); return 0; }

function speckle(x, y, w, h, base, spread, dens) {
  const im = x.getImageData(0, 0, LW, LH), d = im.data;
  for (let j = Math.max(0, y | 0); j < Math.min(LH, y + h); j++) for (let i = Math.max(0, x | 0); i < Math.min(LW, x + w); i++) {
    if (Math.random() > dens) continue; const v = base + Math.random() * spread, k = (j * LW + i) * 4; d[k] = d[k + 1] = d[k + 2] = Math.min(255, v); d[k + 3] = 255; }
  x.putImageData(im, 0, 0);
}
function ecg(ctx, x0, w, T, pxs, y) {
  ctx.strokeStyle = "#4caf50"; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 0; i <= w; i++) { const t = i / pxs, ph = ((t % T) / T); let v = 0;
    if (ph < 0.02) v = -26 * Math.sin(ph / 0.02 * Math.PI); else if (ph > 0.3 && ph < 0.45) v = -6 * Math.sin((ph - 0.3) / 0.15 * Math.PI); else if (ph > 0.88 && ph < 0.95) v = -4 * Math.sin((ph - 0.88) / 0.07 * Math.PI);
    i ? ctx.lineTo(x0 + i, y + v) : ctx.moveTo(x0 + i, y + v); }
  ctx.stroke();
}
function label(ctx, t, x, y, col, al) { ctx.font = "12px system-ui"; ctx.fillStyle = col || "#ccc"; ctx.textAlign = al || "left"; ctx.fillText(t, x, y); }

/* ===== drill generators ===== */
const DRILLS = {
  lvmm: { t: "LV M-mode → LVIDd, LVIDs, FS", lvl: "L3", ref: [A(3, "FS from M-mode"), N("4.4", "LVEDD and LVESD on M-mode")],
    intro: "PLAX M-mode at the mitral leaflet tips. Measure LVIDd at end-diastole (start of QRS, largest cavity) and LVIDs at end-systole (smallest cavity), endocardium to endocardium.",
    gen() {
      const HR = rr(130, 170), T = 60 / HR, pxs = 420, mm = 8, x0 = 60, D = rr(12, 19), fs = rr(0.27, 0.42), Ds = D * (1 - fs), c = 34 * mm, t0 = rr(0.05, T * 0.6);
      const ySep = t => c - D * mm / 2 + 0.35 * (D - Ds) * mm * g((t - t0) / T), yPw = t => c + D * mm / 2 - 0.65 * (D - Ds) * mm * g((t - t0) / T);
      return { HR, T, pxs, x0, mm, t0, D, Ds, fs,
        draw(ctx) {
          ctx.fillStyle = "#000"; ctx.fillRect(0, 0, LW, LH);
          for (let i = 0; i < LW - x0; i++) { const t = i / pxs, ys = ySep(t), yp = yPw(t);
            const col = (y0, y1, b) => { for (let y = y0; y < y1; y += 1) { const v = b + Math.random() * 70; ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(x0 + i, y, 1, 1); } };
            col(ys - 70, ys - 4.5 * mm, 25); col(ys - 4.5 * mm, ys, 140); col(yp, yp + 4 * mm, 140); col(yp + 4 * mm + 6, yp + 4 * mm + 11, 200); }
          for (let d = 0; d <= 50; d += 5) { const y = d * mm; ctx.fillStyle = "#bbb"; ctx.fillRect(x0 - 12, y, d % 10 ? 6 : 10, 1); if (!(d % 10)) label(ctx, (d / 10) + "", x0 - 16, y + 4, "#bbb", "right"); }
          label(ctx, "cm", 8, 14); ecg(ctx, x0, LW - x0, T, pxs, LH - 22); label(ctx, `HR ${Math.round(HR)}`, LW - 8, 14, "#4caf50", "right");
        },
        tasks: [
          { key: "LVIDd", hint: "Tap the septal endocardium, then the posterior wall endocardium, at end-diastole.", axis: "v", unit: "mm", truth: D, tol: 1, timing: "ed" },
          { key: "LVIDs", hint: "Same walls at end-systole (smallest cavity, peak posterior wall excursion).", axis: "v", unit: "mm", truth: Ds, tol: 1, timing: "es" }],
        toVal(dpx) { return dpx / mm; },
        phase(x) { return ((((x - x0) / pxs - t0) / T) % 1 + 1) % 1; },
        answer(task) { // x of a correct beat & y of walls
          const k = Math.ceil((60 / pxs - t0) / T); const tt = t0 + k * T + (task.timing === "es" ? ESP * T : 0); const x = x0 + tt * pxs;
          return [{ x, y: ySep(tt) }, { x, y: yPw(tt) }]; },
        summary(v) { return v.LVIDd && v.LVIDs ? `Your FS = ${((v.LVIDd - v.LVIDs) / v.LVIDd * 100).toFixed(0)}% (true ${(fs * 100).toFixed(0)}%)` : ""; }
      };
    } },
  laao: { t: "M-mode → LA : Ao ratio", lvl: "L3", ref: [A(7, "LA:Ao by M-mode"), N("7.4", "M-mode LA:Ao")],
    intro: "PLAX M-mode through the aortic root and LA. Measure the aortic root at end-diastole and the LA at its maximum (end-systole), leading edge to leading edge.",
    gen() {
      const HR = rr(130, 170), T = 60 / HR, pxs = 420, mm = 9, x0 = 60, Ao = rr(6, 9), ratio = rr(1.05, 2.1), La = Ao * ratio, c = 18 * mm, t0 = rr(0.05, T * 0.6);
      const yA1 = t => c - 2 * mm * g((t - t0) / T), yA2 = t => yA1(t) + Ao * mm, yLA = t => yA2(t) + La * mm * (0.78 + 0.22 * g((t - t0) / T));
      return { HR, T, pxs, x0, mm, t0,
        draw(ctx) {
          ctx.fillStyle = "#000"; ctx.fillRect(0, 0, LW, LH);
          for (let i = 0; i < LW - x0; i++) { const t = i / pxs, a1 = yA1(t), a2 = yA2(t), la = yLA(t), ph = (((t - t0) / T) % 1 + 1) % 1;
            const col = (y0, y1, b, s) => { for (let y = y0; y < y1; y++) { const v = b + Math.random() * (s || 60); ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(x0 + i, y, 1, 1); } };
            col(a1 - 60, a1 - 3, 30); col(a1 - 3, a1 + 2, 190); col(a2 - 2, a2 + 3, 190); col(la, la + 3 * mm, 150); col(la + 3 * mm, la + 3 * mm + 5, 210);
            if (ph < ESP * 0.95) { const y1 = a1 + Ao * mm * 0.2, y2 = a2 - Ao * mm * 0.2; ctx.fillStyle = "#ddd"; ctx.fillRect(x0 + i, y1, 1, 2); ctx.fillRect(x0 + i, y2, 1, 2); } else { ctx.fillStyle = "#ddd"; ctx.fillRect(x0 + i, (a1 + a2) / 2, 1, 2); } }
          for (let d = 0; d <= 44; d += 5) { const y = d * mm; ctx.fillStyle = "#bbb"; ctx.fillRect(x0 - 12, y, d % 10 ? 6 : 10, 1); if (!(d % 10)) label(ctx, (d / 10) + "", x0 - 16, y + 4, "#bbb", "right"); }
          label(ctx, "cm", 8, 14); ecg(ctx, x0, LW - x0, T, pxs, LH - 22);
        },
        tasks: [
          { key: "Ao", hint: "Aortic root at end-diastole: leading edge of the anterior wall → leading edge of the posterior wall.", axis: "v", unit: "mm", truth: Ao, tol: 0.8, timing: "ed" },
          { key: "LA", hint: "LA at end-systole (maximal): leading edge of the posterior aortic wall → leading edge of the posterior LA wall.", axis: "v", unit: "mm", truth: La, tol: 1, timing: "es" }],
        toVal(dpx) { return dpx / mm; }, phase(x) { return ((((x - x0) / pxs - t0) / T) % 1 + 1) % 1; },
        answer(task) { const k = Math.ceil((60 / pxs - t0) / T); const tt = t0 + k * T + (task.timing === "es" ? ESP * T : 0), x = x0 + tt * pxs;
          return task.key === "Ao" ? [{ x, y: yA1(tt) }, { x, y: yA2(tt) }] : [{ x, y: yA2(tt) }, { x, y: yLA(tt) }]; },
        summary(v) { return v.Ao && v.LA ? `Your LA:Ao = ${(v.LA / v.Ao).toFixed(2)} (true ${ratio.toFixed(2)})` : ""; }
      };
    } },
  tapse: { t: "M-mode → TAPSE", lvl: "L3", ref: [A(12, "TAPSE"), N("4.9", "TAPSE by TDI M-mode and 2D M-mode")],
    intro: "RV-focused A4C, M-mode through the lateral tricuspid annulus. Measure from the end-diastolic position to peak systolic excursion.",
    gen() {
      const HR = rr(130, 170), T = 60 / HR, pxs = 420, mm = 14, x0 = 60, E = rr(4, 10.5), base = 24 * mm, t0 = rr(0.05, T * 0.6);
      const y = t => base - E * mm * g((t - t0) / T);
      return { HR, T, pxs, x0, mm, t0,
        draw(ctx) {
          ctx.fillStyle = "#000"; ctx.fillRect(0, 0, LW, LH);
          for (let i = 0; i < LW - x0; i++) { const t = i / pxs, yy = y(t);
            for (let j = 20; j < LH - 50; j++) { const dist = Math.abs(j - yy); let v = 20 + Math.random() * 40; if (dist < 5) v = 210 + Math.random() * 45; else if (dist < 14) v = 120 + Math.random() * 60; else if (j > yy) v = 60 + Math.random() * 60;
              ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(x0 + i, j, 1, 1); } }
          for (let d = 0; d <= 26; d += 5) { const yy = d * mm; ctx.fillStyle = "#bbb"; ctx.fillRect(x0 - 12, yy, 10, 1); label(ctx, (d / 10).toFixed(1), x0 - 16, yy + 4, "#bbb", "right"); }
          label(ctx, "cm", 8, 14); ecg(ctx, x0, LW - x0, T, pxs, LH - 22);
        },
        tasks: [{ key: "TAPSE", hint: "Tap the annulus at end-diastole (lowest point), then at peak systole (highest point).", axis: "v", unit: "mm", truth: E, tol: 0.8 }],
        toVal(dpx) { return dpx / mm; }, phase(x) { return ((((x - x0) / pxs - t0) / T) % 1 + 1) % 1; },
        answer() { const k = Math.ceil((60 / pxs - t0) / T); const t1 = t0 + k * T, t2 = t1 + ESP * T; return [{ x: x0 + t1 * pxs, y: y(t1) }, { x: x0 + t2 * pxs, y: y(t2) }]; },
        summary() { return ""; }
      };
    } },
  tr: { t: "CW Doppler → TR Vmax and RVSP", lvl: "L3", ref: [A(15, "RVSP from TR jet"), N("8.3", "TR colour and CW")],
    intro: "CW through the TR jet (flow away from the probe, below the baseline). Measure the peak velocity of a complete, well-defined envelope — ignore faint 'feathery' edges.",
    gen() {
      const HR = rr(130, 165), T = 60 / HR, pxs = 300, x0 = 60, b0 = 50, ppm = 66, V = rr(2.0, 4.6), t0 = rr(0.05, T * 0.6);
      const env = t => { const ph = (((t - t0) / T) % 1 + 1) % 1; if (ph < 0.03 || ph > 0.47) return 0; const u = (ph - 0.03) / 0.44; return V * Math.pow(Math.sin(Math.PI * u), 0.55) * (u < 0.5 ? 1 : 1 - 0.12 * (u - 0.5)); };
      return { HR, T, pxs, x0, t0,
        draw(ctx) {
          ctx.fillStyle = "#000"; ctx.fillRect(0, 0, LW, LH);
          for (let i = 0; i < LW - x0; i++) { const t = i / pxs, v = env(t), h = v * ppm;
            for (let j = 0; j < h + 8; j++) { let a = j < h ? 70 + Math.random() * 120 : (Math.random() < 0.25 ? 40 + Math.random() * 60 : 0); if (j > h - 6 && j < h) a = 150 + Math.random() * 100; if (!a) continue;
              ctx.fillStyle = `rgb(${a},${a},${a})`; ctx.fillRect(x0 + i, b0 + j, 1, 1); } }
          ctx.fillStyle = "#4fc3f7"; ctx.fillRect(x0, b0, LW - x0, 1);
          for (let v = 0; v <= 5; v += 0.5) { const yy = b0 + v * ppm; ctx.fillStyle = "#bbb"; ctx.fillRect(LW - 14, yy, Number.isInteger(v) ? 10 : 6, 1); if (Number.isInteger(v)) label(ctx, (-v) + "", LW - 18, yy + 4, "#bbb", "right"); }
          label(ctx, "m/s", LW - 8, 14, "#bbb", "right"); ecg(ctx, x0, LW - x0, T, pxs, 22);
        },
        tasks: [{ key: "TR Vmax", hint: "Tap the baseline, then the peak of the dense envelope.", axis: "v", unit: "m/s", truth: V, tol: 0.15, dp: 2 }],
        toVal(dpx) { return dpx / ppm; }, phase(x) { return 0; },
        answer() { const k = Math.ceil((60 / pxs - t0) / T); let best = 0, bx = 0; for (let tt = t0 + k * T; tt < t0 + k * T + 0.5 * T; tt += 0.001) { const v = env(tt); if (v > best) { best = v; bx = tt; } } const x = x0 + bx * pxs; return [{ x, y: b0 }, { x, y: b0 + best * ppm }]; },
        summary(v) { return v["TR Vmax"] ? `RVSP ≈ 4 × ${v["TR Vmax"].toFixed(2)}² + 5 = ${Math.round(4 * v["TR Vmax"] ** 2 + 5)} mmHg (true ${Math.round(4 * V * V + 5)})` : ""; }
      };
    } },
  paat: { t: "PW Doppler → PAAT and RVET", lvl: "L3", ref: [A(17, "PAAT, RVET and notching"), N("8.5", "Measuring PAAT and RVET")],
    intro: "PW in the main PA at the pulmonary valve tips (flow away, below the baseline). PAAT = onset → peak velocity; RVET = onset → end of ejection.",
    gen() {
      const HR = rr(130, 165), T = 60 / HR, pxs = 900, x0 = 40, b0 = 60, ppm = 200, Vp = rr(0.6, 1.1), at = rr(0.04, 0.1), et = rr(Math.max(0.17, at * 2.6), 0.26), t0 = rr(0.04, 0.12);
      const env = t => { const tt = ((t - t0) % T + T) % T; if (tt > et) return 0; if (tt < at) return Vp * Math.sin(Math.PI / 2 * tt / at); return Vp * Math.cos(Math.PI / 2 * (tt - at) / (et - at)); };
      return { HR, T, pxs, x0, t0,
        draw(ctx) {
          ctx.fillStyle = "#000"; ctx.fillRect(0, 0, LW, LH);
          for (let i = 0; i < LW - x0; i++) { const t = i / pxs, v = env(t), h = v * ppm; if (h <= 0) continue;
            for (let j = 0; j < h; j++) { const edge = h - j < 7; const a = edge ? 170 + Math.random() * 85 : (Math.random() < 0.35 ? 40 + Math.random() * 70 : 0); if (!a) continue; ctx.fillStyle = `rgb(${a},${a},${a})`; ctx.fillRect(x0 + i, b0 + j, 1, 1); } }
          ctx.fillStyle = "#4fc3f7"; ctx.fillRect(x0, b0, LW - x0, 1);
          for (let ms = 0; ms * pxs / 1000 < LW - x0; ms += 100) { const x = x0 + ms * pxs / 1000; ctx.fillStyle = "#ffeb3b"; ctx.fillRect(x, b0 - 14, 1, ms % 200 ? 4 : 8); }
          label(ctx, "time markers: 100 ms", x0, b0 - 22, "#ffeb3b");
          for (let v = 0; v <= 1.4; v += 0.2) { const yy = b0 + v * ppm; ctx.fillStyle = "#bbb"; ctx.fillRect(LW - 14, yy, 8, 1); label(ctx, (-v).toFixed(1), LW - 18, yy + 4, "#bbb", "right"); }
          label(ctx, "m/s", LW - 8, 14, "#bbb", "right"); ecg(ctx, x0, LW - x0, T, pxs, 24);
        },
        tasks: [
          { key: "PAAT", hint: "Tap the onset of flow, then the peak velocity (earliest part of the peak if it is rounded).", axis: "h", unit: "ms", truth: at * 1000, tol: 10, dp: 0 },
          { key: "RVET", hint: "Tap the onset of flow, then the end of ejection.", axis: "h", unit: "ms", truth: et * 1000, tol: 15, dp: 0 }],
        toVal(dpx) { return dpx / pxs * 1000; }, phase() { return 0; },
        answer(task) { const xs = x0 + t0 * pxs; return [{ x: xs, y: b0 }, { x: xs + (task.key === "PAAT" ? at : et) * pxs, y: b0 + (task.key === "PAAT" ? Vp * ppm : 0) }]; },
        summary(v) { return v.PAAT && v.RVET ? `Your PAAT:RVET = ${(v.PAAT / v.RVET).toFixed(2)} (true ${(at / et).toFixed(2)}); RVET/PAAT ${(v.RVET / v.PAAT).toFixed(1)} — normal < 4` : ""; }
      };
    } },
  pda: { t: "CW Doppler → PDA velocities", lvl: "L3", ref: [A(19, "Ductal flow patterns"), N("7.3", "Restrictive vs non-restrictive patterns")],
    intro: "CW through the duct at the pulmonary end (left-to-right flow toward the probe, above the baseline). Measure peak systolic and end-diastolic velocities.",
    gen() {
      const HR = rr(135, 170), T = 60 / HR, pxs = 300, x0 = 60, b0 = LH - 40, ppm = 90, Vs = rr(0.9, 3.0), Ved = Vs * rr(0.15, 0.6), t0 = rr(0.05, T * 0.6);
      const env = t => { const ph = (((t - t0) / T) % 1 + 1) % 1; const h = ph < 0.3 ? Math.sin(Math.PI / 2 * ph / 0.3) : Math.pow((1 - ph) / 0.7, 1.4); return Ved + (Vs - Ved) * (ph < 0.3 ? h : h); };
      return { HR, T, pxs, x0, t0,
        draw(ctx) {
          ctx.fillStyle = "#000"; ctx.fillRect(0, 0, LW, LH);
          for (let i = 0; i < LW - x0; i++) { const t = i / pxs, v = env(t), h = v * ppm;
            for (let j = 0; j < h + 6; j++) { let a = j < h ? 60 + Math.random() * 120 : (Math.random() < 0.2 ? 40 + Math.random() * 40 : 0); if (j > h - 5 && j < h) a = 160 + Math.random() * 90; if (!a) continue; ctx.fillStyle = `rgb(${a},${a},${a})`; ctx.fillRect(x0 + i, b0 - j, 1, 1); } }
          ctx.fillStyle = "#4fc3f7"; ctx.fillRect(x0, b0, LW - x0, 1);
          for (let v = 0; v <= 3.5; v += 0.5) { const yy = b0 - v * ppm; ctx.fillStyle = "#bbb"; ctx.fillRect(LW - 14, yy, Number.isInteger(v) ? 10 : 6, 1); if (Number.isInteger(v)) label(ctx, v + "", LW - 18, yy + 4, "#bbb", "right"); }
          label(ctx, "m/s", LW - 8, 14, "#bbb", "right"); ecg(ctx, x0, LW - x0, T, pxs, 24);
        },
        tasks: [
          { key: "Peak systolic", hint: "Tap the baseline, then the peak systolic velocity.", axis: "v", unit: "m/s", truth: Vs, tol: 0.15, dp: 2 },
          { key: "End-diastolic", hint: "Tap the baseline, then the velocity just before the next QRS (end-diastole).", axis: "v", unit: "m/s", truth: Ved, tol: 0.12, dp: 2, timing: "edd" }],
        toVal(dpx) { return dpx / ppm; }, phase(x) { return ((((x - x0) / pxs - t0) / T) % 1 + 1) % 1; },
        answer(task) { const k = Math.ceil((60 / pxs - t0) / T); const tt = t0 + k * T + (task.key === "Peak systolic" ? 0.3 * T : T * 0.995); const x = x0 + tt * pxs; return [{ x, y: b0 }, { x, y: b0 - env(tt) * ppm }]; },
        summary(v) { return v["Peak systolic"] ? `Peak gradient ≈ ${Math.round(4 * v["Peak systolic"] ** 2)} mmHg. ${Vs < 1.5 ? "Low-velocity (unrestrictive) pattern." : Vs > 2 ? "High-velocity (restrictive) pattern." : ""}` : ""; }
      };
    } }
};
const MISTAKES = [
  { t: "Oblique M-mode cursor", d: "A cursor that cuts the LV obliquely overestimates LVIDd/LVIDs and LA size. Align perpendicular to the septum and posterior wall; use 2D if you can't.", drill: "lvmm", fig: A(3, "FS from M-mode") },
  { t: "Wrong timing", d: "LVIDd belongs at end-diastole (QRS onset/largest cavity) and LVIDs at end-systole (smallest cavity). Measuring mid-cycle shrinks FS.", drill: "lvmm", fig: N("4.4", "LVEDD and LVESD") },
  { t: "LVOT at the leaflet tips", d: "Measure the annulus hinge-to-hinge in systole. Because output uses (d/2)², a 0.5 mm error in a 5 mm LVOT changes LVO by ~20%.", drill: null, fig: A(8, "LVO technique") },
  { t: "Angle correction / poor alignment", d: "Don't angle-correct cardiac Doppler. Misalignment underestimates velocity — TR, PDA and PI pressures will be falsely low.", drill: "tr", fig: N("8.3", "TR on colour and CW") },
  { t: "Measuring the feathery edge", d: "Measure the edge of the dense spectral envelope, not faint noise above it — this overestimates TR and PDA velocities.", drill: "tr", fig: A(15, "RVSP from TR jet") },
  { t: "PAAT to mid-peak", d: "If the peak is rounded, measure to its earliest point. Measuring to mid-peak lengthens PAAT and hides high PA pressure.", drill: "paat", fig: A(17, "PAAT and RVET") },
  { t: "PDA size on colour", d: "Colour bleeds beyond the walls and overestimates diameter — measure in 2D at the narrowest point, usually the pulmonary end.", drill: null, fig: A(18, "PDA diameter") },
  { t: "TAPSE off-axis", d: "If the cursor isn't aligned with annular motion TAPSE is underestimated. Use an RV-focused view and a high frame rate.", drill: "tapse", fig: A(12, "TAPSE") }
];

/* ===== UI ===== */
let LAB = null;
function renderMeasure() {
  const T = trainee(); const passed = new Set(T.drills.filter(d => d.ok).map(d => d.type));
  $("#labBody").innerHTML = `
   <p class="sub" style="margin:0 0 10px">Practise caliper placement on realistic tracings with known true values. Each attempt is scored instantly and the correct placement is shown. New values every time.</p>
   <div class="dlist">${Object.entries(DRILLS).map(([k, d]) => { const n = T.drills.filter(x => x.type === k), ok = n.filter(x => x.ok).length;
     return `<button onclick="startDrill('${k}')"><b>${d.t}</b><small>${n.length ? `${ok}/${n.length} passed` : "not tried"}</small><span class="dst ${passed.has(k) ? "ok" : ""}">${passed.has(k) ? "✓" : "›"}</span></button>`; }).join("")}</div>
   <h3 class="grp" style="margin-top:16px">⚠ Common measurement mistakes</h3>
   ${MISTAKES.map(m => `<div class="card mist"><b>${m.t}</b><p>${m.d}</p><div class="btns">${m.drill ? `<button class="btn ghost" onclick="startDrill('${m.drill}')">Practise</button>` : ""}<button class="btn ghost" onclick="atlasZoom('${imgFile(m.fig)}','${m.fig.cap}','${m.fig.src}','${m.fig.n}')">See correct plane</button></div></div>`).join("")}`;
}
function startDrill(k) {
  const d = DRILLS[k], m = d.gen(); LAB = { k, d, m, i: 0, pts: [], res: {}, done: false };
  $("#labBody").innerHTML = `<button class="back" onclick="renderMeasure()">‹ All drills</button>
   <h2 class="ah">${d.t}</h2><p class="sub">${d.intro}</p>
   <div class="labwrap"><canvas id="labCan" width="${LW}" height="${LH}"></canvas></div>
   <div class="labtask" id="labTask"></div>
   <div class="btns"><button class="btn ghost" onclick="labUndo()">↶ Undo</button><button class="btn ghost" onclick="startDrill('${k}')">New example</button>${d.ref.map(r => `<button class="btn ghost" onclick="atlasZoom('${imgFile(r)}','${r.cap}','${r.src}','${r.n}')">📖 ${imgLabel(r)}</button>`).join("")}</div>
   <div id="labFb"></div>`;
  const c = $("#labCan"); m.draw(c.getContext("2d")); LAB.base = c.getContext("2d").getImageData(0, 0, LW, LH);
  c.onpointerdown = e => { if (LAB.done) return; const r = c.getBoundingClientRect(); const p = { x: (e.clientX - r.left) * LW / r.width, y: (e.clientY - r.top) * LH / r.height };
    LAB.pts.push(p); if (LAB.pts.length === 2) { const t = m.tasks[LAB.i]; const [a, b] = LAB.pts; const dpx = t.axis === "h" ? Math.abs(b.x - a.x) : Math.abs(b.y - a.y);
      LAB.res[t.key] = { v: m.toVal(dpx), pts: [a, b], x: (a.x + b.x) / 2 }; LAB.i++; LAB.pts = []; if (LAB.i >= m.tasks.length) return labCheck(); }
    labDraw(); };
  labDraw();
}
function labUndo() { if (LAB.done) return; if (LAB.pts.length) LAB.pts = []; else if (LAB.i > 0) { LAB.i--; delete LAB.res[LAB.m.tasks[LAB.i].key]; } labDraw(); }
function labDraw(showAns) {
  const c = $("#labCan"), x = c.getContext("2d"); x.putImageData(LAB.base, 0, 0);
  const cal = (a, b, col, dash, axis, txt) => { x.save(); x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 2; x.setLineDash(dash ? [6, 4] : []);
    const b2 = axis === "h" ? { x: b.x, y: a.y } : axis === "v" ? { x: a.x, y: b.y } : b; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b2.x, b2.y); x.stroke();
    [a, b2].forEach(p => { x.beginPath(); x.moveTo(p.x - 7, p.y); x.lineTo(p.x + 7, p.y); x.moveTo(p.x, p.y - 7); x.lineTo(p.x, p.y + 7); x.stroke(); });
    if (txt) { x.font = "bold 13px system-ui"; const w = x.measureText(txt).width; x.fillStyle = "rgba(0,0,0,.75)"; x.fillRect(b2.x + 8, b2.y - 10, w + 8, 18); x.fillStyle = col; x.fillText(txt, b2.x + 12, b2.y + 4); } x.restore(); };
  LAB.m.tasks.forEach(t => { const r = LAB.res[t.key]; if (r) cal(r.pts[0], r.pts[1], "#4fc3f7", false, t.axis, `${t.key} ${r.v.toFixed(t.dp != null ? t.dp : 1)}`); });
  if (LAB.pts.length) { const p = LAB.pts[0]; x.fillStyle = "#4fc3f7"; x.beginPath(); x.arc(p.x, p.y, 5, 0, 7); x.fill(); }
  if (showAns) LAB.m.tasks.forEach(t => { const [a, b] = LAB.m.answer(t); cal(a, b, "#69f0ae", true, t.axis, `true ${t.truth.toFixed(t.dp != null ? t.dp : 1)}`); });
  const t = LAB.m.tasks[LAB.i];
  $("#labTask").innerHTML = LAB.done ? "" : `<b>Step ${LAB.i + 1}/${LAB.m.tasks.length} — ${t.key}</b><br>${t.hint}${LAB.pts.length ? " <i>(tap the second point)</i>" : ""}`;
}
function labCheck() {
  LAB.done = true; const m = LAB.m; let allOk = true, errs = [];
  const rows = m.tasks.map(t => { const r = LAB.res[t.key], err = r.v - t.truth, pe = Math.abs(err) / t.truth * 100; let ok = Math.abs(err) <= t.tol || pe <= 7, note = "";
    if (t.timing && m.phase) { const ph = m.phase(r.x);
      if (t.timing === "ed" && !(ph < 0.07 || ph > 0.93)) { ok = false; note = "Timing: measure at end-diastole (QRS onset, largest dimension)."; }
      if (t.timing === "es" && Math.abs(ph - ESP) > 0.09) { ok = false; note = "Timing: measure at end-systole (smallest cavity / maximal LA)."; }
      if (t.timing === "edd" && !(ph > 0.88 || ph < 0.04)) { ok = false; note = "Timing: end-diastolic velocity is just before the next QRS."; } }
    allOk = allOk && ok; errs.push(pe);
    return `<tr class="${ok ? "ok" : "bad"}"><td>${ok ? "✓" : "✗"} ${t.key}</td><td>${r.v.toFixed(t.dp != null ? t.dp : 1)}</td><td>${t.truth.toFixed(t.dp != null ? t.dp : 1)} ${t.unit}</td><td>${err >= 0 ? "+" : ""}${err.toFixed(t.dp != null ? t.dp : 1)}</td></tr>${note ? `<tr class="bad"><td colspan="4" style="font-size:12px">${note}</td></tr>` : ""}`; });
  const vals = {}; m.tasks.forEach(t => vals[t.key] = LAB.res[t.key].v);
  markTrainee(T => T.drills.push({ type: LAB.k, ok: allOk, err: Math.round(errs.reduce((a, b) => a + b, 0) / errs.length * 10) / 10, date: today() }));
  $("#labFb").innerHTML = `<div class="card labres ${allOk ? "pass" : "fail"}"><h2>${allOk ? "✓ Passed" : "Not quite — compare with the green calipers"}</h2>
    <table class="ocrt"><tr><th>Measurement</th><th>You</th><th>True</th><th>Error</th></tr>${rows.join("")}</table>
    <p class="sub" style="margin-top:8px">${m.summary(vals) || ""}</p><p class="sub" style="font-size:12px">Pass = within ${m.tasks.map(t => `${t.tol} ${t.unit}`).join(" / ")} (or 7%) at the right point in the cycle. Green dashed = correct placement.</p>
    <button class="btn" onclick="startDrill('${LAB.k}')">Try another</button></div>`;
  labDraw(true);
}
