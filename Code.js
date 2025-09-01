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

// District Pacing *Doc* (not Sheet): paste the Google Doc ID of the pacing guide shown in your screenshot
const PE_PACING_DOC_ID = "1NJsTtOwJc15Fb9LT4tnbN3AtmNFi17ybWrT9ENBulrU";

// Column positions in the pacing table (0-based indexes)
// Adjust if your table differs. Based on your screenshot:
// [Week | Dates | Unit Name/Number | EU/EQ | Standards | Lessons | Writing/Tier1 | ODE Checkpoints]
const PE_PACING_COL_IDX = {
  WEEK: 0,
  DATES: 1,
  UNIT: 2,
  EQ: 3,
  STDS: 4,
  LESSONS: 5
};
/** */

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
function pe_getSingle_(it, err) {
  return PE.Utils.pe_getSingle_(it, err);
}

function pe_getTopFolder_() {
  return PE.Drive.pe_getTopFolder_();
}

function pe_getYearFolder_() {
  return PE.Drive.pe_getYearFolder_();
}

function pe_getWeekFolderByName_(name) {
  return PE.Drive.pe_getWeekFolderByName_(name);
}



/***** ===================== WEEKS (from fixed Sheet) ===================== *****/
function pe_loadWeeksFromSheet_() {
  return PE.Weeks.pe_loadWeeksFromSheet_();
}

function pe_collectWeeks_() {
  return PE.Weeks.pe_collectWeeks_();
}

function pe_getDatesForWeek(weekCode) {
  return PE.Weeks.pe_getDatesForWeek(weekCode);
}


/***** ===================== MASTER DAILY PLAN ===================== *****/
function pe_buildMasterDailyPlanner() {
  return PE.MasterPlanner.pe_buildMasterDailyPlanner();
}

function pe_getInitData() {
  return PE.MasterPlanner.pe_getInitData();
}

/***** Pacing Helper ***********/
function pe_pacingGetTables_(doc) {
  return PE.Pacing.pe_pacingGetTables_(doc);
}

function pe_textOfCell_(cell) {
  return PE.Pacing.pe_textOfCell_(cell);
}

function pe_setCellTextOnce_(cell, text) {
  return PE.Pacing.pe_setCellTextOnce_(cell, text);
}

function pe_setCellReplaceIfEmpty_(cell, text) {
  return PE.Pacing.pe_setCellReplaceIfEmpty_(cell, text);
}

function pe_setWeekHyperlink_(cell, weekCode, url) {
  return PE.Pacing.pe_setWeekHyperlink_(cell, weekCode, url);
}

function pe_findRowByWeek_(tables, weekCode) {
  return PE.Pacing.pe_findRowByWeek_(tables, weekCode);
}


// Pull “Essential Question” from the first created lesson doc (from its section in your template)
function pe_extractEQFromLessonDoc_(docId) {
  return PE.DocsCore.pe_extractEQFromLessonDoc_(docId);
}

function pe_updatePacingDocForWeek_(plan, datesStr, weeklyPlannerUrl, lessons) {
  return PE.Pacing.pe_updatePacingDocForWeek_(plan, datesStr, weeklyPlannerUrl, lessons);
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
function parseOutcomeList_(s) {
  return PE.Standards.parseOutcomeList_(s);
}

function pe_getStandardsForUI() {
  return PE.Standards.pe_getStandardsForUI();
}

function pe_getOutcomeMeta_() {
  return PE.Standards.pe_getOutcomeMeta_();
}

function pe_getCompetencyCatalog_() {
  return PE.Standards.pe_getCompetencyCatalog_();
}

function pe_renderStandards_(outcomeCodes, selectedCompCodes) {
  return PE.Standards.pe_renderStandards_(outcomeCodes, selectedCompCodes);
}


/***** ===================== AI (JSON mode + heuristic fallback) ===================== *****/
function pe_aiPromptForKey() {
  return PE.AI.pe_aiPromptForKey();
}

function pe_aiGetKey_() {
  return PE.AI.pe_aiGetKey_();
}

function pe_aiDiagnostics() {
  return PE.AI.pe_aiDiagnostics();
}

function pe_aiCall_(messages, wantJSON) {
  return PE.AI.pe_aiCall_(messages, wantJSON);
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
  // Coercers
function arr(x) {
  return PE.Utils.arr(x);
}


  const out = {
    eq: (j && j.eq) ? String(j.eq) : "How does "+(title||"this skill")+" help us solve real problems?",
    eu: (j && j.eu) ? String(j.eu) : "We learn by planning, testing, and iterating.",
    objectives: arr(j?.objectives).slice(0,3),
    agenda: Array.isArray(j?.agenda)? j.agenda : [],
    assessment: arr(j?.assessment),
    materials: arr(j?.materials),
    // New explicit channels (prefer explicit; fallback to legacy j.prep split)
    aiPrep: arr(j?.aiPrep),
    teacherPrep: arr(j?.teacherPrep),
    differentiation: arr(j?.differentiation),
    teacherNotes: arr(j?.teacherNotes)
  };

  while(out.objectives.length<3) out.objectives.push("Students will demonstrate understanding via checks for understanding.");

  if (!out.agenda.length){
    out.agenda = [
      {time:"5 min",activity:"Do Now",teacherNotes:"",checks:["2 cold-calls"]},
      {time:"10 min",activity:"Mini-lesson",teacherNotes:"",checks:["Thumbs-check"]},
      {time:"25 min",activity:"Guided practice / build",teacherNotes:"",checks:["Circulate; spot-checks"]},
      {time:"10 min",activity:"Share-outs + Exit Ticket",teacherNotes:"",checks:["Collect exit ticket"]}
    ];
  }
  out.agenda = out.agenda.map(function(a){
    return {
      time: String(a.time||""),
      activity: String(a.activity||""),
      teacherNotes: String(a.teacherNotes||""),
      checks: arr(a.checks)
    };
  });

  // Fallbacks if AI didn’t separate prep:
  if (!out.aiPrep.length && !out.teacherPrep.length){
    var legacy = arr(j?.prep);
    // Soft split: anything that *sounds* like logistics → teacher; everything else → AI
    legacy.forEach(function(s){
      var t = String(s||"").trim();
      if (!t) return;
      if (/\b(print|copy|photocopy|stage|set\s*up|open|distribute|collect|upload|post|hang)\b/i.test(t)) out.teacherPrep.push(t);
      else out.aiPrep.push(t);
    });
  }

  // Minimum defaults (avoid injecting “Print handouts” as an AI/Teacher guess unless needed)
  if (!out.teacherPrep.length) out.teacherPrep = ["Stage materials/tools"];
  if (!out.aiPrep.length) out.aiPrep = ["Draft student handout"];

  if (!out.assessment.length) out.assessment=["Exit ticket","Observation at checkpoints"];
  if (!out.materials.length) out.materials=["Board/slides","Notebook","Handout"];
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

  // STRICT JSON schema includes aiPrep and teacherPrep
  var sys={role:"system",content:
"You are a CTE engineering teacher’s assistant. Respond with STRICT JSON only, no prose. Use this exact schema:\n"+
"{\"eq\":string,\n\"eu\":string,\n\"objectives\":string[3],\n\"agenda\":[{\"time\":string,\"activity\":string,\"teacherNotes\":string,\"checks\":string[]}],\n"+
"\"assessment\":string[],\n\"materials\":string[],\n\"aiPrep\":string[],\n\"teacherPrep\":string[],\n\"differentiation\":string[],\n\"teacherNotes\":string[]}\n"+
"Guidelines:\n- Keep items concise and classroom-ready.\n- No links, no markdown, no code fences.\n- Put ANYTHING the assistant could draft/build (handouts, worksheets, slides, exit tickets, rubrics, exemplars, prompts, slide text, instructions) in aiPrep.\n- Put logistics the human must do (print, copy, stage tools/materials, setup hardware, open files, distribute, collect) in teacherPrep.\n"};

  var usr={role:"user",content:
"Generate a 1-day lesson plan JSON for '"+(dayTitle||"Lesson")+"' with these standards and competencies:\n"+
block+"\n\n"+
"Class length: ~50 minutes. Include:\n- 3 measurable objectives.\n- 4–6 agenda steps with brief checks.\n- assessments, materials.\n- aiPrep (what you can author for me later).\n- teacherPrep (what the teacher must physically do).\n- differentiation and teacherNotes.\nReturn STRICT JSON only."};

  // Call in JSON mode; wantJSON=true enables response_format in pe_aiCall_
  var raw = pe_aiCall_([sys,usr], true);
  var json = pe_safeJsonParse_(raw);

  // Retry once if missing critical fields
  if (!(json && json.objectives && json.objectives.length && json.agenda && json.agenda.length)){
    try{
      var usr2 = {role:"user", content:
        "Re-issue STRICT JSON only. Ensure 3 objectives and 4–6 agenda items. Keep aiPrep and teacherPrep populated per schema."};
      var raw2 = pe_aiCall_([sys,usr,usr2], true);
      var j2 = pe_safeJsonParse_(raw2);
      if (j2) json = j2;
    }catch(_){}
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

  // locate {{AI_BODY}} and compute insertion index
  const m = body.findText("\\{\\{AI_BODY\\}\\}");
  let insertIndex = null;
  if (m){
    const t = m.getElement().asText();
    t.deleteText(m.getStartOffset(), m.getEndOffsetInclusive());
    // walk up to a paragraph to get index
function elToPara(el) {
  return PE.DocsCore.elToPara(el);
}

    const para = elToPara(m.getElement());
    if (para) insertIndex = body.getChildIndex(para);
  }
function insParagraph(txt, heading) {
  return PE.DocsCore.insParagraph(txt, heading);
}

function insBlank() {
  return PE.DocsCore.insBlank();
}


  // Helper: add list items of a given type
  
  // Helper: add list items with glyph types ("bullet" | "number" | "checkbox")
function insList(items, mode) {
  return PE.DocsCore.insList(items, mode);
}


  // ===== At a Glance (Q1W2 style table) =====
  var hasGlance = !!(data?.eq || data?.eu || (data?.objectives||[]).length);
  if (hasGlance){
    insParagraph("At a Glance", DocumentApp.ParagraphHeading.HEADING3);
    var tbl = (insertIndex==null)
      ? body.appendTable([["Essential Question", data.eq||""],
                          ["Enduring Understanding", data.eu||""],
                          ["Objectives (Today)", (data.objectives||[]).map(o=>"• "+o).join("\\n")]])
      : body.insertTable(++insertIndex, [["Essential Question", data.eq||""],
                          ["Enduring Understanding", data.eu||""],
                          ["Objectives (Today)", (data.objectives||[]).map(o=>"• "+o).join("\\n")]]);
    for (var r=0;r<tbl.getNumRows();r++){ tbl.getRow(r).getCell(0).editAsText().setBold(true); }
    insBlank();
  }

  // ===== Agenda & Checks (Q1W2 4-column table) =====
  var agenda = Array.isArray(data?.agenda) ? data.agenda : [];
  if (agenda.length){
    insParagraph("Agenda & Checks", DocumentApp.ParagraphHeading.HEADING3);
    var header = ["Time","Activity","Teacher Notes","Checks for Understanding"];
    var agTable = (insertIndex==null) ? body.appendTable([header]) : body.insertTable(++insertIndex, [header]);
    agTable.getRow(0).editAsText().setBold(true);
    agenda.forEach(function(a){
      var row = agTable.appendTableRow();
      row.appendTableCell(String(a.time||""));
      row.appendTableCell(String(a.activity||""));
      row.appendTableCell(String(a.teacherNotes||a.notes||""));
      var checks = Array.isArray(a.checks) ? a.checks : (a.checks ? [a.checks] : []);
      row.appendTableCell(checks.map(function(c){ return "• "+c; }).join("\\n"));
    });
    insBlank();
  }

  // ===== Assessment / Evidence =====
  if ((data?.assessment||[]).length){
    insParagraph("Assessment / Evidence", DocumentApp.ParagraphHeading.HEADING3);
    insList(data.assessment, "bullet");
    insBlank();
  }

  // ===== Materials =====
  if ((data?.materials||[]).length){
    insParagraph("Materials", DocumentApp.ParagraphHeading.HEADING3);
    insList(data.materials, "number");
    insBlank();
  }

  // ===== PREP TODO =====
  var anyPrep = (data?.aiPrep||[]).length || (data?.teacherPrep||[]).length;
  if (anyPrep){
    insParagraph("PREP TODO", DocumentApp.ParagraphHeading.HEADING3);
    if ((data.aiPrep||[]).length){
      insParagraph("AI-Generatable", DocumentApp.ParagraphHeading.HEADING4);
      insList((data.aiPrep||[]).map(function(s){ return "AI: "+s; }), "checkbox");
    }
    if ((data.teacherPrep||[]).length){
      insParagraph("Teacher Tasks", DocumentApp.ParagraphHeading.HEADING4);
      insList(data.teacherPrep, "checkbox");
    }
    insBlank();
  }

  // ===== Differentiation / Accommodations =====
  if ((data?.differentiation||[]).length){
    insParagraph("Differentiation / Accommodations", DocumentApp.ParagraphHeading.HEADING3);
    insList(data.differentiation, "bullet");
    insBlank();
  }

  // ===== Teacher Notes =====
  if ((data?.teacherNotes||[]).length){
    insParagraph("Teacher Notes", DocumentApp.ParagraphHeading.HEADING3);
    insList(data.teacherNotes, "bullet");
    insBlank();
  }

  // Footer quick index (helps scannability)
  insParagraph("\\n\\tAt a Glance \\n\\tAgenda & Checks \\n\\tAssessment / Evidence \\n\\tMaterials \\n\\tPREP TODO \\n\\tDifferentiation / Accommodations \\n\\tTeacher Notes");
}
function upsertWeeklyPlannerDoc_(weekFolder, plan) {
  return PE.WeeklyDoc.upsertWeeklyPlannerDoc_(weekFolder, plan);
}

function linkWeeklyPlanner_(weeklyPlannerDoc, plan, created) {
  return PE.DocsCore.linkWeeklyPlanner_(weeklyPlannerDoc, plan, created);
}

function stampMasterDailyPlan_(startIndex, qweek, datesStr, lessons) {
  return PE.MasterPlanner.stampMasterDailyPlan_(startIndex, qweek, datesStr, lessons);
}

function buildDailyLessons_(weekFolder, plan, startIndex) {
  return PE.MasterPlanner.buildDailyLessons_(weekFolder, plan, startIndex);
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

  pe_updatePacingDocForWeek_(plan, datesStr||"", weeklyPlannerDoc.getUrl(), lessons);


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
function pe_listWeekFiles_(qweek) {
  return PE.Weekly.pe_listWeekFiles_(qweek);
}


/***** ===================== PREP TODO PARSER ===================== *****/
var PE_TODO = (function(){
function isNoiseTodoLine(t) {
  return PE.Todo.isNoiseTodoLine(t);
}

function readPrepFromDoc(docId) {
  return PE.Todo.readPrepFromDoc(docId);
}

function categorizePrepTasks(items) {
  return PE.Todo.categorizePrepTasks(items);
}

  return { isNoiseTodoLine:isNoiseTodoLine, readPrepFromDoc:readPrepFromDoc, categorizePrepTasks:categorizePrepTasks };
})();

/***** ===================== To‑Do ENDPOINTS ===================== *****/
function pe_todoInit() {
  return PE.Todo.pe_todoInit();
}

function pe_todoLoadWeek(qweek) {
  return PE.Todo.pe_todoLoadWeek(qweek);
}

function pe_todoGenerate(qweek, dnum, dayName, task) {
  return PE.Todo.pe_todoGenerate(qweek, dnum, dayName, task);
}

function pe_todoGenerateAll(qweek, items) {
  return PE.Todo.pe_todoGenerateAll(qweek, items);
}


/***** ===================== CLASSROOM HELPERS + ENDPOINTS ===================== *****/
function gc_listMyCourses_() {
  return PE.Classroom.gc_listMyCourses_();
}

function gc_getOrCreateTopic_(courseId, name) {
  return PE.Classroom.gc_getOrCreateTopic_(courseId, name);
}

function gc_fileIdFromUrl_(url) {
  return PE.Classroom.gc_fileIdFromUrl_(url);
}

function gc_driveMaterial_(fileId) {
  return PE.Classroom.gc_driveMaterial_(fileId);
}

function gc_upsertAssignment_(courseId, payload) {
  return PE.Classroom.gc_upsertAssignment_(courseId, payload);
}

function pe_gcInit() {
  return PE.Classroom.pe_gcInit();
}

function pe_gcLoadWeek(qweek, courseId) {
  return PE.Classroom.pe_gcLoadWeek(qweek, courseId);
}

function pe_gcCreateAssignments(courseId, qweek, topicName, items) {
  return PE.Classroom.pe_gcCreateAssignments(courseId, qweek, topicName, items);
}


