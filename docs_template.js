
// docs_template.js — Optimized
var PE = PE || {};
PE.DocTpl = (function(ns){
  ns.fillPlaceholders = function(docId, data){
    const token = ScriptApp.getOAuthToken();
    const reqs = Object.entries({
      '{{WEEK}}': data.weekCode,
      '{{DAYNAME}}': data.dayName,
      '{{DLABEL}}': data.dLabel,
      '{{TITLE}}': data.title,
      '{{DATE}}': data.dateStr,
      '{{CLASS_LENGTH}}': String(data.classLength||''),
      '{{STANDARDS_BLOCK}}': data.standardsBlock||'',
      '{{AI_BODY}}': data.aiBody||''
    }).map(([find, repl])=>({ replaceAllText:{ containsText:{ text:find, matchCase:true }, replaceText:repl }}));

    try {
      UrlFetchApp.fetch('https://docs.googleapis.com/v1/documents/'+docId+':batchUpdate',{
        method:'post',
        contentType:'application/json',
        payload: JSON.stringify({ requests:reqs }),
        headers:{ Authorization:'Bearer '+token }
      });
    } catch(e){
      // Fallback to DocumentApp if API call fails
      const doc = DocumentApp.openById(docId);
      const body = doc.getBody();
      for (const [find,repl] of Object.entries({
        '{{WEEK}}': data.weekCode,
        '{{DAYNAME}}': data.dayName,
        '{{DLABEL}}': data.dLabel,
        '{{TITLE}}': data.title,
        '{{DATE}}': data.dateStr,
        '{{CLASS_LENGTH}}': String(data.classLength||''),
        '{{STANDARDS_BLOCK}}': data.standardsBlock||'',
        '{{AI_BODY}}': data.aiBody||''
      })){
        body.replaceText(find, repl);
      }
      doc.saveAndClose();
    }
  };

  return ns;
})(PE.DocTpl || {});
