PE Weekly Builder — Phase 2 Modules
=====================================

This pack adds three new modules and shows how to wire them without breaking your current project.

Included files:
- weeks_sheet.js      → PE.Weeks (reads the Weeks sheet)
- standards.js        → PE.Standards (loads/validates standards)
- master_planner.js   → PE.MasterPlanner (builds planner, gets next untaught days)

How to install
--------------
1) Copy all three .js files into your local repo folder next to code.js (and utils.js/config.js/drive.js).
2) Push to Apps Script:
   clasp push
3) Reload your bound Google Sheet. Nothing should break yet.

Suggested minimal integration edits (code.js)
---------------------------------------------
A) Where your sidebar populates the "Week" dropdown, replace the Weeks lookup with:
   var weeksMap = PE.Weeks.getWeeksMap(); // { "Q1W1": "Aug 19–23", ... }

B) When you need the dates string for a selected week:
   var dates = PE.Weeks.getDatesForWeek(weekCode);

C) Replace your "Build/Refresh Master Daily Planner" entry point to call:
   PE.MasterPlanner.build();

D) When you compute the next K untaught days:
   var nextRows = PE.MasterPlanner.getNextUntaughtDays(5); // or desired count

E) When stamping completion into the planner (Week/Date/Taught?/Resource):
   PE.MasterPlanner.markAsTaught(rowIndex, weekCode, dateStr, resourceUrl);

F) For standards code validation (ensure competency codes belong to the selected outcome):
   var valid = PE.Standards.validateCodesForOutcome(outcomeCode, selectedCompCodes);
   // Use `valid` instead of raw selection

Notes
-----
- These modules are intentionally conservative: they won't alter your data unless called.
- MasterPlanner.build() currently only ensures headers; migrate your existing population logic into it when ready.
- Keep working in small steps: update one call site in code.js, push, test, repeat.

Rollback
--------
Since you created a backup branch, you can always recover:
   git checkout backup-pre-refactor
   git checkout -b restore-point
