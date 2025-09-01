/** Auto-migrated: Pacing */
var PE = PE || {};
PE.Pacing = (function () {
  // moved from global pe_pacingGetTables_
  function pe_pacingGetTables_(doc) {

  const body = doc.getBody();
  const out = [];
  for (let i=0; i<body.getNumChildren(); i++){
    const el = body.getChild(i);
    if (el.getType && el.getType() === DocumentApp.ElementType.TABLE){
      out.push(el.asTable());
    }
  }
  return out;

  }

  // moved from global pe_textOfCell_
  function pe_textOfCell_(cell) {

  // returns the concatenated text (trimmed) of a TableCell
  let s = "";
  for (let i=0;i<cell.getNumChildren();i++){
    const ch = cell.getChild(i);
    if (ch.editAsText) s += ch.asText().getText() + "\n";
  }
  return s.replace(/\s+$/,"").trim();

  }

  // moved from global pe_setCellTextOnce_
  function pe_setCellTextOnce_(cell, text) {

  // Only append if not already present (avoid duplicates)
  const current = pe_textOfCell_(cell);
  if (!String(text||"").trim()) return;
  if (current.indexOf(text) >= 0) return; // already there
  cell.appendParagraph(text);

  }

  // moved from global pe_setCellReplaceIfEmpty_
  function pe_setCellReplaceIfEmpty_(cell, text) {

  // Replace if the cell is empty; otherwise leave as-is
  const current = pe_textOfCell_(cell);
  if (current) return;
  cell.clear();
  cell.appendParagraph(text || "");

  }

  // moved from global pe_setWeekHyperlink_
  function pe_setWeekHyperlink_(cell, weekCode, url) {

  // Replace the cell text with a single linked run: Q1W1 → link to Weekly Planner
  cell.clear();
  const p = cell.appendParagraph(weekCode);
  const t = p.editAsText();
  t.setLinkUrl(0, weekCode.length-1, url || null);

  }

  // moved from global pe_findRowByWeek_
  function pe_findRowByWeek_(tables, weekCode) {

  for (const tbl of tables){
    for (let r=0; r<tbl.getNumRows(); r++){
      const row = tbl.getRow(r);
      const firstCell = row.getCell(0);
      const val = pe_textOfCell_(firstCell);
      if (val && val.replace(/\s+/g,"").toUpperCase() === String(weekCode).toUpperCase()){
        return { table: tbl, row: row };
      }
    }
  }
  return null;

  }

  // moved from global pe_updatePacingDocForWeek_
  function pe_updatePacingDocForWeek_(plan, datesStr, weeklyPlannerUrl, lessons) {

  if (!PE_PACING_DOC_ID) return;

  const doc = DocumentApp.openById(PE_PACING_DOC_ID);
  const tables = pe_pacingGetTables_(doc);
  const hit = pe_findRowByWeek_(tables, plan.weekCode);
  if (!hit) { Logger.log("Pacing row not found for "+plan.weekCode); return; }

  const row = hit.row;
  const IDX = PE_PACING_COL_IDX;

  // 1) Week cell → hyperlink to Weekly Planner
  pe_setWeekHyperlink_(row.getCell(IDX.WEEK), plan.weekCode, weeklyPlannerUrl);

  // 2) Dates cell → set if empty
  pe_setCellReplaceIfEmpty_(row.getCell(IDX.DATES), datesStr || plan.dates || "");

  // 3) Unit Name/Number → if empty, use the first day’s title (you can customize mapping later)
  const unitName = (plan.daily && plan.daily[0] && plan.daily[0].title) ? plan.daily[0].title : "";
  pe_setCellReplaceIfEmpty_(row.getCell(IDX.UNIT), unitName);

  // 4) EQ → read from the first lesson doc we just created (if present)
  let eq = "";
  if (lessons && lessons.length) eq = pe_extractEQFromLessonDoc_(lessons[0].id);
  pe_setCellReplaceIfEmpty_(row.getCell(IDX.EQ), eq);

  // 5) Standards → union of outcomes/competencies for the week (append if new)
  const allOutcomes = Array.from(new Set([].concat.apply([], (plan.daily||[]).map(d=>d.outcomes||[]))));
  const allComps    = Array.from(new Set([].concat.apply([], (plan.daily||[]).map(d=>d.competencies||[]))));
  const stdLine = (allOutcomes.length? ("OC: "+allOutcomes.join(", ")) : "") + (allComps.length? (" | CP: "+allComps.join(", ")) : "");
  if (stdLine) pe_setCellTextOnce_(row.getCell(IDX.STDS), stdLine);

  // 6) Lessons → append each lesson title once (avoid duplicates)
  const lessonsCell = row.getCell(IDX.LESSONS);
  (plan.daily||[]).forEach(function(d){
    if (d && d.title) pe_setCellTextOnce_(lessonsCell, d.title);
  });

  doc.saveAndClose();

  }

  return { pe_pacingGetTables_: pe_pacingGetTables_, pe_textOfCell_: pe_textOfCell_, pe_setCellTextOnce_: pe_setCellTextOnce_, pe_setCellReplaceIfEmpty_: pe_setCellReplaceIfEmpty_, pe_setWeekHyperlink_: pe_setWeekHyperlink_, pe_findRowByWeek_: pe_findRowByWeek_, pe_updatePacingDocForWeek_: pe_updatePacingDocForWeek_ };
})();
