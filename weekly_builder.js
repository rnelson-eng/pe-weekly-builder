
// weekly_builder.js — Optimized
var PE = PE || {};
PE.Weekly = (function(ns){
  function listWeekFiles_(folderId){
    const q = `'${folderId}' in parents and trashed=false`;
    const out = [];
    let pageToken;
    do {
      const resp = Drive.Files.list({
        q,
        pageToken,
        maxResults: 200,
        fields: 'items(id,title,mimeType,alternateLink),nextPageToken'
      });
      (resp.items||[]).forEach(f=>out.push(f));
      pageToken = resp.nextPageToken;
    } while(pageToken);
    return out;
  }

  ns.getAssetsForWeek = function(folderId){
    return listWeekFiles_(folderId).map(f=>({
      id:f.id,
      title:f.title,
      mimeType:f.mimeType,
      url:f.alternateLink
    }));
  };

  return ns;
})(PE.Weekly || {});
