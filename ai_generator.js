/** Auto-migrated: AI */
var PE = PE || {};
PE.AI = (function () {
  // moved from global pe_aiPromptForKey
  function pe_aiPromptForKey() {

  const ui=SpreadsheetApp.getUi();
  const r=ui.prompt("Enter OpenAI API Key","Format: sk-...", ui.ButtonSet.OK_CANCEL);
  if(r.getSelectedButton()!==ui.Button.OK) return;
  const k=(r.getResponseText()||"").trim();
  if(!/^sk-/.test(k)){ ui.alert("That doesn’t look like an OpenAI key."); return; }
  PropertiesService.getScriptProperties().setProperty("PE_OPENAI_KEY",k);
  ui.alert("Saved.");

  }

  // moved from global pe_aiGetKey_
  function pe_aiGetKey_() {
 return PropertiesService.getScriptProperties().getProperty("PE_OPENAI_KEY")||""; 
  }

  // moved from global pe_aiDiagnostics
  function pe_aiDiagnostics() {

  const k=pe_aiGetKey_(); if(!k){ pe_toast_("No OpenAI key set."); return; }
  const ok = pe_aiCall_([{role:"user", content:"Reply with 'ok'"}], false);
  pe_toast_(String(ok).trim().toLowerCase()==="ok"?"AI OK":"AI unexpected response");

  }

  // moved from global pe_aiCall_
  function pe_aiCall_(messages, wantJSON) {

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

  return { pe_aiPromptForKey: pe_aiPromptForKey, pe_aiGetKey_: pe_aiGetKey_, pe_aiDiagnostics: pe_aiDiagnostics, pe_aiCall_: pe_aiCall_ };
})();
