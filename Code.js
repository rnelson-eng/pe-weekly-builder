/***** ===================== CONFIG ===================== *****/
const PE_COURSE_TOP_FOLDER    = "Principles of Engineering";
const PE_YEAR_FOLDER_NAME     = "Principles of Engineering 2025-2026";
const PE_MASTER_SHEET_TITLE   = "Principles of Engineering – Master Daily Planner";

// Lesson template Doc (contains {{WEEK}}, {{DAYNAME}}, {{DLABEL}}, {{TITLE}}, {{DATE}}, {{CLASS_LENGTH}}, {{STANDARDS_BLOCK}}, {{AI_BODY}})
const PE_LESSON_TEMPLATE_DOC_ID = "1IoTgXeHP31-EihSmX99XVWSuTTvYfp2HSJa19PVMTR0";

// Fixed Weeks Sheet (tab with columns: Week | Dates, header on row 1)
const PE_WEEKS_SHEET_ID   = "1Pi8sbdJSIx_yqN5IIDbRsB7Zekmt-VlP8jyl3nzbvuo";
const PE_WEEKS_SHEET_NAME = "Weeks";

// Standards index (A..F: StrandCode | StrandName | OutcomeCode | OutcomeTitle | CompCode | CompText)
const PE_STANDARDS_SHEET_ID = "1kQyTQBxjXjMmN0a0ICrlr0x-k6r_PQN2jpYyDFczQaE";

// AI model
const PE_AI_MODEL = "gpt-4o-mini";

/***** ===================== MENUS & UI ===================== *****/
function onOpen(){
  SpreadsheetApp.getUi()
    .createMenu("Weekly Builder")
    .addItem("Build/Refresh Master Daily Planner (D1…)", "pe_buildMasterDailyPlanner")
    .addItem("Open Weekly Builder Sidebar", "pe_openSidebar")
    .addItem("Open Weekly Builder (Wide)", "pe_openDialogWide")
    .addSeparator()
    .addSubMenu(SpreadsheetApp.getUi().createMenu("AI Settings")
      .addItem("Enter OpenAI API Key", "pe_aiPromptForKey")
      .addItem("Run AI Diagnostics", "pe_aiDiagnostics"))
    .addToUi();


SpreadsheetApp.getUi()
  .createMenu("Weekly To‑Do")
  .addItem("Open Weekly To‑Do (Sidebar)", "pe_openTodoSidebar")
  .addItem("Open Weekly To‑Do (Wide)", "pe_openTodoDialogWide")
  .addToUi();

SpreadsheetApp.getUi()
  .createMenu("Classroom")
  .addItem("Open Classroom Planner (Wide)", "pe_openClassroomPlannerDialogWide")
  .addToUi();
}
function pe_openSidebar(){
  const html = HtmlService.createTemplateFromFile("Sidebar").evaluate().setTitle("Weekly Builder");
  SpreadsheetApp.getUi().showSidebar(html);
}
function pe_openDialogWide(){
  const html = HtmlService.createTemplateFromFile("Sidebar").evaluate().setTitle("Weekly Builder (Wide)").setWidth(1100).setHeight(820);
  SpreadsheetApp.getUi().showModelessDialog(html, "Weekly Builder (Wide)");
}
function pe_toast_(m){ try{ SpreadsheetApp.getActive().toast(m,"Weekly Builder",5);}catch(_){} }

/***** ===================== FOLDER HELPERS ===================== *****/
function pe_getSingle_(it, err){ if(!it.hasNext()) throw new Error(err); return it.next(); }
function pe_getTopFolder_(){ return pe_getSingle_(DriveApp.getFoldersByName(PE_COURSE_TOP_FOLDER), "Top folder not found: "+PE_COURSE_TOP_FOLDER); }
function pe_getYearFolder_(){ const top=pe_getTopFolder_(); return pe_getSingle_(top.getFoldersByName(PE_YEAR_FOLDER_NAME), "Year folder not found: "+PE_YEAR_FOLDER_NAME); }
function pe_getWeekFolderByName_(name){
  const y=pe_getYearFolder_(); const it=y.getFoldersByName(name);
  const f = it.hasNext()? it.next() : y.createFolder(name);
  try{ f.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  return f;
}

/***** ===================== WEEKS (from fixed Sheet) ===================== *****/
function pe_loadWeeksFromSheet_(){
  const sh = SpreadsheetApp.openById(PE_WEEKS_SHEET_ID).getSheetByName(PE_WEEKS_SHEET_NAME);
  if (!sh) throw new Error("Weeks sheet not found: "+PE_WEEKS_SHEET_NAME);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const vals = sh.getRange(2,1,last-1,2).getValues(); // Week | Dates
  return vals
    .filter(r => String(r[0]||"").trim())
    .map(r => ({ week:String(r[0]).trim(), dates:String(r[1]||"").trim() }));
}
function pe_collectWeeks_(){ return pe_loadWeeksFromSheet_(); }
function pe_getDatesForWeek(weekCode){
  const list = pe_loadWeeksFromSheet_();
  const hit = (list||[]).find(w => w.week===weekCode);
  return hit ? (hit.dates||"") : "";
}

/***** ===================== MASTER DAILY PLAN ===================== *****/
function pe_buildMasterDailyPlanner(){
  const ss = SpreadsheetApp.getActive();
  if (ss.getName() !== PE_MASTER_SHEET_TITLE) ss.rename(PE_MASTER_SHEET_TITLE);

  let sh = ss.getSheetByName("Master Daily Plan");
  if (!sh) sh = ss.insertSheet("Master Daily Plan"); else sh.clear();

  const headers = ["Day #","Lesson Title","Outcome/Strand Codes","Week Taught (Q#W#)","Date Taught","Taught?","Resources","Notes"];
  sh.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight("bold"); sh.setFrozenRows(1);

  const allDays = [].concat(PE_Q1_DAYS, PE_Q2_DAYS, PE_Q3_DAYS, PE_Q4_DAYS);
  const rows = allDays.map((d,i) => [ "D"+(i+1), d.title, (d.codes||[]).join(", "), "", "", "", "", "" ]);
  if (rows.length) sh.getRange(2,1,rows.length,headers.length).setValues(rows);
  sh.autoResizeColumns(1, headers.length);
  pe_toast_("Master Daily Plan refreshed ("+rows.length+" days).");
}
function pe_getInitData(){
  const ss=SpreadsheetApp.getActive();
  let sh = ss.getSheetByName("Master Daily Plan");
  if(!sh) throw new Error("Master Daily Plan not found. Run the builder first.");
  const hdr=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]||[];
  const cDay=hdr.indexOf("Day #")+1, cTitle=hdr.indexOf("Lesson Title")+1, cCodes=hdr.indexOf("Outcome/Strand Codes")+1, cTaught=hdr.indexOf("Taught?")+1, cWeek=hdr.indexOf("Week Taught (Q#W#)")+1, cDate=hdr.indexOf("Date Taught")+1;
  const last=sh.getLastRow(); const rows=[];
  for(var r=2;r<=last;r++){
    rows.push({
      day: sh.getRange(r,cDay||1).getDisplayValue(),
      title: sh.getRange(r,cTitle||2).getDisplayValue(),
      codes: sh.getRange(r,cCodes||3).getDisplayValue(),
      taught: cTaught? sh.getRange(r,cTaught).getDisplayValue() : "",
      qweek: cWeek? sh.getRange(r,cWeek).getDisplayValue() : "",
      date: cDate? sh.getRange(r,cDate).getDisplayValue() : ""
    });
  }
  const nextIdx = rows.findIndex(x => !/^yes$/i.test(String(x.taught||"")));
  return { rows: rows, nextIndex: nextIdx>=0? nextIdx : 0 };
}

/***** ===================== YEAR PLAN D1… (curriculum skeleton) ===================== *****/
const PE_Q1_DAYS = [
  {title:"Employability Skills Intro", codes:["1.1.1","1.1.2"]},
  {title:"Teamwork & Collaboration", codes:["1.1.3"]},
  {title:"Communication Skills Workshop", codes:["1.1.4"]},
  {title:"Career Skills & Reflection", codes:["1.1.2"]},
  {title:"Workplace Ethics & Professionalism", codes:["1.2.1"]},
  {title:"Legal & Safety Responsibilities", codes:["1.2.2"]},
  {title:"Engineering Design Process Overview", codes:["5.1.1","5.1.2"]},
  {title:"Team Design Challenge", codes:["1.1","5.1"]},
  {title:"CAD Intro + Sketching Basics", codes:["5.3.1"]},
  {title:"2D Sketch + Constraints", codes:["5.3.2","5.3.3"]},
  {title:"Part Modeling (Extrude/Revolve)", codes:["5.3"]},
  {title:"Dimensioning & Annotation Standards", codes:["5.3.3"]},
  {title:"Assemblies Intro", codes:["5.3.4"]},
  {title:"Assembly Practice", codes:["5.3.4"]},
  {title:"Drawing Views + Annotations", codes:["5.3.5"]},
  {title:"CAD Challenge Project", codes:["5.3","1.1"]},
  {title:"Project Work + Feedback", codes:["5.3"]},
  {title:"Technical Writing Intro", codes:["5.4.1"]},
  {title:"Lab Notebook Documentation", codes:["5.4"]},
  {title:"Peer Review of Documentation", codes:["5.4"]},
  {title:"Intro to Circuits", codes:["5.2.1"]},
  {title:"Ohm’s Law & Resistor Codes", codes:["5.2.2"]},
  {title:"Build Simple Circuits", codes:["5.2.2"]},
  {title:"Breadboard Basics", codes:["5.2.3"]},
  {title:"Circuit Troubleshooting Lab", codes:["5.2.3"]},
  {title:"Mini Lab Challenge (Circuits)", codes:["5.2"]},
  {title:"Arduino Intro + IDE Setup", codes:["5.2.4"]},
  {title:"Digital Outputs (Blink LED)", codes:["5.2.4"]},
  {title:"Inputs (Buttons/Switches)", codes:["5.2.4"]},
  {title:"Combine Input + Output", codes:["5.2.4"]},
  {title:"Loop Structures", codes:["5.2.5"]},
  {title:"Conditional Logic (If/Else)", codes:["5.2.5"]},
  {title:"Mini Challenge: Interactive Circuit", codes:["5.2.4","5.2.5"]},
  {title:"Arduino Group Project Kickoff", codes:["5.2","1.1"]},
  {title:"Arduino Project Work Day", codes:["5.2"]},
  {title:"Reflection + Employability Skills", codes:["1.1"]},
  {title:"Spiral Review (CAD/Circuits/Arduino)", codes:["1.1","5.2","5.3"]},
  {title:"Quarter 1 Benchmark / ODE Checkpoint", codes:["1.1","5.1","5.2","5.3","5.4"]}
];
const PE_Q2_DAYS = [
  {title:"CAD Advanced Sketching & Params", codes:["5.3.2","5.3.3"]},
  {title:"GD&T Basics", codes:["5.3.5"]},
  {title:"Section & Detail Views", codes:["5.3.5"]},
  {title:"Assemblies with Motion", codes:["5.3.4"]},
  {title:"Subassemblies & BOM", codes:["5.3.4","5.3.5"]},
  {title:"CAD to CAM Overview", codes:["5.3","5.5"]},
  {title:"Production Processes Intro", codes:["5.5.1"]},
  {title:"DFM Principles", codes:["5.5.2"]},
  {title:"Process Planning Basics", codes:["5.5.3"]},
  {title:"Cost Estimation Lite", codes:["5.5.4"]},
  {title:"Quality Concepts (Tolerances/Checks)", codes:["5.5.5"]},
  {title:"Small DFM Project Day 1", codes:["5.5","5.3"]},
  {title:"Small DFM Project Day 2", codes:["5.5","5.3"]},
  {title:"Documentation for Manufacturing", codes:["5.4","5.5"]},
  {title:"Circuits: Series/Parallel Deepen", codes:["5.2.2"]},
  {title:"Power/Heat & Safety", codes:["5.2.2","1.2"]},
  {title:"Sensors Overview", codes:["5.2.4"]},
  {title:"Analog Inputs (Pot/LDR)", codes:["5.2.5"]},
  {title:"PWM & Output Control", codes:["5.2.5"]},
  {title:"Troubleshooting with Multimeter", codes:["5.2.2","5.2.3"]},
  {title:"Mini Integration: CAD Enclosure Plan", codes:["5.1","5.3"]},
  {title:"Mini Integration: Build/Measure Fit", codes:["5.3","5.5"]},
  {title:"Mini Integration: Wire/Test", codes:["5.2","5.1"]},
  {title:"Professionalism in Teams (Spiral)", codes:["1.1","1.2"]},
  {title:"Comms: Tech Reports & Presentations", codes:["5.4","1.1"]},
  {title:"Checkpoints & Reteach (Buffer)", codes:["5.x","1.x"]},
  {title:"CAD Practice Sprint", codes:["5.3"]},
  {title:"Process/Quality Sprint", codes:["5.5"]},
  {title:"Arduino Control Sprint", codes:["5.2.5"]},
  {title:"Integration Sprint", codes:["5.1","5.2","5.3","5.5"]},
  {title:"Quarter 2 Project Kick", codes:["5.1","5.3","5.5","1.1"]},
  {title:"Q2 Project Build", codes:["5.1","5.3","5.5"]},
  {title:"Q2 Project Build", codes:["5.1","5.2","5.3"]},
  {title:"Q2 Project Test", codes:["5.1","5.2"]},
  {title:"Q2 Review", codes:["1.1","5.1","5.2","5.3","5.5"]},
  {title:"Q2 Benchmark", codes:["1.1","5.1","5.2","5.3","5.5"]},
  {title:"Flex/Make-up", codes:["1.x","5.x","2.x"]}
];
const PE_Q3_DAYS = [
  {title:"Systems Thinking Intro", codes:["5.1"]},
  {title:"Project Planning (Gantt/Tasks)", codes:["5.1","1.1"]},
  {title:"CAD Enclosure – Concepts", codes:["5.3"]},
  {title:"CAD Enclosure – Model", codes:["5.3.5"]},
  {title:"Electronics – Inputs Survey", codes:["5.2.5"]},
  {title:"Electronics – Outputs Survey", codes:["5.2.5"]},
  {title:"Interface Plan: Pin Map & Power", codes:["5.2","5.1"]},
  {title:"Code Architecture (Modularity)", codes:["5.2.5"]},
  {title:"Build Sprint 1", codes:["5.1","5.2","5.3"]},
  {title:"Build Sprint 2", codes:["5.1","5.2","5.3"]},
  {title:"Test & Debug 1", codes:["5.2"]},
  {title:"Test & Debug 2", codes:["5.2"]},
  {title:"Design Review 1 (Peer)", codes:["5.4","1.1"]},
  {title:"Design Revision", codes:["5.1","5.3"]},
  {title:"Documentation Sprint (Photos/Notes)", codes:["5.4"]},
  {title:"Packaging/Assembly for Demo", codes:["5.5"]},
  {title:"Risk & Safety Review", codes:["1.2","5.1"]},
  {title:"Integration Test", codes:["5.1","5.2"]},
  {title:"Demo Rehearsal", codes:["1.1","5.4"]},
  {title:"Mid-Q3 Assessment", codes:["5.1","5.2","5.3"]},
  {title:"New Feature Add (Stretch)", codes:["5.2.5","5.3"]},
  {title:"Feature Stabilization", codes:["5.1"]},
  {title:"Performance Tuning", codes:["5.2"]},
  {title:"Usability Checks", codes:["5.4"]},
  {title:"Presentation Deck Build", codes:["1.1","5.4"]},
  {title:"Final Demo Day", codes:["1.1","5.1","5.2","5.3","5.5"]},
  {title:"Retrospective & Reflection", codes:["1.1","5.4"]},
  {title:"Spiral Skills: CAD Refresh", codes:["5.3"]},
  {title:"Spiral Skills: Arduino Refresh", codes:["5.2.5"]},
  {title:"Spiral Skills: Docs & Reports", codes:["5.4"]},
  {title:"Mini-Project Planning", codes:["5.1"]},
  {title:"Mini-Project Build", codes:["5.1","5.2","5.3"]},
  {title:"Mini-Project Test", codes:["5.2"]},
  {title:"Mini-Project Share-Out", codes:["1.1","5.4"]},
  {title:"Q3 Review", codes:["1.1","5.1","5.2","5.3","5.5"]},
  {title:"Q3 Benchmark", codes:["1.1","5.1","5.2","5.3","5.5"]},
  {title:"Flex/Make-up", codes:["1.x","5.x","2.x"]}
];
const PE_Q4_DAYS = [
  {title:"Capstone Kickoff – Briefs & Teams", codes:["5.1","1.1"]},
  {title:"User/Need Analysis", codes:["5.1","5.4"]},
  {title:"Concept Generation", codes:["5.1"]},
  {title:"Concept Selection (Matrix)", codes:["5.1","5.5"]},
  {title:"CAD Architecture & Enclosure", codes:["5.3"]},
  {title:"CAD Detail & Drawings", codes:["5.3.5"]},
  {title:"Electronics Plan (Schematic/BOM)", codes:["5.2","5.5"]},
  {title:"Manufacturing Plan", codes:["5.5"]},
  {title:"Build Sprint 1", codes:["5.1","5.2","5.3","5.5"]},
  {title:"Build Sprint 2", codes:["5.1","5.2","5.3","5.5"]},
  {title:"Build Sprint 3", codes:["5.1","5.2","5.3","5.5"]},
  {title:"Test & Debug 1", codes:["5.2"]},
  {title:"Test & Debug 2", codes:["5.2"]},
  {title:"Iterate & Improve", codes:["5.1"]},
  {title:"Packaging & Finish", codes:["5.5"]},
  {title:"Documentation Sprint (Report)", codes:["5.4"]},
  {title:"Presentation Draft", codes:["1.1","5.4"]},
  {title:"Presentation Rehearsal", codes:["1.1","5.4"]},
  {title:"Capstone Presentations", codes:["1.1","5.1","5.2","5.3","5.5"]},
  {title:"Capstone Reflection", codes:["1.1","5.4"]},
  {title:"WebXam Review – Employability", codes:["1.1","1.2"]},
  {title:"WebXam Review – CAD", codes:["5.3"]},
  {title:"WebXam Review – Circuits/Arduino", codes:["5.2.5"]},
  {title:"WebXam Review – Processes/Docs", codes:["5.5","5.4"]},
  {title:"Targeted Reteach 1", codes:["5.x"]},
  {title:"Targeted Reteach 2", codes:["1.x"]},
  {title:"Targeted Reteach 3", codes:["2.x"]},
  {title:"Practice Assessment", codes:["1.x","5.x"]},
  {title:"Admin/Make-up/Buffer", codes:["1.x","5.x"]},
  {title:"Celebration / Course Wrap", codes:["1.1"]}
];

/***** ===================== STANDARDS LOOKUP ===================== *****/
function parseOutcomeList_(s){
  var toks = String(s||"").split(/[ ,;\n]+/).map(x=>x.trim()).filter(Boolean);
  var outcomes = [], comps = [];
  toks.forEach(function(t){
    if (/^\d+\.\d+\.\d+$/.test(t)) comps.push(t);
    else if (/^\d+\.\d+$/.test(t)) outcomes.push(t);
    else if (/^\d+\.\dx$/.test(t) || /x$/.test(t)) outcomes.push(t);
    else outcomes.push(t);
  });
  var seenO={}, seenC={};
  outcomes = outcomes.filter(v => (seenO[v]? false : (seenO[v]=true)));
  comps    = comps.filter(v => (seenC[v]? false : (seenC[v]=true)));
  return { outcomes, comps };
}
function pe_getStandardsForUI(){
  var sh = SpreadsheetApp.openById(PE_STANDARDS_SHEET_ID).getActiveSheet();
  var last = sh.getLastRow();
  var vals = last > 1 ? sh.getRange(2,1,last-1,6).getValues() : [];
  var seen = {};
  var outcomes = [];
  var compsByOutcome = {};
  vals.forEach(function(r){
    var sc=String(r[0]||"").trim(), sn=String(r[1]||"").trim();
    var oc=String(r[2]||"").trim(), ot=String(r[3]||"").trim();
    var cc=String(r[4]||"").trim(), ct=String(r[5]||"").trim();
    if (oc && !seen[oc]) { outcomes.push({code:oc, title:ot, strandCode:sc, strandName:sn}); seen[oc]=true; }
    if (oc && (cc||ct)) { if(!compsByOutcome[oc]) compsByOutcome[oc]=[]; compsByOutcome[oc].push({code:cc, text:ct}); }
  });
  outcomes.sort((a,b)=>a.code.localeCompare(b.code, undefined, {numeric:true}));
  Object.keys(compsByOutcome).forEach(k => compsByOutcome[k].sort((a,b)=>a.code.localeCompare(b.code, undefined, {numeric:true})));
  return { outcomes, compsByOutcome };
}
function pe_getOutcomeMeta_(){
  var sh = SpreadsheetApp.openById(PE_STANDARDS_SHEET_ID).getActiveSheet();
  var last = sh.getLastRow();
  var vals = last > 1 ? sh.getRange(2,1,last-1,6).getValues() : [];
  var meta={};
  vals.forEach(function(r){
    var sc=String(r[0]||"").trim(), sn=String(r[1]||"").trim();
    var oc=String(r[2]||"").trim(), ot=String(r[3]||"").trim();
    if(oc && !meta[oc]) meta[oc]={strandCode:sc,strandName:sn,title:ot};
  });
  return meta;
}
function pe_getCompetencyCatalog_(){
  var sh = SpreadsheetApp.openById(PE_STANDARDS_SHEET_ID).getActiveSheet();
  var last = sh.getLastRow();
  var vals = last > 1 ? sh.getRange(2,1,last-1,6).getValues() : [];
  var byOutcome = {};
  vals.forEach(function(r){
    var oc=String(r[2]||"").trim(); if(!oc) return;
    var code=String(r[4]||"").trim(); var text=String(r[5]||"").trim();
    if(!byOutcome[oc]) byOutcome[oc]=[];
    if(code||text) byOutcome[oc].push({code:code,text:text});
  });
  return byOutcome;
}
function pe_renderStandards_(outcomeCodes, selectedCompCodes){
  var codes={}; (selectedCompCodes||[]).forEach(c => codes[String(c)]=true);
  var sh=SpreadsheetApp.openById(PE_STANDARDS_SHEET_ID).getActiveSheet();
  var last = sh.getLastRow();
  var vals = last > 1 ? sh.getRange(2,1,last-1,6).getValues() : [];
  var byOutcome={};
  vals.forEach(function(r){
    var sc=String(r[0]||"").trim(), sn=String(r[1]||"").trim();
    var oc=String(r[2]||"").trim(), ot=String(r[3]||"").trim();
    var cc=String(r[4]||"").trim(), ct=String(r[5]||"").trim();
    if(!oc) return;
    if(!byOutcome[oc]) byOutcome[oc]={strandCode:sc,strandName:sn,outcomeTxt:ot,comps:[]};
    if(cc||ct) byOutcome[oc].comps.push({code:cc,text:ct});
  });
  var lines=[];
  (outcomeCodes||[]).forEach(function(oc){
    var e=byOutcome[oc];
    if(!e){ lines.push("("+oc+") — no competencies found"); lines.push(""); return; }
    lines.push(e.strandCode+" — "+e.strandName);
    lines.push(oc+" — "+e.outcomeTxt);
    var chosen=e.comps.filter(c=>codes[c.code]);
    if(chosen.length===0) lines.push("• (no specific competencies selected)");
    else chosen.forEach(c=>lines.push("• "+c.code+" — "+c.text));
    lines.push("");
  });
  return lines.join("\n");
}

/***** ===================== AI (JSON mode + heuristic fallback) ===================== *****/
function pe_aiPromptForKey(){
  const ui=SpreadsheetApp.getUi();
  const r=ui.prompt("Enter OpenAI API Key","Format: sk-...", ui.ButtonSet.OK_CANCEL);
  if(r.getSelectedButton()!==ui.Button.OK) return;
  const k=(r.getResponseText()||"").trim();
  if(!/^sk-/.test(k)){ ui.alert("That doesn’t look like an OpenAI key."); return; }
  PropertiesService.getScriptProperties().setProperty("PE_OPENAI_KEY",k);
  ui.alert("Saved.");
}
function pe_aiGetKey_(){ return PropertiesService.getScriptProperties().getProperty("PE_OPENAI_KEY")||""; }
function pe_aiDiagnostics(){
  const k=pe_aiGetKey_(); if(!k){ pe_toast_("No OpenAI key set."); return; }
  const ok = pe_aiCall_([{role:"user", content:"Reply with 'ok'"}], false);
  pe_toast_(String(ok).trim().toLowerCase()==="ok"?"AI OK":"AI unexpected response");
}
function pe_aiCall_(messages, wantJSON){
  const key=pe_aiGetKey_(); if(!key) throw new Error("OpenAI API key not set.");
  const models=[PE_AI_MODEL,"gpt-4o-mini","gpt-4o"]; let lastErr=null;
  for (var i=0;i<models.length;i++){
    const model=models[i];
    try{
      const payload={
        model,
        messages,
        temperature:0.2,
        ...(wantJSON ? { response_format:{ type:"json_object" } } : {})
      };
      const res=UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions",{
        method:"post",
        contentType:"application/json",
        headers:{Authorization:"Bearer "+key},
        muteHttpExceptions:true,
        payload:JSON.stringify(payload)
      });
      const code=res.getResponseCode(), body=res.getContentText();
      if(code<200||code>=300) throw new Error("HTTP "+code+": "+body);
      const json=JSON.parse(body);
      const msg=(json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content)||"";
      if(!String(msg).trim()) throw new Error("Empty completion");
      return msg;
    }catch(e){ lastErr=e; }
  }
  throw new Error("All models failed. Last error: "+lastErr);
}
function pe_safeJsonParse_(s){ try{ return JSON.parse(s); }catch(_){ return null; } }
function pe_buildHeuristicLesson_(title, outcomeCodes, compCodes){
  const meta = pe_getOutcomeMeta_();
  const cat  = pe_getCompetencyCatalog_();
  const compTexts = [];
  (compCodes||[]).forEach(cc=>{
    const oc = cc.split('.').slice(0,2).join('.');
    const arr = (cat[oc]||[]);
    const hit = arr.find(x=>x.code===cc);
    if(hit && hit.text) compTexts.push(hit.text);
  });
  const outcomeTitles = (outcomeCodes||[]).map(oc => (meta[oc]?.title)||oc);

  const objectives = [];
  if (compTexts.length){
    compTexts.slice(0,3).forEach(t=>{
      objectives.push("Students will be able to "+t.replace(/^\s*-\s*/,'').replace(/\.$/,'')+".");
    });
  } else {
    const base = (title||"today’s topic").toLowerCase();
    objectives.push("Students will explain the key idea of "+base+".");
    objectives.push("Students will apply the concept in a guided task with accuracy.");
    objectives.push("Students will document results and justify design decisions.");
  }
  while (objectives.length<3) objectives.push("Students will demonstrate understanding via checks for understanding.");

  const agenda = [
    {time:"5 min",  activity:"Do Now: prior‑knowledge prompt", teacherNotes:"Project while taking attendance.", checks:["2 cold‑calls","Thumbs‑meter"]},
    {time:"12 min", activity:"Mini‑lesson: "+title, teacherNotes:"Model one worked example.", checks:["Stop‑and‑jot","1 volunteer explanation"]},
    {time:"20 min", activity:"Guided practice / build", teacherNotes:"Circulate and stamp checkpoints.", checks:["Checkpoint stamp","Quick error‑hunt"]},
    {time:"10 min", activity:"Independent try / pair share", teacherNotes:"Fade support; push precision.", checks:["Partner check","Spot‑checks"]},
    {time:"3 min",  activity:"Exit ticket", teacherNotes:"Collect at door.", checks:["1 scored prompt"]}
  ];
  const assessment = ["Exit ticket (2‑point rubric)","Teacher observation at checkpoints","Task/build meets spec"];
  const materials  = ["Board/slides","Notebook","Handout or task sheet","Tools/parts as needed"];
  const prep       = ["Print handouts","Stage materials/tools","Open example file(s)"];
  const diff       = ["Sentence starters & visuals","Tiered challenge options","Strategic pairs / roles"];
  const notes      = outcomeTitles.length ? ["Emphasize: "+outcomeTitles.join("; ")] : ["Emphasize precision and safety."];

  return { 
    eq: "How do engineers apply today’s concept to solve a concrete problem?",
    eu: "Engineering blends planning, iteration, and evidence‑based decisions.",
    objectives, agenda, assessment, materials, prep, differentiation: diff, teacherNotes: notes
  };
}
function pe_coerceArray_(x){ return Array.isArray(x)? x : (x? [String(x)] : []); }
function pe_normalizeLessonJson_(j, title){
  const out = {
    eq: (j && j.eq) ? String(j.eq) : "How does "+(title||"this skill")+" help us solve real problems?",
    eu: (j && j.eu) ? String(j.eu) : "We learn by planning, testing, and iterating.",
    objectives: pe_coerceArray_(j?.objectives).filter(Boolean).slice(0,3),
    agenda: Array.isArray(j?.agenda)? j.agenda : [],
    assessment: pe_coerceArray_(j?.assessment),
    materials: pe_coerceArray_(j?.materials),
    prep: pe_coerceArray_(j?.prep),
    differentiation: pe_coerceArray_(j?.differentiation),
    teacherNotes: pe_coerceArray_(j?.teacherNotes)
  };
  while(out.objectives.length<3) out.objectives.push("Students will demonstrate understanding via checks for understanding.");
  if (!out.agenda.length){
    out.agenda = [
      {time:"5 min",activity:"Do Now",teacherNotes:"",checks:["2 cold‑calls"]},
      {time:"15 min",activity:"Direct instruction",teacherNotes:"",checks:["Thumbs‑meter"]},
      {time:"20 min",activity:"Guided practice",teacherNotes:"",checks:["Checkpoint stamp"]},
      {time:"10 min",activity:"Share‑out & exit ticket",teacherNotes:"",checks:["Exit ticket"]}
    ];
  }
  out.agenda = out.agenda.map(a=>({
    time: String(a.time||""), 
    activity: String(a.activity||""),
    teacherNotes: String(a.teacherNotes||""),
    checks: pe_coerceArray_(a.checks).filter(Boolean)
  }));
  if (!out.assessment.length) out.assessment=["Exit ticket","Observation at checkpoints"];
  if (!out.materials.length) out.materials=["Board/slides","Notebook","Handout"];
  if (!out.prep.length) out.prep=["Print handouts","Stage materials"];
  if (!out.differentiation.length) out.differentiation=["Sentence starters","Tiered tasks"];
  if (!out.teacherNotes.length) out.teacherNotes=["Mind timing; circulate early."];
  return out;
}
function pe_aiGenerateLesson_(dayLabel, dayTitle, outcomeCodes, compCodes){
  var meta=pe_getOutcomeMeta_(), cat=pe_getCompetencyCatalog_();
  var block=(outcomeCodes||[]).map(function(oc){
    var m=meta[oc]||{};
    var comps=(cat[oc]||[]).filter(function(c){ return (compCodes||[]).indexOf(c.code)>=0; });
    var compLines = comps.length? comps.map(function(c){return "• "+c.code+" — "+c.text;}).join("\n") : "• (no specific competencies selected)";
    return (m.strandCode||"")+" — "+(m.strandName||"")+"\n"+oc+" — "+(m.title||"")+"\n"+compLines;
  }).join("\n\n");

  var sys={role:"system",content:
"You are a CTE engineering teacher’s assistant. Respond with STRICT JSON only. Keys: "+
"{\"eq\":string,\"eu\":string,\"objectives\":string[3],\"agenda\":[{\"time\":string,\"activity\":string,\"teacherNotes\":string,\"checks\":string[]}],"+
"\"assessment\":string[],\"materials\":string[],\"prep\":string[],\"differentiation\":string[],\"teacherNotes\":string[]}"+
". Keep items concise, concrete, classroom‑ready; include accountability checks. No links, no markdown."};

  var usr={role:"user",content:
"Label: "+dayLabel+"\nTitle: "+dayTitle+
"\nSelected Standards (only these):\n"+(block||"(none)")+
"\nOne 50‑minute meeting. Include explicit checks at each agenda step. Return JSON ONLY."};

  var json = null;
  try{
    var raw = pe_aiCall_([sys,usr], true /*wantJSON*/);
    json = pe_safeJsonParse_(raw);
  }catch(_){ json = null; }

  if (!(json && json.objectives && json.objectives.length && json.agenda && json.agenda.length)){
    try{
      var usr2 = {role:"user", content:
        "Re‑issue STRICT JSON (no prose). Ensure exactly 3 objectives and 4‑6 agenda items with checks at each step. Same constraints."};
      var raw2 = pe_aiCall_([sys,usr,usr2], true);
      var j2 = pe_safeJsonParse_(raw2);
      if (j2) json = j2;
    }catch(_){ /* ignore */ }
  }

  if (!(json && json.objectives && json.objectives.length && json.agenda && json.agenda.length)){
    json = pe_buildHeuristicLesson_(dayTitle, outcomeCodes, compCodes);
  }
  return pe_normalizeLessonJson_(json, dayTitle);
}

/***** ===================== DOC CREATION ===================== *****/
function pe_fillPlaceholders_(body, map){
  Object.keys(map).forEach(function(k){
    try{ body.replaceText('{{'+k+'}}', map[k]==null ? '' : String(map[k])); }catch(_){}
  });
}
function pe_insertStructuredLesson_(doc, data){
  const body = doc.getBody();

  // Find and remove {{AI_BODY}}, remember insertion index
  const m = body.findText("\\{\\{AI_BODY\\}\\}");
  let insertIndex = null;
  if (m){
    const t = m.getElement().asText();
    t.deleteText(m.getStartOffset(), m.getEndOffsetInclusive());
    const para = (function elToPara(el){ while(el && el.getType()!==DocumentApp.ElementType.PARAGRAPH){ el=el.getParent(); } return el && el.asParagraph(); })(m.getElement());
    if (para) insertIndex = body.getChildIndex(para);
  }

  function insParagraph(txt, heading){
    if (insertIndex==null) return body.appendParagraph(txt).setHeading(heading||null);
    const p = body.insertParagraph(++insertIndex, txt);
    if (heading) p.setHeading(heading);
    return p;
  }
  function insTable(rows){
    if (insertIndex==null) return body.appendTable(rows);
    return body.insertTable(++insertIndex, rows);
  }
  function insListItem(txt){
    if (insertIndex==null) return body.appendListItem(txt);
    return body.insertListItem(++insertIndex, txt);
  }
  function insBlank(){ if (insertIndex==null) body.appendParagraph(""); else body.insertParagraph(++insertIndex, ""); }

  // At a Glance (merged EQ/EU/Objectives)
  insParagraph("At a Glance", DocumentApp.ParagraphHeading.HEADING2);
  var glance = insTable([
    ["Essential Question", data.eq || ""],
    ["Enduring Understanding", data.eu || ""],
    ["Objectives (Today)", (data.objectives||[]).slice(0,3).map((o,i)=>(i+1)+". "+o).join("\n")]
  ]);
  for (var r=0; r<glance.getNumRows(); r++){ glance.getRow(r).getCell(0).editAsText().setBold(true); }
  insBlank();

  // Agenda & Checks
  insParagraph("Agenda & Checks", DocumentApp.ParagraphHeading.HEADING2);
  var agendaTbl = insTable([["Time","Activity","Teacher Notes","Checks for Understanding"]]);
  agendaTbl.getRow(0).editAsText().setBold(true);
  for (var c=0; c<agendaTbl.getRow(0).getNumCells(); c++){ agendaTbl.getRow(0).getCell(c).setBackgroundColor("#eeeeee"); }
  (data.agenda||[]).forEach(a=>{
    var row = agendaTbl.appendTableRow();
    row.appendTableCell(a.time||"");
    row.appendTableCell(a.activity||"");
    row.appendTableCell(a.teacherNotes||"");
    row.appendTableCell((a.checks||[]).map(ch=>"• "+ch).join("\n"));
  });
  insBlank();

  // Assessment
  insParagraph("Assessment / Evidence", DocumentApp.ParagraphHeading.HEADING2);
  (data.assessment||[]).forEach(s=>insListItem(s));
  insBlank();

  // Materials
  insParagraph("Materials", DocumentApp.ParagraphHeading.HEADING2);
  (data.materials||[]).forEach(s=>insListItem(s));

  // Prep
  insParagraph("PREP TODO", DocumentApp.ParagraphHeading.HEADING2);
  (data.prep||[]).forEach(s=>insListItem("☐ "+s));
  insBlank();

  // Differentiation
  insParagraph("Differentiation / Accommodations", DocumentApp.ParagraphHeading.HEADING2);
  (data.differentiation||[]).forEach(s=>insListItem(s));
  insBlank();

  // Teacher Notes
  insParagraph("Teacher Notes", DocumentApp.ParagraphHeading.HEADING2);
  (data.teacherNotes||[]).forEach(s=>insParagraph("– "+s));
}
function upsertWeeklyPlannerDoc_(weekFolder, plan){
  const name = "Weekly Planner "+plan.weekCode;
  var it=weekFolder.getFilesByName(name);
  var doc = it.hasNext()? DocumentApp.openById(it.next().getId()) : DocumentApp.create(name);
  if(!it.hasNext()) DriveApp.getFileById(doc.getId()).moveTo(weekFolder);
  try{ DriveApp.getFileById(doc.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
  var b=doc.getBody(); b.clear();
  b.appendParagraph("Weekly Planner — "+plan.weekCode).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  b.appendParagraph(plan.dates||"").setHeading(DocumentApp.ParagraphHeading.HEADING2);
  b.appendParagraph("");
  var t=b.appendTable([["Day","Topic / Lesson Link","Competencies","Notes"]]); t.getRow(0).editAsText().setBold(true);
  var dayLabels=["Mon","Tue","Wed","Thu","Fri"];
  for (var i=0;i<dayLabels.length;i++){
    var d = dayLabels[i];
    var r=t.appendTableRow(); r.appendTableCell(d); r.appendTableCell(""); r.appendTableCell(""); r.appendTableCell("");
    if ((plan.meetDays||[]).indexOf(d)===-1) { for (var c=0;c<r.getNumCells();c++) r.getCell(c).setBackgroundColor("#f2f2f2"); }
  }
  doc.saveAndClose();
  return doc;
}
function linkWeeklyPlanner_(weeklyPlannerDoc, plan, created){
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
function stampMasterDailyPlan_(startIndex, qweek, datesStr, lessons){
  var ss=SpreadsheetApp.getActive(); var sh=ss.getSheetByName("Master Daily Plan"); if(!sh) return;
  var hdr=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  var cWeek=hdr.indexOf("Week Taught (Q#W#)")+1, cDate=hdr.indexOf("Date Taught")+1, cTaught=hdr.indexOf("Taught?")+1, cRes=hdr.indexOf("Resources")+1;
  lessons.forEach(function(d,i){
    var row = 2 + (startIndex+i);
    if(cWeek) sh.getRange(row,cWeek).setValue(qweek);
    if(cDate) sh.getRange(row,cDate).setValue(datesStr);
    if(cTaught) sh.getRange(row,cTaught).setValue("Yes");
    if(cRes) sh.getRange(row,cRes).setValue(d.url);
  });
}
function buildDailyLessons_(weekFolder, plan, startIndex){
  if(!PE_LESSON_TEMPLATE_DOC_ID) throw new Error("Set PE_LESSON_TEMPLATE_DOC_ID to your template Doc ID.");
  var out=[];
  for(var i=0;i<plan.daily.length;i++){
    var d=plan.daily[i], dnum=startIndex+i+1;
    var docName = "Lesson Plan — "+plan.weekCode+" — "+d.dayName+" — D"+dnum+" — "+d.title;

    // Replace existing (to avoid stale content)
    var existing = weekFolder.getFilesByName(docName);
    if (existing.hasNext()) { try{ existing.next().setTrashed(true);}catch(_){ } }

    var copy = DriveApp.getFileById(PE_LESSON_TEMPLATE_DOC_ID).makeCopy(docName, weekFolder);
    var docId = copy.getId();

    var doc = DocumentApp.openById(docId);
    var body = doc.getBody();

    var std = pe_renderStandards_(d.outcomes, d.competencies);

    var aiData = {};
    try{ if (pe_aiGetKey_()) aiData = pe_aiGenerateLesson_("D"+dnum, d.title, d.outcomes, d.competencies) || {}; }catch(e){ aiData = {}; }

    pe_fillPlaceholders_(body, {
      WEEK: plan.weekCode,
      DAYNAME: d.dayName,
      DLABEL: "D"+dnum,
      TITLE: d.title,
      DATE: plan.dates || "",
      CLASS_LENGTH: "45–55 min",
      STANDARDS_BLOCK: std,
      AI_BODY: "{{AI_BODY}}"
    });
    pe_insertStructuredLesson_(doc, aiData);

    doc.saveAndClose();
    try{ DriveApp.getFileById(docId).setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(e){}
    out.push({ name: docName, url: doc.getUrl(), dayName: d.dayName, dnum: dnum });
  }
  return out;
}

/***** ===================== SUGGESTIONS & UI INIT ===================== *****/
function pe_peekNextDays_(n){
  const ss=SpreadsheetApp.getActive(); 
  const sh=ss.getSheetByName("Master Daily Plan");
  if(!sh) throw new Error("Master Daily Plan not found.");

  const hdr=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const cDay=hdr.indexOf("Day #")+1, cTitle=hdr.indexOf("Lesson Title")+1, cCodes=hdr.indexOf("Outcome/Strand Codes")+1, cTaught=hdr.indexOf("Taught?")+1;
  const last=sh.getLastRow(); 
  const rows=[];
  for(let r=2;r<=last;r++){
    rows.push({
      day:   sh.getRange(r,cDay).getDisplayValue(),
      title: sh.getRange(r,cTitle).getDisplayValue(),
      codes: sh.getRange(r,cCodes).getDisplayValue(),
      taught: sh.getRange(r,cTaught).getDisplayValue()
    });
  }
  let start = rows.findIndex(x => !/^yes$/i.test(String(x.taught||"")));
  if(start<0) start=rows.length-1;

  const cat = pe_getCompetencyCatalog_();

  const slice = rows.slice(start, start+(n||5));
  return slice.map(function(row){
    const parsed = parseOutcomeList_(row.codes);
    const derivedOutcomes = (parsed.comps||[]).map(cc => cc.split('.').slice(0,2).join('.'));
    const oset = {}; (parsed.outcomes||[]).concat(derivedOutcomes).forEach(x=>{ if(x) oset[x]=true; });
    const outcomes = Object.keys(oset);
    const validComps = (parsed.comps||[]).filter(function(cc){
      const oc = cc.split('.').slice(0,2).join('.');
      return Array.isArray(cat[oc]) && cat[oc].some(c => c.code===cc);
    });
    return { label: row.day, title: row.title, outcomes: outcomes, comps: validComps };
  });
}
function pe_getSuggestionsForDays(k){ k = Math.max(1, Math.min(5, Number(k)||5)); return pe_peekNextDays_(k); }
function pe_getWeeklyUIInit(){
  var pos   = pe_getInitData();
  var weeks = pe_collectWeeks_();    // from fixed Sheet
  var stds  = pe_getStandardsForUI();
  var suggest = pe_peekNextDays_(5);
  return { next: pos, weeks: weeks, standards: stds, suggest: suggest };
}

/***** ===================== BUILD WEEK ===================== *****/
function pe_buildWeekFromPositionWithPerDay(qweek, datesStr, selectedDays, perDay){
  perDay = perDay || [];
  var pos=pe_getInitData(); var rows=pos.rows; var idx=pos.nextIndex>=0? pos.nextIndex : 0;
  var classDays = Math.max(1, Math.min(5, (selectedDays && selectedDays.length) ? selectedDays.length : 5));
  var toBuild = rows.slice(idx, idx+classDays);
  if(!toBuild.length) throw new Error("No remaining days to build.");

  var weekFolder = pe_getWeekFolderByName_(qweek);
  var meetDays = (selectedDays && selectedDays.length) ? selectedDays.slice(0,classDays) : ["Mon","Tue","Wed","Thu","Fri"].slice(0,classDays);
  var plan = { weekCode:qweek, dates:datesStr||"", meetDays: meetDays, daily: [] };

  for (var i=0;i<toBuild.length;i++){
    var row = toBuild[i];
    var parsed = parseOutcomeList_(row.codes);
    var extraO = Array.isArray(perDay[i] && perDay[i].oc) ? perDay[i].oc : [];
    var extraC = Array.isArray(perDay[i] && perDay[i].cp) ? perDay[i].cp : [];
    var outcomes = Array.from(new Set([].concat(parsed.outcomes||[], extraO)));
    var comps    = Array.from(new Set([].concat(parsed.comps||[],    extraC)));
    plan.daily.push({ dayName: meetDays[i], title: row.title, outcomes: outcomes, competencies: comps });
  }

  var weeklyPlannerDoc = upsertWeeklyPlannerDoc_(weekFolder, plan);
  var lessons = buildDailyLessons_(weekFolder, plan, idx);
  linkWeeklyPlanner_(weeklyPlannerDoc, plan, lessons);
  stampMasterDailyPlan_(idx, qweek, datesStr||"", lessons);

  pe_toast_("Built "+lessons.length+" day(s) into "+qweek+" on ["+meetDays.join(", ")+"] starting at "+rows[idx].day+".");
  return { ok:true, nextStart: rows[idx+lessons.length] ? rows[idx+lessons.length].day : null, weeklyPlannerUrl:weeklyPlannerDoc.getUrl(), lessons: lessons };
}



/***** ===================== EXTRA UI OPENERS (To‑Do + Classroom) ===================== *****/
function pe_openTodoSidebar(){
  var html = HtmlService.createTemplateFromFile("TodoSidebar").evaluate().setTitle("Weekly To‑Do");
  SpreadsheetApp.getUi().showSidebar(html);
}
function pe_openTodoDialogWide(){
  var html = HtmlService.createTemplateFromFile("TodoSidebar").evaluate();
  html.setWidth(1200).setHeight(850);
  SpreadsheetApp.getUi().showModelessDialog(html, "Weekly To‑Do (Wide)");
}
function pe_openClassroomPlannerDialogWide(){
  var html = HtmlService.createTemplateFromFile("ClassroomSidebar").evaluate();
  html.setWidth(1200).setHeight(850);
  SpreadsheetApp.getUi().showModelessDialog(html, "Classroom Planner (Wide)");
}

/***** ===================== WEEK FILE LISTING (used by To‑Do/Classroom) ===================== *****/
function pe_listWeekFiles_(qweek){
  try{
    var folder = pe_getWeekFolderByName_(qweek);
    var it = folder.getFiles();
    var days = {Mon:[],Tue:[],Wed:[],Thu:[],Fri:[]};
    var lessons = {};
    while (it.hasNext()){
      var f = it.next();
      var name = f.getName();
      var dayMatch = name.match(/—\s*(Mon|Tue|Wed|Thu|Fri)\s*—/i);
      if (!dayMatch) continue;
      var day = dayMatch[1];
      if (/^Lesson Plan\s+—\s+/i.test(name)){
        lessons[day] = { id:f.getId(), url:f.getUrl(), name:name };
      } else if (/^Asset\s+—\s+/i.test(name)){
        days[day] = days[day] || [];
        days[day].push({ id:f.getId(), url:f.getUrl(), name:name });
      }
    }
    return { folderUrl: (folder && folder.getUrl && folder.getUrl()) || "", lessons: lessons, assetsByDay: days };
  }catch(e){
    Logger.log("pe_listWeekFiles_ error: "+e);
    return { folderUrl: "", lessons: {}, assetsByDay: {Mon:[],Tue:[],Wed:[],Thu:[],Fri:[]} };
  }
}

/***** ===================== PREP TODO PARSER ===================== *****/
var PE_TODO = (function(){
  function isNoiseTodoLine(t){
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
  function readPrepFromDoc(docId){
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
  function categorizePrepTasks(items){
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
  return { isNoiseTodoLine:isNoiseTodoLine, readPrepFromDoc:readPrepFromDoc, categorizePrepTasks:categorizePrepTasks };
})();

/***** ===================== To‑Do ENDPOINTS ===================== *****/
function pe_todoInit(){ return { weeks: pe_collectWeeks_() }; }
function pe_todoLoadWeek(qweek){
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
function pe_todoGenerate(qweek, dnum, dayName, task){
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
function pe_todoGenerateAll(qweek, items){
  var out = [];
  (items||[]).forEach(function(it){
    try{ var res = pe_todoGenerate(qweek, it.dnum, it.day, it.task); out.push({ ok:true, task:it.task, url:res.url, day:it.day, dnum:it.dnum }); }
    catch(e){ out.push({ ok:false, task:it.task, err:String(e) }); }
  });
  return out;
}

/***** ===================== CLASSROOM HELPERS + ENDPOINTS ===================== *****/
function gc_listMyCourses_() {
  try {
    var res = Classroom.Courses.list({ teacherId: "me" });
    return (res.courses || []).map(function(c){ return {id:c.id, name:c.name}; });
  } catch (e) { Logger.log("gc_listMyCourses_ error: " + e); return []; }
}
function gc_getOrCreateTopic_(courseId, name) {
  var existing = Classroom.Courses.Topics.list(courseId);
  var hit = (existing.topic || []).find(function(t){ return t.name === name; });
  if (hit) return hit.id;
  var created = Classroom.Courses.Topics.create({ name: name }, courseId);
  return created.id;
}
function gc_fileIdFromUrl_(url){ var m = String(url||"").match(/[-\\w]{25,}/); return m ? m[0] : ""; }
function gc_driveMaterial_(fileId){ return { driveFile: { driveFile: { id: fileId } } }; }
function gc_upsertAssignment_(courseId, payload) {
  var list = Classroom.Courses.CourseWork.list(courseId, { courseWorkStates: ["PUBLISHED","DRAFT"] });
  var existing = (list.courseWork || []).find(function(cw){ return cw.title === payload.title; });
  if (existing) {
    var patchMask = "title,description,dueDate,dueTime,topicId,materials,maxPoints,state,scheduledTime";
    return Classroom.Courses.CourseWork.patch(payload, courseId, existing.id, { updateMask: patchMask });
  } else { return Classroom.Courses.CourseWork.create(payload, courseId); }
}
function pe_gcInit(){
  var courses = []; try { courses = gc_listMyCourses_(); } catch(e){ Logger.log(e); }
  return { courses: courses, defaultCourseId: (typeof GC_COURSE_ID!=='undefined' && GC_COURSE_ID) ? GC_COURSE_ID : ((courses[0] && courses[0].id) || ""), weeks: pe_collectWeeks_() };
}
function pe_gcLoadWeek(qweek, courseId){
  try{
    var files = pe_listWeekFiles_(qweek);
    var topicName = String(qweek).replace(/(\\d)W(\\d)/i, "$1 W$2");
    var days = ["Mon","Tue","Wed","Thu","Fri"];
    var rows = [];
    for (var i=0;i<days.length;i++){
      var d = days[i];
      var lesson = files.lessons[d] || null;
      var assets = files.assetsByDay[d] || [];
      var title = "["+qweek+"] " + d + ": " + (lesson ? lesson.name.replace(/^Lesson Plan\\s+—\\s+[^—]+\\s+—\\s+[^—]+\\s+—\\s+\\w+\\s+—\\s*/,'') : "Lesson");
      var desc = "Week: "+qweek+"\\nDay: "+d+"\\n(Attached: lesson + assets)";
      rows.push({ day:d, dnum:null, date: null, title:title, description:desc, lesson:lesson, assets:assets });
    }
    return { qweek: qweek, topicName: topicName, days: rows, folderUrl: files.folderUrl, courseId: courseId || "" };
  }catch(e){ throw new Error("pe_gcLoadWeek failed: "+e); }
}
function pe_gcCreateAssignments(courseId, qweek, topicName, items){
  if (!courseId) throw new Error("No course selected.");
  var topicId = gc_getOrCreateTopic_(courseId, topicName);
  var results = [];
  (items||[]).forEach(function(it){
    try{
      var materials = [];
      if (it.lesson && it.lesson.url){ var fid = gc_fileIdFromUrl_(it.lesson.url); if (fid) materials.push(gc_driveMaterial_(fid)); }
      (it.assets||[]).forEach(function(a){ var fid = gc_fileIdFromUrl_(a.url); if (fid) materials.push(gc_driveMaterial_(fid)); });
      var payload = { title: it.title, description: it.description || "", workType: "ASSIGNMENT", materials: materials, topicId: topicId, maxPoints: Number(it.points || 100), state: it.scheduledISO ? "DRAFT" : (it.publish ? "PUBLISHED" : "DRAFT") };
      if (it.scheduledISO){ payload.scheduledTime = it.scheduledISO; }
      var res = gc_upsertAssignment_(courseId, payload);
      results.push({ ok:true, id: (res && res.id) || "", title: payload.title });
    }catch(e){ results.push({ ok:false, title: it.title, err: String(e) }); }
  });
  return results;
}
