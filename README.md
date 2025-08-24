# PE Weekly Builder

A Google Apps Script + Google Drive automation tool for generating **weekly lesson plan documents** for *Principles of Engineering (175002)* at Heath High School.

---

## 🚀 What It Does
- Adds a **sidebar UI** in Google Sheets to manage weekly lesson plans.
- Reads **Weeks** (calendar) and **Standards** (outcomes/competencies) from Google Sheets.
- Auto-selects the **next untaught outcomes/competencies** based on chosen teaching days.
- Copies a **lesson template Google Doc** and fills in placeholders (`{{week}}`, `{{dates}}`, `{{outcome}}`, etc.).
- Files the generated docs into the correct **Google Drive course folders**.

---

## 📂 Repository Structure
- `Code.js` → Main Apps Script code (backend functions, menu creation, Drive + Docs logic).
- `Sidebar.html` → Sidebar UI (front-end form, calls `google.script.run` to backend).
- `appsscript.json` → Manifest (scopes, settings for Apps Script).
- `.clasp.json` → Clasp config file (links local project to Google Apps Script project).
- `.gitignore` → Files to ignore in version control (node_modules, etc.).

---

## 🔧 Workflow

### One-Time Setup
```bash
# Configure Git identity
git config --global user.name "Russ Nelson"
git config --global user.email "YOUR_GITHUB_EMAIL@example.com"

# Point repo to GitHub
git remote set-url origin https://github.com/rnelson-eng/pe-weekly-builder.git
