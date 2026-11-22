# TnECHO Protocol — bedside PWA

A mobile-first, offline-capable checklist for **Targeted Neonatal Echocardiography (TnECHO)**, adapted from the
[NeoCardio Lab TnECHO Echocardiography Protocol](https://www.neocardiolab.com/tnecho-and-neonatal-hemodynamics/normal-neonatal-echocardiography/tnecho-echocardiography-protocol)
(Montreal Children's Hospital, Dr G. Altit).

## What's new in v3.0 — training programme
**Navigation:** six tabs — 📚 Learn · 🖼️ Atlas · 📏 Measure · 🧩 Case Lab · ✅ Assess · 👤 Portfolio — plus a green **▶ Scan** button in the header for bedside scans (Details · Steps · Report).

| Level | Training focus | Expected competency |
|---|---|---|
| 1 Foundation | Ultrasound physics, anatomy, orientation | Recognise cardiac structures |
| 2 Image acquisition | Standard views, probe handling, Doppler | Obtain reproducible views |
| 3 Measurement | LV/RV function, PDA, output, PA pressure | Perform accurate measurements |
| 4 Clinical integration | Haemodynamics and case interpretation | Formulate physiological assessment |

- **Learn:** the four levels with suggested criteria that fill in automatically (topics studied, atlas views explored, probe animations watched, scans logged, views acquired, drills passed, cases completed, supervisor-signed scans, level quiz ≥ 80%). Edit targets in `learn.js` → `TARGETS`.
- **Echo Atlas:** 9 standard views (PLAX, PSAX AV & papillary, A4C, A5C, subcostal, ductal, arch, high parasternal). Original labelled schematics — tap any structure for its explanation; animated probe position/rotation/tilt on an infant chest; reference and normal-vs-abnormal images; optional unit teaching loops (`atlas/loops.json`, see `atlas/loops/README.md`).
- **Measure:** practice lab with 6 drills on synthetic tracings with known true values (LV M-mode/FS, LA:Ao, TAPSE, TR Vmax/RVSP, PAAT/RVET, PDA velocities) — instant scoring including timing in the cardiac cycle, correct calipers overlaid; 8 common measurement mistakes; calculators.
- **Case Lab:** 5 cases (hsPDA, PPHN, transitional low flow, PICC tamponade, warm shock) with staged questions, feedback and physiological summaries.
- **Assess:** level quizzes (10 random questions from a bank per level, pass 80%) and a mixed image quiz.
- **My Portfolio:** profile, competency dashboard (scans, supervised/independent, signed-off, clip quality, drills, cases, views acquired, levels), per-study supervisor review with drawn signature, level sign-off, downloadable training portfolio PDF; logbook and CSV.

Sign-offs are recorded on the trainee's device as entered by the supervisor; they are not cryptographically verified.

## What's new in v2.1 — simpler, beginner-friendly UI
- **Bottom tab bar:** Home · Scan · Learn · Tools · Logbook (Report, Approach and About open from buttons, each with a back link).
- **Home:** first-run welcome guide, current-scan card with progress ring and one big *Continue scan* button, quick-action tiles.
- **Guided scan:** one view at a time, view chips with ✓ when done, *Previous / Next view*, *Finish & see report*; "📖 How to get this view" links each view to its probe-position card; comfort checklist under *Before you start*.
- **Cleaner step cards:** larger tick boxes; one action row (Learn · Clip · Note · N/A); modality tags hidden in Beginner mode.
- **Baby details:** essentials first; logbook and clinical fields under an optional section.
- **Tools:** six key calculators first, the rest under *More calculators*.
- **Learn:** "New to neonatal echo? Start here" 5-step path.

## What's new in v2.0
- **Beginner mode (default):** 19 core steps in plain language, each with a one-line "why". Switch to *Full protocol* for all 70 steps.
- **Clips & images:** record video, photograph the echo screen, or upload screenshots — per protocol step or for the whole study. Videos: capture any frame as a still.
- **Measuring from images:**
  - *Read values* — on-device OCR reads the echo machine's measurement panel (e.g. `LVIDd 1.45 cm`, `TR Vmax 3.1 m/s`, `PAAT 52 ms`), converts units and proposes the matching calculator field. You confirm each value.
  - *Calipers* — set a scale from the depth ticks (distance), Doppler scale (velocity) or time markers, then tap two points.
  - *Redact* — permanently black out names/IC numbers.
- **Logbook:** every study is saved automatically; open, continue or delete; level of involvement, supervisor and case number; summary counts; CSV export of all cases.
- **PDF report per study** for the training logbook: details, key measurements, findings, impression/plan, step notes, protocol completeness, annotated images with captions, and a sign-off block.

## Features
- **Study tab** – study/bed ID, GA, DOL, weight, HR, BP, saturations, indication, clinical findings; pre-scan comfort checklist.
- **Protocol tab** – all 8 views in acquisition order (PLAX → PSAX → Apical → Subcostal → Suprasternal → PDA → Branch PAs/crab → Head US) with modality tags (2D, Colour, PW, CW, M-mode, TDI, 3D), "if present" flags, per-step notes, N/A marking, progress bar and a **Next step** button.
- **Scan timer** – starts on the first ticked step; turns amber at 15 min and red at 30 min. Tap to pause, long-press to reset.
- **Calculators** – LVO/RVO (mL/kg/min), LA:Ao, FS, PAAT:RVET, RVSP from TR jet (with RVSP:SBP), PA diastolic/mean pressure from the PI jet, LV eccentricity index, PDA (mm/kg, gradient, peak:EDV, PA systolic pressure from the ductal shunt, NPE moderate/large grading), TAPSE / RV FAC, E/A and E/e′, RI/PI. ASE 2024 reference ranges shown where the guideline gives them.
- **Report tab** – segmental findings + impression/plan → auto-assembled text report with key measurements, step notes and protocol completeness. Copy, print/PDF or download .txt.
- **Training tab** – 43 topics with 89 annotated images from the 2024 ASE TNE guideline (McNamara et al., JASE 2024;37:171–215) and the NPE Teaching Manual (El-Khuffash, 2019). Covers echo windows and probe positions, artefacts, LV/RV function, systemic flow (incl. SVC flow), pulmonary haemodynamics/PPHN, PDA (incl. moderate/large grading table), lines and safety, TDI/strain, and normative value tables. Each topic gives the clip to acquire, probe position, how to measure, formula, normal values, notes from the manual and pitfalls. Includes an image gallery, swipeable full-screen viewer, category filters, search, a quiz (including image questions) and a *Save images for offline* button. Protocol steps and calculators link to the relevant topic.
- **Approach tab** – six-step haemodynamic evaluation framework.
- All data stays in the browser (`localStorage` + IndexedDB); nothing is transmitted. Clearing browser/site data deletes the logbook — export PDFs and the CSV regularly.

## Deploy to GitHub Pages
1. Create a repo, named `TnECHO` under your account (`anncheng1`).
2. Upload all files in this folder to the repo root: `index.html`, `training.js`, `cases.js`, `learn.js`, `atlas.js`, `lab.js`, `cases_lab.js`, `portfolio.js`, the `atlas/` folder, the `vendor/` folder (jsPDF and Tesseract.js OCR, with licences), the `fig/` folder (26 ASE images plus `fig/npe/` with 63 manual images), `manifest.json`, `sw.js`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png`, `favicon-32.png`, `README.md`.
3. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)`** → Save.
4. After ~1 minute the app is live at `https://anncheng1.github.io/TnECHO/ (the path is case-sensitive)`.
5. On phones: Chrome menu → *Install app*; Safari → Share → *Add to Home Screen*.

## Icons
- `apple-touch-icon.png` (180×180) is what iPhone uses for *Add to Home Screen*; iOS rounds the corners itself.
- `icon-maskable-*.png` have a safe-zone margin so Android launchers don't crop the "TnECHO" wordmark.
- To replace the logo, regenerate all PNGs at the same sizes and bump the version.
- If an iPhone still shows the old icon, delete the home-screen icon and add it again (iOS caches it).

## Updating
Edit files, then bump `CACHE` in `sw.js` (e.g. `tnecho-v1.0.1`) and `APP_VERSION` in `index.html` so installed copies refresh.

## Limitations of automatic values
The app does **not** interpret raw echo images by itself. It reads numbers the echo machine has already measured (OCR), or measures what you mark with calibrated calipers. OCR accuracy depends on photo quality — photograph the screen straight-on, fill the frame with the measurement panel (or use *Select panel*), avoid glare. Screenshots/exports from the machine work best. Every value must be checked before it is used clinically.

## Known gap
PSAX item **2e** was not present in the source page when this was built; it appears as "refer to source protocol". Check the protocol PDF linked from the source page and edit the `P` array in `index.html` to add it.

## Figure permissions
- `fig/fig01–26.jpg`: © 2023 American Society of Echocardiography, published by Elsevier Inc. — used under the reuse permission held by the app owner.
- `fig/npe/`: from El-Khuffash A (ed), *NPE Teaching Manual*, 2019 edition (The Rotunda Hospital, Dublin) — used with the author's permission. Figures the manual marks as reproduced from third parties (Rovner) are **not** included.

Keep copies of both permissions. Credit lines are set in `SRC` at the top of `training.js` — edit them to match the exact wording each permission requires. If either permission doesn't cover public web display, make the repo private or remove `fig/`.

## Formulas
- Output (mL/kg/min) = VTI (cm) × π × (d/2)² (cm²) × HR ÷ weight (kg)
- FS = (LVIDd − LVIDs) / LVIDd × 100
- RVSP = 4 × TR Vmax² + RAP
- RV FAC = (EDA − ESA) / EDA × 100
- RI = (PSV − EDV) / PSV; PI = (PSV − EDV) / mean velocity
- PADP = 4 × PI end-diastolic V² + RAP; mPAP = ⅓ RVSP + ⅔ PADP (RAP default 5 mmHg)
- LV eccentricity index = D2 ÷ D1 at end-systole
- PASP from PDA: SBP − 4V² (L→R peak) or SBP + 4V² (R→L peak, if R→L ≥ 30% of cycle)

## Where the sources differ
The cards show both values where the ASE 2024 guideline and the 2019 NPE manual disagree: FS (30–45% vs 28–40%), EF (55–70% vs 55–65%), LVO (150–300 vs 170–320 mL/kg/min), RV FAC (≥ 35% vs 25–40%), and whether RV trabeculations are included in the FAC trace (ASE excludes, NPE includes). Agree a single unit standard.

## Disclaimer
Educational and workflow aid only — not a medical device. Verify all calculations; interpretation is the responsibility of the performing clinician and should follow local unit guidance.
