/** drive.js — Hotfix v2: PE.Drive with helpers + legacy-named functions */
var PE = PE || {};

PE.Drive = (function () {
  /** Core helpers */
  function findOrCreateFolderByPath(pathArr) {
    if (!pathArr || !pathArr.length) throw new Error("pathArr required");
    var parent = DriveApp.getRootFolder();
    for (var i = 0; i < pathArr.length; i++) {
      var name = String(pathArr[i] || "").trim();
      if (!name) continue;
      var it = parent.getFoldersByName(name);
      parent = it.hasNext() ? it.next() : parent.createFolder(name);
    }
    return parent;
  }

  function getOrCreateSubfolder(parentId, name) {
    var parent = DriveApp.getFolderById(parentId);
    var it = parent.getFoldersByName(String(name || "").trim());
    return it.hasNext() ? it.next() : parent.createFolder(name);
  }

  function copyDocToFolder(templateDocId, newName, targetFolderId) {
    var t = DriveApp.getFileById(templateDocId);
    var folder = DriveApp.getFolderById(targetFolderId);
    var copy = t.makeCopy(String(newName || t.getName()), folder);
    return { fileId: copy.getId(), url: copy.getUrl() };
  }

  function setAnyoneWithLink(fileId) {
    try {
      DriveApp.getFileById(fileId).setSharing(
        DriveApp.Access.ANYONE_WITH_LINK,
        DriveApp.Permission.VIEW
      );
    } catch (e) {}
  }

  function findFileByName(folderId, name) {
    var folder = DriveApp.getFolderById(folderId);
    var it = folder.getFilesByName(String(name || "").trim());
    return it.hasNext() ? it.next() : null;
  }

  function trashAllByName(folderId, name) {
    var folder = DriveApp.getFolderById(folderId);
    var it = folder.getFilesByName(String(name || "").trim());
    var n = 0;
    while (it.hasNext()) { it.next().setTrashed(true); n++; }
    return n;
  }

  /** Legacy-named functions expected by existing code paths */
  function pe_getTopFolder_() {
    var top = (PE.Config && typeof PE.Config.getTopCourseFolder === "function")
      ? PE.Config.getTopCourseFolder()
      : (typeof COURSE_TOP_FOLDER !== "undefined" ? COURSE_TOP_FOLDER : "Principles of Engineering");
    return findOrCreateFolderByPath([top]);
  }

  function pe_getYearFolder_() {
    var top = (PE.Config && typeof PE.Config.getTopCourseFolder === "function")
      ? PE.Config.getTopCourseFolder()
      : (typeof COURSE_TOP_FOLDER !== "undefined" ? COURSE_TOP_FOLDER : "Principles of Engineering");
    var year = (PE.Config && typeof PE.Config.getYearFolderName === "function")
      ? PE.Config.getYearFolderName()
      : (typeof YEAR_FOLDER_NAME !== "undefined" ? YEAR_FOLDER_NAME : "Principles of Engineering 2025-2026");
    return findOrCreateFolderByPath([top, year]);
  }

  function pe_getWeekFolderByName_(name) {
    var yearFolder = pe_getYearFolder_();
    var f = getOrCreateSubfolder(yearFolder.getId(), String(name || "").trim());
    try { setAnyoneWithLink(f.getId()); } catch (e) {}
    return f;
  }

  return {
    // core helpers
    findOrCreateFolderByPath: findOrCreateFolderByPath,
    getOrCreateSubfolder: getOrCreateSubfolder,
    copyDocToFolder: copyDocToFolder,
    setAnyoneWithLink: setAnyoneWithLink,
    findFileByName: findFileByName,
    trashAllByName: trashAllByName,
    // legacy names used by existing flows
    pe_getTopFolder_: pe_getTopFolder_,
    pe_getYearFolder_: pe_getYearFolder_,
    pe_getWeekFolderByName_: pe_getWeekFolderByName_
  };
})();