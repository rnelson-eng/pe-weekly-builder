
// config.js — Optimized
var PE = PE || {};
PE.Config = (function(ns){
  let memo = null;
  ns.getAll = function(){
    if (memo) return memo;
    memo = {
      lessonTemplateId: PE_LESSON_TEMPLATE_DOC_ID,
      weeksSheetId: PE_WEEKS_SHEET_ID,
      weeksSheetName: PE_WEEKS_SHEET_NAME,
      standardsSheetId: PE_STANDARDS_SHEET_ID,
      pacingDocId: PE_PACING_DOC_ID,
      courseTopFolder: PE_COURSE_TOP_FOLDER,
      yearFolderName: PE_YEAR_FOLDER_NAME
    };
    return memo;
  };

  ns.getLessonTemplateId = ()=>ns.getAll().lessonTemplateId;
  ns.getWeeksSheetId = ()=>ns.getAll().weeksSheetId;
  ns.getWeeksSheetName = ()=>ns.getAll().weeksSheetName;
  ns.getStandardsSheetId = ()=>ns.getAll().standardsSheetId;
  ns.getPacingDocId = ()=>ns.getAll().pacingDocId;
  ns.getCourseTopFolder = ()=>ns.getAll().courseTopFolder;
  ns.getYearFolderName = ()=>ns.getAll().yearFolderName;

  return ns;
})(PE.Config || {});
