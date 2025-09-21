// drive.js — Minimal helpers + Legacy aliases
var PE = PE || {};
PE.Drive = (function(ns){
  /**
   * Ensures a nested folder path exists; returns the last folder.
   * @param {string[]} pathArr e.g., ["Principles of Engineering","Principles of Engineering 2025-2026","Q1W2"]
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  ns.findOrCreateFolderByPath = function(pathArr){
    if (!Array.isArray(pathArr) || !pathArr.length) throw new Error('Path array required');
    var parent = DriveApp.getRootFolder();
    for (var i=0;i<pathArr.length;i++){
      var name = pathArr[i];
      if (!name) throw new Error('Invalid folder name at index '+i);
      var iter = parent.getFoldersByName(name);
      var next = iter.hasNext() ? iter.next() : parent.createFolder(name);
      parent = next;
    }
    return parent;
  };

  /**
   * Legacy: find/create week folder by its code under course/year path.
   * Returns a { folder, id, url, name } payload.
   */
  ns.pe_getWeekFolderByName_ = function(weekCode){
    var path = [ PE.Config.getCourseTopFolder(), PE.Config.getYearFolderName(), weekCode ];
    var folder = ns.findOrCreateFolderByPath(path);
    return {
      folder: folder,
      id: folder.getId(),
      url: 'https://drive.google.com/drive/folders/' + folder.getId(),
      name: folder.getName()
    };
  };

  // Utility: find a file by name in a folder (first match)
  ns.findFileByNameInFolder = function(folder, name){
    var it = folder.getFilesByName(name);
    return it.hasNext() ? it.next() : null;
  };

  return ns;
})(PE.Drive || {});
