/** Auto-migrated: MasterPlanner */
var PE = PE || {};
PE.MasterPlanner = (function () {
  // moved from global pe_buildMasterDailyPlanner
  function pe_buildMasterDailyPlanner() {

  const ss = SpreadsheetApp.getActive();
  if (ss.getName() !== PE_MASTER_SHEET_TITLE) ss.rename(PE_MASTER_SHEET_TITLE);

  let sh = ss.getSheetByName("Master Daily Plan");
  if (!sh) sh = ss.insertSheet("Master Daily Plan"); else sh.clear();

  const headers = ["Day #","Lesson Title","Outcome/Strand Codes","Week Taught (Q#W#)","Date Taught","Taught?","Resources","Notes"];
  sh.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight("bold"); sh.setFrozenRows(1);

  const allDays = [].concat(PE_Q1_DAYS, PE_Q2_DAYS, PE_Q3_DAYS, PE_Q4_DAYS);
  const rows = allDays.map((d,i) => [ "D"+(i+1), d.title, (d.codes||[]).join(", "), "", "", "", "", "" ]);
  if (rows.length) sh.getRange(2,1,rows.length,headers.length).setValues(rows);
  sh.autoResizeColumns(1, headers.length);
  pe_toast_("Master Daily Plan refreshed ("+rows.length+" days).");

  }

  // moved from global buildDailyLessons_
  function buildDailyLessons_(weekFolder, plan, startIndex) {

  if(!PE_LESSON_TEMPLATE_DOC_ID) throw new Error("Set PE_LESSON_TEMPLATE_DOC_ID to your template Doc ID.");
  var out=[];
  for(var i=0;i<plan.daily.length;i++){
    var d=plan.daily[i], dnum=startIndex+i+1;
    var docName = "Lesson Plan — "+plan.weekCode+" — "+d.dayName+" — D"+dnum+" — "+d.title;

    // Replace existing (to avoid stale content)
    var existing = weekFolder.getFilesByName(docName);
    if (existing.hasNext()) { try{ existing.next().setTrashed(true);}catch(_){ } }

    var copy = DriveApp.getFileById(PE_LESSON_TEMPLATE_DOC_ID).makeCopy(docName, weekFolder);
    var docId = copy.getId();

    var doc = DocumentApp.openById(docId);
    var body = doc.getBody();

    var std = pe_renderStandards_(d.outcomes, d.competencies);

    var aiData = {};
    try{ if (pe_aiGetKey_()) aiData = pe_aiGenerateLesson_("D"+dnum, d.title, d.outcomes, d.competencies) || {}; }catch(e){ aiData = {}; }

    pe_fillPlaceholders_(body, {
      WEEK: plan.weekCode,
      DAYNAME: d.dayName,
      DLABEL: "D"+dnum,
      TITLE: d.title,
      DATE: plan.dates || "",
      CLASS_LENGTH: "45–55 min",
      STANDARDS_BLOCK: std,
      AI_BODY: "{{AI_BODY}}"
    });
    pe_insertStructuredLesson_(doc, aiData);

    doc.saveAndClose();
    try{ DriveApp.getFileById(docId).setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
    out.push({ name: docName, url: doc.getUrl(), dayName: d.dayName, dnum: dnum });
  }
  return out;

  }

  // moved from global stampMasterDailyPlan_
  function stampMasterDailyPlan_(startIndex, qweek, datesStr, lessons) {

  var ss=SpreadsheetApp.getActive(); var sh=ss.getSheetByName("Master Daily Plan"); if(!sh) return;
  var hdr=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  var cWeek=hdr.indexOf("Week Taught (Q#W#)")+1, cDate=hdr.indexOf("Date Taught")+1, cTaught=hdr.indexOf("Taught?")+1, cRes=hdr.indexOf("Resources")+1;
  lessons.forEach(function(d,i){
    var row = 2 + (startIndex+i);
    if(cWeek) sh.getRange(row,cWeek).setValue(qweek);
    if(cDate) sh.getRange(row,cDate).setValue(datesStr);
    if(cTaught) sh.getRange(row,cTaught).setValue("Yes");
    if(cRes) sh.getRange(row,cRes).setValue(d.url);
  });

  }

  // moved from global pe_getInitData
  function pe_getInitData() {

  const ss=SpreadsheetApp.getActive();
  let sh = ss.getSheetByName("Master Daily Plan");
  if(!sh) throw new Error("Master Daily Plan not found. Run the builder first.");
  const hdr=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]||[];
  const cDay=hdr.indexOf("Day #")+1, cTitle=hdr.indexOf("Lesson Title")+1, cCodes=hdr.indexOf("Outcome/Strand Codes")+1, cTaught=hdr.indexOf("Taught?")+1, cWeek=hdr.indexOf("Week Taught (Q#W#)")+1, cDate=hdr.indexOf("Date Taught")+1;
  const last=sh.getLastRow(); const rows=[];
  for(var r=2;r<=last;r++){
    rows.push({
      day: sh.getRange(r,cDay||1).getDisplayValue(),
      title: sh.getRange(r,cTitle||2).getDisplayValue(),
      codes: sh.getRange(r,cCodes||3).getDisplayValue(),
      taught: cTaught? sh.getRange(r,cTaught).getDisplayValue() : "",
      qweek: cWeek? sh.getRange(r,cWeek).getDisplayValue() : "",
      date: cDate? sh.getRange(r,cDate).getDisplayValue() : ""
    });
  }
  const nextIdx = rows.findIndex(x => !/^yes$/i.test(String(x.taught||"")));
  return { rows: rows, nextIndex: nextIdx>=0? nextIdx : 0 };

  }

  return { pe_buildMasterDailyPlanner: pe_buildMasterDailyPlanner, buildDailyLessons_: buildDailyLessons_, stampMasterDailyPlan_: stampMasterDailyPlan_, pe_getInitData: pe_getInitData };
})();
