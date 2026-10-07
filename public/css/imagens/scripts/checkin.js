window.loadCheckin=async()=>{
 const el=document.getElementById("pageContent");
 el.innerHTML=`<div class="form-card"><div class="section-heading"><div><span class="eyebrow">REGISTRO</span><h2>Como você está hoje?</h2><p class="muted">Não existe resposta certa. O objetivo é observar seu momento.</p></div></div>
 <form id="checkinForm" class="form-grid">
 <label>Humor<select id="mood" required><option value="very_bad">Muito ruim</option><option value="bad">Ruim</option><option value="regular" selected>Regular</option><option value="good">Bom</option><option value="very_good">Muito bom</option></select></label>
 <label>Consumo desde o último check-in<select id="consumption" required><option value="none">Nenhum</option><option value="less">Menos que o planejado</option><option value="planned">Como planejado</option><option value="more">Mais que o planejado</option></select></label>
 <label class="full-field">Intensidade da vontade: <strong id="cravingValue">0</strong>/10<input id="craving" type="range" min="0" max="10" value="0"></label>
 <label>Principal influência/gatilho<select id="trigger"><option value="">Nenhum específico</option><option>Ansiedade</option><option>Estresse</option><option>Solidão</option><option>Conflito</option><option>Festa</option><option>Tédio</option><option>Hábito</option><option>Outro</option></select></label>
 <label>Precisa de apoio?<select id="supportNeeded"><option value="0">Não agora</option><option value="1">Sim</option></select></label>
 <label class="full-field">Observações<textarea id="notes" rows="4" placeholder="O que aconteceu? O que ajudou?"></textarea></label>
 <div id="cravingSupport" class="quick-support full-field" hidden></div>
 <button class="btn primary full-field" type="submit">Salvar check-in</button><p id="checkinMsg" class="form-message full-field"></p>
 </form></div>
 <div class="section-heading"><div><span class="eyebrow">HISTÓRICO</span><h2>Seus últimos registros</h2></div></div><div id="checkinHistory" class="list-card"></div>`;
 const slider=document.getElementById("craving");
 slider.addEventListener("input",()=>{document.getElementById("cravingValue").textContent=slider.value;updateSupport(Number(slider.value));});
 document.getElementById("checkinForm").addEventListener("submit",saveCheckin);
 const data=await api("/checkins");renderHistory(data.checkins);
};
function updateSupport(v){
 const box=document.getElementById("cravingSupport");
 if(v<4){box.hidden=true;return;}
 box.hidden=false;
 box.innerHTML=v>=7?`<strong>Modo apoio rápido</strong><p>A vontade está alta. Antes de agir, tente atravessar os próximos minutos com segurança:</p><div class="support-actions"><span>🌬️ Respire por 2 min</span><span>⏳ Espere 10 min</span><span>💧 Tome água ou bebida sem álcool</span><span>🚶 Mude de ambiente</span><a href="apoio.html">♡ Falar com alguém</a></div><div class="safety-box">Você está em risco imediato ou pensa em se machucar? Procure ajuda de emergência local ou alguém de confiança agora.</div>`:`<strong>Prevenção</strong><p>A vontade está moderada. Experimente água, uma pausa, mudar de ambiente e lembrar o motivo do seu objetivo.</p>`;
}
async function saveCheckin(e){
 e.preventDefault();const msg=document.getElementById("checkinMsg");msg.textContent="Salvando...";
 try{
  const d=await api("/checkins",{method:"POST",body:{mood:document.getElementById("mood").value,craving:Number(document.getElementById("craving").value),trigger:document.getElementById("trigger").value,consumption:document.getElementById("consumption").value,supportNeeded:document.getElementById("supportNeeded").value==="1",notes:document.getElementById("notes").value}});
  msg.className="form-message success";msg.textContent=d.highCraving?"Registro salvo. Vamos focar no próximo passo com segurança.":"Obrigado por registrar. Um episódio não apaga seu progresso.";
  const data=await api("/checkins");renderHistory(data.checkins);
 }catch(err){msg.className="form-message error";msg.textContent=err.message}
}
function renderHistory(items){
 document.getElementById("checkinHistory").innerHTML=items.length?items.slice(0,8).map(x=>`<div class="list-row"><div><strong>${x.date}</strong><span>${x.consumption} · gatilho: ${x.trigger||"—"}</span></div><b>${x.craving}/10</b></div>`).join(""):`<p class="muted">Nenhum check-in ainda.</p>`;
}
