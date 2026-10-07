window.loadTriggers=async()=>{
 const el=document.getElementById("pageContent");
 el.innerHTML=`<div class="form-card"><span class="eyebrow">OBSERVAÇÃO</span><h2>O que estava acontecendo?</h2><p class="muted">Mapear contexto ajuda a encontrar padrões sem transformar o registro em julgamento.</p>
 <form id="triggerForm" class="form-grid">
 <label>Onde?<input id="place" placeholder="Casa, trabalho, bar..."></label><label>Com quem?<input id="people" placeholder="Sozinho, amigos, família..."></label>
 <label>Como você se sentia?<input id="feeling" placeholder="Ansioso, cansado..."></label><label>O que pensou?<input id="thought" placeholder="Ex.: preciso relaxar"></label>
 <label>Ação tomada?<input id="action" placeholder="Bebi, saí do local, liguei para alguém..."></label><label>O que ajudou/não ajudou?<input id="helped" placeholder="Descreva"></label>
 <button class="btn primary full-field">Salvar gatilho</button><p id="triggerMsg" class="form-message full-field"></p></form></div>
 <div class="section-heading"><div><span class="eyebrow">PADRÕES</span><h2>Registros recentes</h2></div></div><div id="triggerList" class="list-card"></div>`;
 document.getElementById("triggerForm").addEventListener("submit",async e=>{e.preventDefault();try{await api("/triggers",{method:"POST",body:{place:document.getElementById("place").value,people:document.getElementById("people").value,feeling:document.getElementById("feeling").value,thought:document.getElementById("thought").value,action:document.getElementById("action").value,helped:document.getElementById("helped").value}});triggerMsg.className="form-message success";triggerMsg.textContent="Gatilho registrado.";e.target.reset();renderTriggers();}catch(err){triggerMsg.className="form-message error";triggerMsg.textContent=err.message}});
 renderTriggers();
};
async function renderTriggers(){const {triggers}=await api("/triggers");document.getElementById("triggerList").innerHTML=triggers.length?triggers.slice(0,10).map(x=>`<div class="list-row"><div><strong>${x.date} · ${x.place||"local não informado"}</strong><span>${x.feeling||"sentimento não informado"} · ${x.people||"companhia não informada"}</span><small>${x.helped||""}</small></div></div>`).join(""):`<p class="muted">Nenhum gatilho registrado.</p>`}
