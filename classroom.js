/** Auto-migrated: Classroom */
var PE = PE || {};
PE.Classroom = (function () {
  // moved from global gc_listMyCourses_
  function gc_listMyCourses_() {

  try {
    var res = Classroom.Courses.list({ teacherId: "me" });
    return (res.courses || []).map(function(c){ return {id:c.id, name:c.name}; });
  } catch (e) { Logger.log("gc_listMyCourses_ error: " + e); return []; }

  }

  // moved from global gc_getOrCreateTopic_
  function gc_getOrCreateTopic_(courseId, name) {

  var existing = Classroom.Courses.Topics.list(courseId);
  var hit = (existing.topic || []).find(function(t){ return t.name === name; });
  if (hit) return hit.id;
  var created = Classroom.Courses.Topics.create({ name: name }, courseId);
  return created.id;

  }

  // moved from global gc_fileIdFromUrl_
  function gc_fileIdFromUrl_(url) {
 var m = String(url||"").match(/[-\\w]{25,}/); return m ? m[0] : ""; 
  }

  // moved from global gc_driveMaterial_
  function gc_driveMaterial_(fileId) {
 return { driveFile: { driveFile: { id: fileId } } }; 
  }

  // moved from global gc_upsertAssignment_
  function gc_upsertAssignment_(courseId, payload) {

  var list = Classroom.Courses.CourseWork.list(courseId, { courseWorkStates: ["PUBLISHED","DRAFT"] });
  var existing = (list.courseWork || []).find(function(cw){ return cw.title === payload.title; });
  if (existing) {
    var patchMask = "title,description,dueDate,dueTime,topicId,materials,maxPoints,state,scheduledTime";
    return Classroom.Courses.CourseWork.patch(payload, courseId, existing.id, { updateMask: patchMask });
  } else { return Classroom.Courses.CourseWork.create(payload, courseId); }

  }

  // moved from global pe_gcInit
  function pe_gcInit() {

  var courses = []; try { courses = gc_listMyCourses_(); } catch(e){ Logger.log(e); }
  return { courses: courses, defaultCourseId: (typeof GC_COURSE_ID!=='undefined' && GC_COURSE_ID) ? GC_COURSE_ID : ((courses[0] && courses[0].id) || ""), weeks: pe_collectWeeks_() };

  }

  // moved from global pe_gcLoadWeek
  function pe_gcLoadWeek(qweek, courseId) {

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

  // moved from global pe_gcCreateAssignments
  function pe_gcCreateAssignments(courseId, qweek, topicName, items) {

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

  return { gc_listMyCourses_: gc_listMyCourses_, gc_getOrCreateTopic_: gc_getOrCreateTopic_, gc_fileIdFromUrl_: gc_fileIdFromUrl_, gc_driveMaterial_: gc_driveMaterial_, gc_upsertAssignment_: gc_upsertAssignment_, pe_gcInit: pe_gcInit, pe_gcLoadWeek: pe_gcLoadWeek, pe_gcCreateAssignments: pe_gcCreateAssignments };
})();
