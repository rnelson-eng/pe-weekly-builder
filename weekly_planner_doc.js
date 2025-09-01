/** Auto-migrated: WeeklyDoc */
var PE = PE || {};
PE.WeeklyDoc = (function () {
  // moved from global upsertWeeklyPlannerDoc_
  function upsertWeeklyPlannerDoc_(weekFolder, plan) {

  const name = "Weekly Planner "+plan.weekCode;
  var it=weekFolder.getFilesByName(name);
  var doc = it.hasNext()? DocumentApp.openById(it.next().getId()) : DocumentApp.create(name);
  if(!it.hasNext()) DriveApp.getFileById(doc.getId()).moveTo(weekFolder);
  try{ DriveApp.getFileById(doc.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  var b=doc.getBody(); b.clear();
  b.appendParagraph("Weekly Planner — "+plan.weekCode).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  b.appendParagraph(plan.dates||"").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  b.appendParagraph("");
  var t=b.appendTable([["Day","Topic / Lesson Link","Competencies","Notes"]]); t.getRow(0).editAsText().setBold(true);
  var dayLabels=["Mon","Tue","Wed","Thu","Fri"];
  for (var i=0;i<dayLabels.length;i++){
    var d = dayLabels[i];
    var r=t.appendTableRow(); r.appendTableCell(d); r.appendTableCell(""); r.appendTableCell(""); r.appendTableCell("");
    if ((plan.meetDays||[]).indexOf(d)===-1) { for (var c=0;c<r.getNumCells();c++) r.getCell(c).setBackgroundColor("#f2f2f2"); }
  }
  doc.saveAndClose();
  return doc;

  }

  return { upsertWeeklyPlannerDoc_: upsertWeeklyPlannerDoc_ };
})();
