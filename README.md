# PE Weekly Builder

A Google Apps Script + Google Drive automation tool for generating **weekly lesson plan documents** for *Principles of Engineering (175002)* at Heath High School.

---

## 🚀 What It Does
- Adds a **Weekly Builder** sidebar in Google Sheets.
- Reads **Weeks** (calendar) and **Standards** (outcomes/competencies) from Google Sheets.
- Suggests the **next untaught lessons** based on the Master Daily Plan.
- Auto‑selects **Outcomes** and **Competencies** per day.
- Copies a **lesson template Google Doc** and fills placeholders, then files docs into the correct **Google Drive** course folders.

---

## 📂 Repository Structure
- `Code.js` → Main Apps Script (backend functions, Drive/Docs logic, suggestions).
- `Sidebar.html` → Sidebar UI (front‑end, calls `google.script.run`).
- `appsscript.json` → Apps Script manifest (time zone, scopes).
- `.clasp.json` → clasp config (binds local repo to the Apps Script project).
- `.gitignore` → ignore rules.

---

## 🧩 Configuration (update these constants in `Code.js`)
```js
// Folders & titles
const PE_COURSE_TOP_FOLDER    = "Principles of Engineering";
const PE_YEAR_FOLDER_NAME     = "Principles of Engineering 2025-2026";
const PE_MASTER_SHEET_TITLE   = "Principles of Engineering – Master Daily Planner";

// Lesson template Doc (contains {{...}} placeholders)
const PE_LESSON_TEMPLATE_DOC_ID = "<your-template-doc-id>";

// Fixed Weeks Sheet (Q#W# and human‑readable Dates)
const PE_WEEKS_SHEET_ID   = "<your-weeks-sheet-id>";
const PE_WEEKS_SHEET_NAME = "Weeks"; // exact tab name

// Standards index (A..F: StrandCode | StrandName | OutcomeCode | OutcomeTitle | CompCode | CompText)
const PE_STANDARDS_SHEET_ID   = "<your-standards-sheet-id>";
const PE_STANDARDS_SHEET_TAB  = "Standards"; // exact tab name containing A..F
```

> **Master Daily Plan (sheet)** must include these headers in row 1 (or very similar):  
> **`Day #`**, **`Lesson Title`**, **`Outcome/Strand Codes`**, **`Taught?`**  
> The “Outcome/Strand Codes” cell is where you list items like `1.2, 1.2.3, 2.1.4a` (commas or spaces OK).

---

## 🛠️ One‑Time Setup
```bash
# Install clasp if needed
npm install -g @google/clasp

# Configure git identity (one time)
git config --global user.name "Russ Nelson"
git config --global user.email "YOUR_GITHUB_EMAIL@example.com"

# Make sure 'origin' is correct
git remote -v
git remote set-url origin https://github.com/rnelson-eng/pe-weekly-builder.git
```

---

## 🔁 Daily Workflow
1. **Sync with GitHub**
   ```bash
   git checkout main
   git pull --rebase origin main
   ```
2. **Edit code** locally (`Code.js`, `Sidebar.html`, etc.).
3. **Push to Apps Script for testing**
   ```bash
   clasp login         # first time only
   clasp push          # local → Apps Script
   clasp open          # open IDE to run/test
   ```
   *(If you edited directly in the online IDE, do `clasp pull` to bring changes down first.)*
4. **Commit & Push**
   ```bash
   git add -A
   git commit -m "feat: <short description>"
   git push origin main
   ```

---

## ▶️ Using the Sidebar
1. Open the **Master Daily Plan** sheet (`PE_MASTER_SHEET_TITLE`).  
2. Menu **Weekly Builder → Open Weekly Builder Sidebar** (or **Open Wide View**).  
3. Select your **Calendar Week**. Dates will populate from the **Weeks** sheet.  
4. Choose **Meeting Days** (Mon–Fri).  
5. Review the **Suggested** outcomes/competencies per day.  
6. Click **Preview** (optional), then **Build**.

**Suggestions logic:**  
- The app looks at the **Master Daily Plan** starting at the next untaught row.
- It parses the `Outcome/Strand Codes` cell to pre‑select Outcomes and Competencies.
- Outcomes and Competencies from suggestions are shown as already checked in the sidebar.

---

## 🧪 Placeholders in the Lesson Template Doc
Template fields the script replaces (examples):
- `{{WEEK}}` – Q#W# (from Weeks sheet)
- `{{DAYNAME}}` – Mon/Tue/Wed/Thu/Fri
- `{{DATE}}` – e.g., Aug 19
- `{{STANDARDS_BLOCK}}` – pretty‑printed standards list
- `{{AI_BODY}}` – AI‑generated body if enabled (optional)

---

## 🆘 Troubleshooting

### 1) Sidebar stuck at “Loading…”
Likely a JS error halted init. Fixed by ensuring **competencies render after the day cards are attached** to the DOM. Current `Sidebar.html` includes this fix (renders competencies *after* attaching the grid).

### 2) Outcomes show but **Competencies are blank** on first load
Cause: competencies were previously rendered **before** their box existed.  
Fix: current `Sidebar.html` defers `renderCompetencies(...)` until after the grid is in the DOM, and passes the **suggested competency list** so they appear and are pre‑checked immediately.

### 3) Competencies never appear (even after toggling an outcome)
Cause: standards catalog read the **wrong tab** (using `getActiveSheet()`).  
Fix: `Code.js` now uses `getSheetByName(PE_STANDARDS_SHEET_TAB)` for all standards reads. Ensure the tab name matches your sheet exactly and that columns A..F exist with the titles above.

### 4) Suggestions empty after header tweaks
Cause: “Master Daily Plan” headers changed (e.g., renamed `Outcome/Strand Codes`).  
Fix: Keep headers aligned to: `Day #`, `Lesson Title`, `Outcome/Strand Codes`, `Taught?`. If you must rename, update the header lookups in `Code.js` accordingly.

### 5) Template doesn’t fill values
- Confirm `PE_LESSON_TEMPLATE_DOC_ID` is correct and the placeholders exist.
- Confirm the **Week** and **Dates** are found (Weeks sheet ID & tab name correct).

---

## ✅ Commit Suggestions
```bash
git checkout -b fix/sidebar-autoselect
git add Sidebar.html
git commit -m "fix(sidebar): render competencies after DOM attach + precheck from suggestions"
git push -u origin fix/sidebar-autoselect
# open PR → merge
git checkout main && git pull --rebase && git branch -d fix/sidebar-autoselect
```

---

## 📌 Notes
- Keep a `docs/` folder (optional) with `.txt` copies of `Code.js` & `Sidebar.html` so they’re easy to preview in Drive and share in new ChatGPT threads.
- When starting a new chat, link this **README.md** and (optionally) the latest `docs/*.txt` files.

---

*Maintained by Russ Nelson – Heath High School*
