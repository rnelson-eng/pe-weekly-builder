PE Weekly Builder — Phase 3 Modules
=====================================

This pack adds two modules to handle Docs:
- docs_template.js      → PE.DocTpl (create/fill lesson docs, inject PREP TODO, extract EQ)
- weekly_planner_doc.js → PE.WeeklyDoc (create/update the Weekly Planner doc)

How to install
--------------
1) Copy both .js files into your local repo next to code.js and previous modules.
2) Push to Apps Script:
   clasp push
3) Reload your Sheet.

Minimal integration edits (code.js)
-----------------------------------
A) When creating individual lesson docs:
   var lesson = PE.DocTpl.createLessonDoc({
     name: computedName,
     weekCode: weekCode,
     dayName: dayName,          // "Mon"..."Fri"
     dLabel: dLabel,            // "D12"
     title: title,
     dateStr: dateStr,
     classLength: minutes,
     standardsBlock: standardsBlock,
     targetFolderId: weekFolder.getId(),
     aiBody: aiGeneratedMarkdown // optional; can be empty string
   });
   PE.DocTpl.fillPlaceholders(lesson.docId, { ...same fields... });

B) To inject PREP TODO bullets after AI generation:
   PE.DocTpl.injectPrepTodo(lesson.docId, todoItemsArray);

C) To extract Essential Question from a lesson doc (for Pacing sync):
   var eq = PE.DocTpl.extractEQ(lesson.docId);

D) When building/updating the Weekly Planner doc:
   var wp = PE.WeeklyDoc.upsert(
     { weekCode: weekCode, weekFolderId: weekFolder.getId(), datesStr: dates },
     [
       { dayName:'Mon', dateStr:datesMon, title:titleMon, docUrl:lessonMon.url },
       // ...Tue..Fri
     ]
   );

Notes
-----
- WeeklyDoc.upsert() currently copies your lesson template to create the Weekly Planner. If you prefer a blank doc instead, we can change that easily.
- DocTpl.fillPlaceholders expects {{WEEK}}, {{DAYNAME}}, {{DLABEL}}, {{TITLE}}, {{DATE}}, {{CLASS_LENGTH}}, {{STANDARDS_BLOCK}}, and (optionally) {{AI_BODY}} marker in your template.
- All Drive sharing calls are wrapped; domain policy errors are ignored to keep flows running.
