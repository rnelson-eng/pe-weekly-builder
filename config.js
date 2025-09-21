// config.js — Optimized + Legacy properties/aliases
var PE = PE || {};
PE.Config = (function(ns){
  let memo = null;
  ns.getAll = function(){
    if (memo) return memo;
    memo = {
      lessonTemplateId: typeof PE_LESSON_TEMPLATE_DOC_ID !== 'undefined' ? PE_LESSON_TEMPLATE_DOC_ID : '',
      weeksSheetId: typeof PE_WEEKS_SHEET_ID !== 'undefined' ? PE_WEEKS_SHEET_ID : '',
      weeksSheetName: typeof PE_WEEKS_SHEET_NAME !== 'undefined' ? PE_WEEKS_SHEET_NAME : 'Weeks',
      standardsSheetId: typeof PE_STANDARDS_SHEET_ID !== 'undefined' ? PE_STANDARDS_SHEET_ID : '',
      pacingDocId: typeof PE_PACING_DOC_ID !== 'undefined' ? PE_PACING_DOC_ID : '',
      courseTopFolder: typeof PE_COURSE_TOP_FOLDER !== 'undefined' ? PE_COURSE_TOP_FOLDER : 'Principles of Engineering',
      yearFolderName: typeof PE_YEAR_FOLDER_NAME !== 'undefined' ? PE_YEAR_FOLDER_NAME : 'Principles of Engineering 2025-2026'
    };
    return memo;
  };

  // Modern getters
  ns.getLessonTemplateId = ()=>ns.getAll().lessonTemplateId;
  ns.getWeeksSheetId = ()=>ns.getAll().weeksSheetId;
  ns.getWeeksSheetName = ()=>ns.getAll().weeksSheetName;
  ns.getStandardsSheetId = ()=>ns.getAll().standardsSheetId;
  ns.getPacingDocId = ()=>ns.getAll().pacingDocId;
  ns.getCourseTopFolder = ()=>ns.getAll().courseTopFolder;
  ns.getYearFolderName = ()=>ns.getAll().yearFolderName;

  // ---------- Legacy API (backward compatibility) ----------
  // Legacy property-style access
  ns.LESSON_TEMPLATE_DOC_ID = ns.getLessonTemplateId();
  ns.WEEKS_SHEET_ID = ns.getWeeksSheetId();
  ns.WEEKS_SHEET_NAME = ns.getWeeksSheetName();
  ns.STANDARDS_SHEET_ID = ns.getStandardsSheetId();
  ns.PACING_DOC_ID = ns.getPacingDocId();
  ns.COURSE_TOP_FOLDER = ns.getCourseTopFolder();
  ns.YEAR_FOLDER_NAME = ns.getYearFolderName();

  // Some legacy callsites expect an array path like ["Top", "Year"]
  ns.getCoursePathArray = function(){
    return [ ns.getCourseTopFolder(), ns.getYearFolderName() ];
  };
  ns.getCoursePathString = function(){
    return ns.getCoursePathArray().join('/');
  };
  // Legacy helpers
  ns.pe_getWeeksSheetMeta = function(){
    return { id: ns.getWeeksSheetId(), name: ns.getWeeksSheetName() };
  };

  return ns;
})(PE.Config || {});
