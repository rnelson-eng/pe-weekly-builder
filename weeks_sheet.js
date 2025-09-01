
// weeks_sheet.js — Optimized
var PE = PE || {};
PE.Weeks = (function(ns){
  const CACHE_KEY = "weeksMap:v1";
  const CACHE_TTL = 60*30; // 30 min

  ns.getWeeksMap = function(){
    const cache = CacheService.getScriptCache();
    const hit = cache.get(CACHE_KEY);
    if (hit) return JSON.parse(hit);

    const ss = SpreadsheetApp.openById(PE.Config.getWeeksSheetId());
    const sh = ss.getSheetByName(PE.Config.getWeeksSheetName());
    const vals = sh.getRange(2,1, sh.getLastRow()-1, 2).getValues(); // Week | Dates

    const map = {};
    vals.forEach(r => {
      const week = (r[0]||"").toString().trim();
      if (week) map[week] = (r[1]||"").toString().trim();
    });

    cache.put(CACHE_KEY, JSON.stringify(map), CACHE_TTL);
    return map;
  };

  ns.getDatesForWeek = function(weekCode){
    const map = ns.getWeeksMap();
    return map[weekCode] || "";
  };

  ns.clearCache = function(){
    CacheService.getScriptCache().remove(CACHE_KEY);
  };

  return ns;
})(PE.Weeks || {});
