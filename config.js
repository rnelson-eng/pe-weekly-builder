/** @file config.gs — central config getters (Script Properties with fallbacks) */
var PE = PE || {};

PE.Config = (function () {
  var SP = PropertiesService.getScriptProperties();

  var DEFAULTS = {
    LESSON_TEMPLATE_ID: '<SET_LESSON_TEMPLATE_DOC_ID>',
    WEEKS_SHEET_ID: '<SET_WEEKS_SHEET_ID>',
    WEEKS_SHEET_NAME: 'Weeks',
    STANDARDS_SHEET_ID: '<SET_STANDARDS_SHEET_ID>',
    PACING_DOC_ID: '<SET_PACING_DOC_ID>',
    TOP_COURSE_FOLDER: 'Principles of Engineering',
    YEAR_FOLDER_NAME: 'Principles of Engineering 2025-2026',
    OPENAI_KEY_PROP: 'PE_OPENAI_KEY'
  };

  function getLessonTemplateId() { return SP.getProperty('PE_LESSON_TEMPLATE_DOC_ID') || DEFAULTS.LESSON_TEMPLATE_ID; }
  function getWeeksSheetId()      { return SP.getProperty('PE_WEEKS_SHEET_ID')       || DEFAULTS.WEEKS_SHEET_ID; }
  function getWeeksSheetName()    { return SP.getProperty('PE_WEEKS_SHEET_NAME')     || DEFAULTS.WEEKS_SHEET_NAME; }
  function getStandardsSheetId()  { return SP.getProperty('PE_STANDARDS_SHEET_ID')   || DEFAULTS.STANDARDS_SHEET_ID; }
  function getPacingDocId()       { return SP.getProperty('PE_PACING_DOC_ID')        || DEFAULTS.PACING_DOC_ID; }
  function getTopCourseFolder()   { return SP.getProperty('PE_TOP_COURSE_FOLDER')    || DEFAULTS.TOP_COURSE_FOLDER; }
  function getYearFolderName()    { return SP.getProperty('PE_YEAR_FOLDER_NAME')     || DEFAULTS.YEAR_FOLDER_NAME; }
  function getOpenAIKey()         { return SP.getProperty(DEFAULTS.OPENAI_KEY_PROP)  || ''; }

  function setLessonTemplateId(id){ SP.setProperty('PE_LESSON_TEMPLATE_DOC_ID', id); }
  function setWeeksSheetId(id)    { SP.setProperty('PE_WEEKS_SHEET_ID', id); }
  function setWeeksSheetName(n)   { SP.setProperty('PE_WEEKS_SHEET_NAME', n); }
  function setStandardsSheetId(id){ SP.setProperty('PE_STANDARDS_SHEET_ID', id); }
  function setPacingDocId(id)     { SP.setProperty('PE_PACING_DOC_ID', id); }
  function setTopCourseFolder(n)  { SP.setProperty('PE_TOP_COURSE_FOLDER', n); }
  function setYearFolderName(n)   { SP.setProperty('PE_YEAR_FOLDER_NAME', n); }
  function setOpenAIKey(k)        { SP.setProperty(DEFAULTS.OPENAI_KEY_PROP, k); }

  function getCoursePathArray() { return [getTopCourseFolder(), getYearFolderName()]; }

  return {
    getLessonTemplateId: getLessonTemplateId,
    getWeeksSheetId: getWeeksSheetId,
    getWeeksSheetName: getWeeksSheetName,
    getStandardsSheetId: getStandardsSheetId,
    getPacingDocId: getPacingDocId,
    getTopCourseFolder: getTopCourseFolder,
    getYearFolderName: getYearFolderName,
    getOpenAIKey: getOpenAIKey,
    getCoursePathArray: getCoursePathArray,
    setLessonTemplateId: setLessonTemplateId,
    setWeeksSheetId: setWeeksSheetId,
    setWeeksSheetName: setWeeksSheetName,
    setStandardsSheetId: setStandardsSheetId,
    setPacingDocId: setPacingDocId,
    setTopCourseFolder: setTopCourseFolder,
    setYearFolderName: setYearFolderName,
    setOpenAIKey: setOpenAIKey
  };
})();
