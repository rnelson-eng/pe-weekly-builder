/** diagnostics.js — Quick checks for config, template placeholders, scopes */
var PE = PE || {};

PE.Diag = (function () {
  function runAll() {
    var msgs = [];
    // Check IDs present
    ["LESSON_TEMPLATE_DOC_ID","WEEKS_SHEET_ID","STANDARDS_SHEET_ID","PACING_DOC_ID"].forEach(function (k) {
      if (!PE.Config[k]) msgs.push("Missing PE.Config." + k);
    });

    // Check template placeholders exist
    try {
      var doc = DocumentApp.openById(PE.Config.LESSON_TEMPLATE_DOC_ID);
      var body = doc.getBody();
      ["WEEK","DAYNAME","DLABEL","TITLE","DATE","CLASS_LENGTH","STANDARDS_BLOCK"].forEach(function (p) {
        var found = body.findText("{{" + p + "}}");
        if (!found) msgs.push("Template missing {{" + p + "}}");
      });
    } catch (e) {
      msgs.push("Template doc check failed: " + e.message);
    }

    return msgs.length ? msgs : ["Diagnostics OK"];
  }

  return { runAll: runAll };
})();