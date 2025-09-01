/** Auto-migrated: Todo */
var PE = PE || {};
PE.Todo = (function () {
  // moved from global isNoiseTodoLine
  function isNoiseTodoLine(t) {

    var raw = String(t||"").trim();
    if (!raw) return true;
    raw = raw.replace(/^[\u2610\u2611\-\–\—•\u2022\.\s]+/, "").trim();
    if (!raw) return true;
    var lower = raw.toLowerCase();
    if (lower.length < 4) return true;
    if (/^(tbd|n\/a|na|none|placeholder)$/.test(lower)) return true;
    if (!/[a-z]/i.test(lower)) return true;
    if (/^[swx]+$/.test(lower) && lower.length <= 6) return true;
    var letters = lower.replace(/[^a-z]/g, "");
    if (letters.length >= 3) {
      var counts = {}; for (var i=0;i<letters.length;i++){ var ch = letters.charAt(i); counts[ch] = (counts[ch]||0)+1; }
      var max = 0; for (var k in counts){ if (counts[k] > max) max = counts[k]; }
      if (max / letters.length >= 0.8) return true;
    }
    if (!/[aeiou]/.test(lower) && lower.length <= 4) return true;
    return false;
  
  }

  // moved from global readPrepFromDoc
  function readPrepFromDoc(docId) {

    try{
      if (!docId) return [];
      var doc = DocumentApp.openById(docId);
      var body = doc.getBody();
      var n = body.getNumChildren();
      var hit = -1;
      for (var i=0;i<n;i++){
        var el = body.getChild(i);
        if (el && el.getType && el.getType() === DocumentApp.ElementType.PARAGRAPH){
          var para = el.asParagraph();
          var txt = (para.getText()||"").trim();
          if (/^PREP\s+TODO$/i.test(txt)){ hit = i; break; }
        }
      }
      if (hit < 0) return [];
      var out = [];
      for (var j=hit+1;j<n;j++){
        var el2 = body.getChild(j);
        if (!el2) break;
        if (el2.getType() === DocumentApp.ElementType.PARAGRAPH){
          var p2 = el2.asParagraph();
          var h = p2.getHeading();
          var t = (p2.getText()||"").trim();
          if (h === DocumentApp.ParagraphHeading.HEADING1 || h === DocumentApp.ParagraphHeading.HEADING2){ break; }
          if (t){ t = t.replace(/^[\u2610\s\-–—•\u2022]+/, '').trim(); if (!isNoiseTodoLine(t)) out.push(t); }
        } else if (el2.getType() === DocumentApp.ElementType.LIST_ITEM){
          var li = el2.asListItem();
          var lt = (li.getText()||"").trim();
          if (lt){ lt = lt.replace(/^[\u2610\s\-–—•\u2022]+/, '').trim(); if (!isNoiseTodoLine(lt)) out.push(lt); }
        }
      }
      return out.filter(Boolean);
    }catch(e){ Logger.log("readPrepFromDoc error: "+e); return []; }
  
  }

  // moved from global categorizePrepTasks
  function categorizePrepTasks(items) {

    var ai = [], manual = [];
    var rxAIHint = /\b(create|draft|write|design|generate|compose|worksheet|handout|reflection|exit\s*ticket|quiz|rubric|slides?)\b/i;
    (items||[]).forEach(function(s){
      var t = String(s||"").trim(); if (!t) return;
      if (isNoiseTodoLine(t)) return;
      if (/^AI\s*:/.test(t)) { ai.push(t.replace(/^AI\s*:/i,'' ).trim()); return; }
      if (rxAIHint.test(t)) ai.push(t); else manual.push(t);
    });
    return { ai: ai, manual: manual };
  
  }

  // moved from global pe_todoInit
  function pe_todoInit() {
 return { weeks: pe_collectWeeks_() }; 
  }

  // moved from global pe_todoLoadWeek
  function pe_todoLoadWeek(qweek) {

  var folder = pe_getWeekFolderByName_(qweek);
  var it = folder.getFiles();
  var lessons = [];
  while (it.hasNext()){
    var f = it.next(); var name = f.getName();
    if (/^Lesson Plan\s+—\s+/i.test(name) && name.indexOf("— "+qweek+" —")>=0){
      var dayMatch = name.match(/—\s*(Mon|Tue|Wed|Thu|Fri)\s*—/i);
      var dMatch = name.match(/—\s*D(\d+)\s*—/i);
      lessons.push({ id:f.getId(), url:f.getUrl(), name:name, dayName: (dayMatch?dayMatch[1]:""), dnum: (dMatch?Number(dMatch[1]):null) });
    }
  }
  lessons.sort(function(a,b){ return (a.dnum||0) - (b.dnum||0); });
  if (!lessons.length){
    var todoUrl = ""; try{ var itn = folder.getFilesByName("Weekly TODO — "+qweek); if (itn.hasNext()) todoUrl = DriveApp.getFileById(itn.next().getId()).getUrl(); }catch(_){}
    return { qweek:qweek, noLessons:true, ai:[], manual:[], todoUrl: todoUrl, folderUrl: folder.getUrl() };
  }
  var ai=[], manual=[];
  lessons.forEach(function(ls){
    var items = PE_TODO.readPrepFromDoc(ls.id) || [];
    items = (items||[]).filter(function(x){ return !PE_TODO.isNoiseTodoLine || !PE_TODO.isNoiseTodoLine(x); });
    var cat = PE_TODO.categorizePrepTasks(items);
    (cat.ai||[]).forEach(function(t){ ai.push({ day:ls.dayName, dnum:ls.dnum, task:t, lessonId:ls.id }); });
    (cat.manual||[]).forEach(function(t){ manual.push({ day:ls.dayName, dnum:ls.dnum, task:t }); });
  });
  var todoUrl = ""; try{ var it2 = folder.getFilesByName("Weekly TODO — "+qweek); if (it2.hasNext()) todoUrl = DriveApp.getFileById(it2.next().getId()).getUrl(); }catch(_){}
  return { qweek:qweek, ai:ai, manual:manual, todoUrl:todoUrl, folderUrl:folder.getUrl() };

  }

  // moved from global pe_todoGenerate
  function pe_todoGenerate(qweek, dnum, dayName, task) {

  var folder = pe_getWeekFolderByName_(qweek);
  var ctx = (typeof PE_getDayContextFromMaster_==='function'? PE_getDayContextFromMaster_(dnum) : { title:"", outcomes:[], competencies:[] });
  var meta = (typeof pe_getOutcomeMeta_==='function'? pe_getOutcomeMeta_() : {});
  var cat  = (typeof pe_getCompetencyCatalog_==='function'? pe_getCompetencyCatalog_() : {});
  var ocBlock = (ctx.outcomes||[]).map(function(oc){
    var m = meta[oc]||{};
    var comps = (cat[oc]||[]).filter(function(c){ return (ctx.competencies||[]).indexOf(c.code) >= 0; });
    var lines = comps.length ? comps.map(function(c){ return "• "+c.code+" — "+c.text; }).join("\\n") : "• (no specific competencies selected)";
    return (m.strandCode||"")+" — "+(m.strandName||"")+"\\n"+oc+" — "+(m.title||"")+"\\n"+lines;
  }).join("\\n\\n");
  var sys = {role:"system", content:"You are a CTE engineering teacher's assistant. Produce clean, student-facing plain text (no markdown). Keep it 1 page whenever possible."};
  var usr = {role:"user", content:"Create the following classroom asset as plain text for Google Docs.\\n"+
    "Task: "+task+"\\nWeek: "+qweek+"\\nDay: "+(dayName||"")+"\\nLesson Title: "+(ctx.title||"")+"\\n\\nStandards Context:\\n"+ocBlock+"\\n\\nRequirements:\\n- Be student-facing and actionable.\\n- Numbered prompts or sections when applicable.\\n- If relevant, include a simple 2–4 point rubric at the end.\\n- No markdown, no code fences, no links.\\n"};
  var raw = (typeof pe_aiCall_==='function'? (pe_aiCall_([sys, usr], false) || "") : "");
  raw = String(raw||"").trim() || ("Directions:\\n1) "+task+"\\n\\n(Add OPENAI_API_KEY to Script Properties to enable AI.)");
  var short = (typeof PE_TODO.prettyTaskLabel==='function'? PE_TODO.prettyTaskLabel(task, ctx.title || "Student Handout") : task);
  var name = "Asset — "+qweek+" — "+dayName+" — "+short;
  var it = pe_getWeekFolderByName_(qweek).getFilesByName(name);
  var doc = it.hasNext() ? DocumentApp.openById(it.next().getId()) : DocumentApp.create(name);
  if (!it.hasNext()) DriveApp.getFileById(doc.getId()).moveTo(pe_getWeekFolderByName_(qweek));
  try{ DriveApp.getFileById(doc.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  var b = doc.getBody(); b.clear();
  b.appendParagraph(short).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  b.appendParagraph((ctx.title||"")).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  b.appendParagraph(""); b.appendParagraph(raw);
  doc.saveAndClose();
  return { id: doc.getId(), url: doc.getUrl(), name: name };

  }

  // moved from global pe_todoGenerateAll
  function pe_todoGenerateAll(qweek, items) {

  var out = [];
  (items||[]).forEach(function(it){
    try{ var res = pe_todoGenerate(qweek, it.dnum, it.day, it.task); out.push({ ok:true, task:it.task, url:res.url, day:it.day, dnum:it.dnum }); }
    catch(e){ out.push({ ok:false, task:it.task, err:String(e) }); }
  });
  return out;

  }

  return { isNoiseTodoLine: isNoiseTodoLine, readPrepFromDoc: readPrepFromDoc, categorizePrepTasks: categorizePrepTasks, pe_todoInit: pe_todoInit, pe_todoLoadWeek: pe_todoLoadWeek, pe_todoGenerate: pe_todoGenerate, pe_todoGenerateAll: pe_todoGenerateAll };
})();
