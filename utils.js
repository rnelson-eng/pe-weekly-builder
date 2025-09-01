/** Auto-migrated: Utils */
var PE = PE || {};
PE.Utils = (function () {
  // moved from global pe_getSingle_
  function pe_getSingle_(it, err) {
 if(!it.hasNext()) throw new Error(err); return it.next(); 
  }

  // moved from global arr
  function arr(x) {
 return Array.isArray(x) ? x.filter(Boolean) : (x ? [x] : []); 
  }

  return { pe_getSingle_: pe_getSingle_, arr: arr };
})();
