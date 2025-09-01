PE Weekly Builder — Full Refactor Pack (Final)
=================================================

This archive consolidates all refactor chunks into a single, ready-to-push project.
It includes:
- code.js (final, menus + wiring)
- config.js
- utils.js
- drive.js
- weeks_sheet.js
- standards.js
- master_planner.js
- docs_template.js
- weekly_planner_doc.js
- pacing_sync.js
- todo_extractor.js
- ai_generator.js
- classroom.js
- weekly_builder.js
- diagnostics.js

How to install
--------------
1) Extract all files into your local project folder (next to your .clasp.json).
2) Open VS Code terminal and run:
   clasp push
3) Reload your bound Google Sheet and test via the "Weekly Builder" menu:
   - Diagnostics: checks config and template placeholders
   - Refresh Master Planner: ensures the planner sheet exists with headers
   - Build Week (Q1W1 demo): builds simple Mon–Fri lessons, a Weekly Planner doc, and attempts pacing sync

Before running, edit `config.js` and set your real IDs:
- LESSON_TEMPLATE_DOC_ID
- WEEKS_SHEET_ID and WEEKS_SHEET_NAME
- STANDARDS_SHEET_ID
- PACING_DOC_ID
- COURSE_TOP_FOLDER and YEAR_FOLDER_NAME (optional, if you need to change)

Notes
-----
- The AI generation module returns a fallback unless you wire an OpenAI key into Script Properties and implement UrlFetchApp calls.
- Classroom helpers require enabling the Advanced Classroom service.
- Pacing sync expects the first table in your pacing doc to have columns [Week | Dates | Unit | EQ | Standards | Lessons].
- All modules share the PE.* namespace and load in any order as long as there is no top-level execution. Keep functions only at top level.

Rollback
--------
You created a backup branch earlier. If you need to revert:
  git checkout backup-pre-refactor

Enjoy your cleaner, modularized project!
