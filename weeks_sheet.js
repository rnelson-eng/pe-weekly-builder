// weeks_sheet.js — Optimized + Legacy API aliases
var PE = PE || {};
PE.Weeks = (function(ns){
  const CACHE_KEY = "weeksMap:v1";
  const CACHE_TTL = 60*30; // 30 min

  /**
   * Returns an object like { "Q1W1":"Aug 19–23", ... }
   */
  ns.getWeeksMap = function(){
    const cache = CacheService.getScriptCache();
    const hit = cache.get(CACHE_KEY);
    if (hit) return JSON.parse(hit);

    const ss = SpreadsheetApp.openById(PE.Config.getWeeksSheetId());
    const sh = ss.getSheetByName(PE.Config.getWeeksSheetName());
    if (!sh) return {};

    const lastRow = sh.getLastRow();
    if (lastRow < 2) return {};

    const vals = sh.getRange(2,1, lastRow-1, 2).getValues(); // Week | Dates
    const map = {};
    vals.forEach(r => {
      const week = (r[0]||"").toString().trim();
      if (week) map[week] = (r[1]||"").toString().trim();
    });

    cache.put(CACHE_KEY, JSON.stringify(map), CACHE_TTL);
    return map;
  };

  /**
   * Returns the dates string for a given week (or empty string).
   */
  ns.getDatesForWeek = function(weekCode){
    const map = ns.getWeeksMap();
    return map[weekCode] || "";
  };

  ns.clearCache = function(){
    CacheService.getScriptCache().remove(CACHE_KEY);
  };

  // ---------- Legacy API (backward compatibility) ----------
  // Some existing code expects these functions to exist.
  ns.pe_collectWeeks_ = function(){
    const map = ns.getWeeksMap();
    // Convert to array of {week, dates} to match older call sites
    return Object.keys(map).sort().map(week => ({ week: week, dates: map[week] }));
  };

  ns.pe_getDatesForWeek = function(weekCode){
    return ns.getDatesForWeek(weekCode);
  };

  return ns;
})(PE.Weeks || {});
