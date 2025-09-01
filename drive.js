/** @file drive.gs — Drive helpers (folders/files, sharing, copies) */
var PE = PE || {};

PE.Drive = (function () {
  var U = PE.Utils;

  function findOrCreateFolderByPath(pathArr) {
    U.assert(Array.isArray(pathArr) && pathArr.length, 'findOrCreateFolderByPath: pathArr required');
    var parent = DriveApp.getRootFolder();
    for (var i = 0; i < pathArr.length; i++) {
      var name = String(pathArr[i]).trim();
      var it = parent.getFoldersByName(name);
      parent = it.hasNext() ? it.next() : parent.createFolder(name);
    }
    return parent;
  }

  function getOrCreateSubfolder(parentId, name) {
    var parent = DriveApp.getFolderById(parentId);
    var it = parent.getFoldersByName(name);
    return it.hasNext() ? it.next() : parent.createFolder(name);
  }

  function copyDocToFolder(templateDocId, newName, targetFolderId) {
    var t = DriveApp.getFileById(templateDocId);
    var folder = DriveApp.getFolderById(targetFolderId);
    var copy = t.makeCopy(newName, folder);
    return { fileId: copy.getId(), url: copy.getUrl() };
    }

  function setAnyoneWithLink(fileId) {
    try {
      DriveApp.getFileById(fileId).setSharing(
        DriveApp.Access.ANYONE_WITH_LINK,
        DriveApp.Permission.VIEW
      );
    } catch (e) {
      U.log('Sharing skipped:', e && e.message);
    }
  }

  function findFileByName(folderId, name) {
    var folder = DriveApp.getFolderById(folderId);
    var it = folder.getFilesByName(String(name).trim());
    return it.hasNext() ? it.next() : null;
  }

  function trashAllByName(folderId, name) {
    var folder = DriveApp.getFolderById(folderId);
    var it = folder.getFilesByName(String(name).trim());
    var n = 0;
    while (it.hasNext()) { it.next().setTrashed(true); n++; }
    return n;
  }

  return {
    findOrCreateFolderByPath: findOrCreateFolderByPath,
    getOrCreateSubfolder: getOrCreateSubfolder,
    copyDocToFolder: copyDocToFolder,
    setAnyoneWithLink: setAnyoneWithLink,
    findFileByName: findFileByName,
    trashAllByName: trashAllByName
  };
})();


