// standards.js — Optimized + Legacy API aliases (v3)
var PE = PE || {};
PE.Standards = (function(ns){
  const CACHE_KEY = "standards:v3";
  const CACHE_TTL = 60*60*6; // 6 hours

  /**
   * Loads standards into a UI-friendly shape:
   * { outcomes: [{code, title, strandCode, strandName}], compsByOutcome: { [oc]: [{code, text}], ... } }
   */
  ns.load = function(){
    const cache = CacheService.getScriptCache();
    const hit = cache.get(CACHE_KEY);
    if (hit) return JSON.parse(hit);

    const ss = SpreadsheetApp.openById(PE.Config.getStandardsSheetId());
    const sh = ss.getSheets()[0];
    const lastRow = sh.getLastRow();
    if (lastRow < 2) {
      const empty = { outcomes: [], compsByOutcome: {} };
      cache.put(CACHE_KEY, JSON.stringify(empty), CACHE_TTL);
      return empty;
    }

    const vals = sh.getRange(2,1, lastRow-1, 6).getValues(); // A..F

    const outcomes = [];
    const compsByOutcome = {};

    vals.forEach(r => {
      const strandCode = (r[0]||"").toString().trim();
      const strandName = (r[1]||"").toString().trim();
      const ocCode     = (r[2]||"").toString().trim();
      const ocTitle    = (r[3]||"").toString().trim();
      const cpCode     = (r[4]||"").toString().trim();
      const cpText     = (r[5]||"").toString().trim();

      if (ocCode && !outcomes.find(o=>o.code===ocCode)){
        outcomes.push({ code: ocCode, title: ocTitle, strandCode, strandName });
      }
      if (ocCode && cpCode){
        (compsByOutcome[ocCode] = compsByOutcome[ocCode] || []).push({ code: cpCode, text: cpText });
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
    return (comps||[]).filter(c=>all.indexOf(c)>=0);
  };

  // Parse a free-text list of codes into { outcomes:[], comps:[] }
  // Accepts tokens like: 5.2, 5.3.1, 5.3.a, 1.4.B, etc.
  ns.parseCodes = function(text){
    if (!text) return { outcomes:[], comps:[] };
    const tokens = String(text)
      .split(/[^0-9a-zA-Z\.]+/)
      .map(t=>t.trim())
      .filter(Boolean);

    const out = { outcomes:[], comps:[] };
    const seenO = new Set(), seenC = new Set();

    tokens.forEach(tok=>{
      // normalize e.g., 5.3.A -> 5.3.A (keep case), and 05.02 -> 5.2 (trim leading zeros)
      const parts = tok.split('.').filter(Boolean);
      if (parts.length >= 2){
        const ocKey = parts[0].replace(/^0+/, '') + '.' + parts[1].replace(/^0+/, '');
        if (parts.length === 2){
          if (!seenO.has(ocKey)){
            seenO.add(ocKey); out.outcomes.push(ocKey);
          }
        } else {
          // competency = oc + '.' + rest
          const rest = parts.slice(2).join('.');
          const cKey = ocKey + '.' + rest;
          if (!seenC.has(cKey)){
            seenC.add(cKey); out.comps.push(cKey);
          }
        }
      }
    });
    return out;
  };

  // ---------- Legacy API (backward compatibility) ----------
  ns.pe_getStandardsForUI = function(){ return ns.load(); };
  ns.pe_getCompetencyCatalog_ = function(){ return ns.load().compsByOutcome || {}; };
  ns.pe_getOutcomes_ = function(){ return ns.load().outcomes || []; };
  ns.pe_validateCodesForOutcome_ = function(oc, comps){ return ns.validateCodesForOutcome(oc, comps); };
  // New alias matching your error
  ns.parseOutcomeList_ = function(text){
    // Historically used to parse free-text codes from the Master sheet.
    return ns.parseCodes(text);
  };

  return ns;
})(PE.Standards || {});
