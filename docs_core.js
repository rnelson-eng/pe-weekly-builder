/** Auto-migrated: DocsCore */
var PE = PE || {};
PE.DocsCore = (function () {
  // moved from global pe_extractEQFromLessonDoc_
  function pe_extractEQFromLessonDoc_(docId) {

  try{
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    for (let i=0;i<body.getNumChildren();i++){
      const el = body.getChild(i);
      if (el.getType && el.getType() === DocumentApp.ElementType.PARAGRAPH){
        const p = el.asParagraph();
        const h = p.getHeading && p.getHeading();
        if (h === DocumentApp.ParagraphHeading.HEADING2 && /Essential Question/i.test(p.getText())){
          // next paragraph should be the EQ body
          if (i+1 < body.getNumChildren()){
            const next = body.getChild(i+1);
            if (next.getType() === DocumentApp.ElementType.PARAGRAPH){
              return next.asParagraph().getText().trim();
            }
          }
        }
      }
    }
  }catch(_){}
  return ""; // fallback

  }

  // moved from global insParagraph
  function insParagraph(txt, heading) {

    if (insertIndex==null) {
      const p = body.appendParagraph(txt);
      if (heading) p.setHeading(heading);
      return p;
    } else {
      const p = body.insertParagraph(++insertIndex, txt);
      if (heading) p.setHeading(heading);
      return p;
    }
  
  }

  // moved from global insList
  function insList(items, mode) {

    items = (items||[]).filter(function(x){ return x!=null && String(x).trim()!==""; });
    if (!items.length) return;
    var prefix = (mode === "checkbox") ? "☐ " : "";
    var glyph  = (mode === "number") ? DocumentApp.GlyphType.NUMBER
                                     : DocumentApp.GlyphType.BULLET;
    // first item
    var first = insParagraph(prefix + items[0]);
    first.setGlyphType && first.setGlyphType(glyph);
    for (var i=1;i<items.length;i++){
      var li = insParagraph(prefix + items[i]);
      li.setGlyphType && li.setGlyphType(glyph);
    }
  
  }

  // moved from global insBlank
  function insBlank() {
 insParagraph(""); 
  }

  // moved from global elToPara
  function elToPara(el) {
 while(el && el.getType && el.getType() !== DocumentApp.ElementType.PARAGRAPH){ el = el.getParent(); } return el && el.asParagraph(); 
  }

  // moved from global linkWeeklyPlanner_
  function linkWeeklyPlanner_(weeklyPlannerDoc, plan, created) {

  var doc=DocumentApp.openById(weeklyPlannerDoc.getId()); var b=doc.getBody();
  var byDay={}; created.forEach(x=>byDay[x.dayName]=x);
  var codesByDay={}; (plan.daily||[]).forEach(d=>codesByDay[d.dayName]=d.competencies||[]);
  for(var i=0;i<b.getNumChildren();i++){
    var el=b.getChild(i); if(el.getType()!==DocumentApp.ElementType.TABLE) continue;
    var tbl=el.asTable();
    for(var r=1;r<tbl.getNumRows();r++){
      var row=tbl.getRow(r); var day=row.getCell(0).getText().trim();
      var lesson=byDay[day];
      var topic=row.getCell(1); topic.clear();
      if(lesson){ var p=topic.appendParagraph(lesson.name); p.editAsText().setLinkUrl(0,lesson.name.length-1,lesson.url); }
      else topic.appendParagraph("(no class)");
      var comp=row.getCell(2); comp.clear();
      var codes=codesByDay[day]||[]; comp.appendParagraph(codes.length? codes.join(", "):"(none selected)");
    }
    break;
  }
  doc.saveAndClose();

  }

  return { pe_extractEQFromLessonDoc_: pe_extractEQFromLessonDoc_, insParagraph: insParagraph, insList: insList, insBlank: insBlank, elToPara: elToPara, linkWeeklyPlanner_: linkWeeklyPlanner_ };
})();
