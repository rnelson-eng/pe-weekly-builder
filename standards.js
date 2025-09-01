
// standards.js — Optimized
var PE = PE || {};
PE.Standards = (function(ns){
  const CACHE_KEY = "standards:v2";
  const CACHE_TTL = 60*60*6; // 6 hours

  ns.load = function(){
    const cache = CacheService.getScriptCache();
    const hit = cache.get(CACHE_KEY);
    if (hit) return JSON.parse(hit);

    const ss = SpreadsheetApp.openById(PE.Config.getStandardsSheetId());
    const sh = ss.getSheets()[0];
    const vals = sh.getRange(2,1, sh.getLastRow()-1, 6).getValues();

    const outcomes = [];
    const compsByOutcome = {};

    vals.forEach(r => {
      const [strandCode, strandName, ocCode, ocTitle, cpCode, cpText] = r.map(x=>(x||"").toString().trim());
      if (ocCode && !outcomes.find(o=>o.code===ocCode)){
        outcomes.push({ code: ocCode, title: ocTitle, strandCode, strandName });
      }
      if (ocCode && cpCode){
        compsByOutcome[ocCode] = compsByOutcome[ocCode] || [];
        compsByOutcome[ocCode].push({ code: cpCode, text: cpText });
      }
    });

    const payload = { outcomes, compsByOutcome };
    cache.put(CACHE_KEY, JSON.stringify(payload), CACHE_TTL);
    return payload;
  };

  ns.clearCache = function(){
    CacheService.getScriptCache().remove(CACHE_KEY);
  };

  ns.validateCodesForOutcome = function(oc, comps){
    const all = (ns.load().compsByOutcome[oc]||[]).map(c=>c.code);
    return comps.filter(c=>all.indexOf(c)>=0);
  };

  return ns;
})(PE.Standards || {});
