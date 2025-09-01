/** @file utils.gs — shared helpers (logging, dates, parsing, retry) */
var PE = PE || {};

PE.Utils = (function () {
  function log() {
    try {
      var parts = Array.prototype.slice.call(arguments).map(String);
      console.log(parts.join(' '));
    } catch (e) {}
  }
  function assert(cond, msg) {
    if (!cond) throw new Error(msg || 'Assertion failed');
  }
  function toIsoDate(d) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  function toIsoMinute(d) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm");
  }
  function parseWeekCode(s) {
    var m = String(s || '').trim().match(/^Q(\d+)W(\d+)$/i);
    return m ? { q: +m[1], w: +m[2] } : null;
  }
  function uniq(arr) {
    var seen = Object.create(null), out = [];
    (arr || []).forEach(function (x) {
      var k = String(x);
      if (!seen[k]) { seen[k] = true; out.push(x); }
    });
    return out;
  }
  function safeJsonParse(text) {
    try { return { ok: true, value: JSON.parse(text) }; }
    catch (e) { return { ok: false, error: e, text: text }; }
  }
  function withRetry(fn, opt) {
    opt = opt || {};
    var retries = Math.max(0, opt.retries || 3);
    var base = Math.max(50, opt.baseMs || 200);
    var attempt = 0, lastErr;
    while (attempt <= retries) {
      try { return fn(); } catch (e) {
        lastErr = e;
        if (attempt === retries) break;
        Utilities.sleep(base * Math.pow(2, attempt));
        attempt++;
      }
    }
    throw lastErr;
  }
  function oneline(str) { return String(str || '').replace(/\s+/g, ' ').trim(); }

  return {
    log: log,
    assert: assert,
    toIsoDate: toIsoDate,
    toIsoMinute: toIsoMinute,
    parseWeekCode: parseWeekCode,
    uniq: uniq,
    safeJsonParse: safeJsonParse,
    withRetry: withRetry,
    oneline: oneline
  };
})();
