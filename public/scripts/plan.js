window.loadPlan=async()=>{
 const el=document.getElementById("pageContent");const {plan}=await api("/plan");
 el.innerHTML=`<div class="form-card"><span class="eyebrow">PREVENÇÃO</span><h2>Meu plano para momentos difíceis</h2><p class="muted">Preencha antes de precisar. Em um momento de craving, ter um plano pronto reduz a necessidade de decidir tudo na hora.</p>
 <form id="planForm" class="form-grid">
 <label class="full-field">Meus principais gatilhos<textarea id="triggers" rows="3"></textarea></label>
 <label class="full-field">O que vou fazer quando a vontade aparecer<textarea id="coping" rows="3"></textarea></label>
 <label class="full-field">Pessoas que posso chamar<textarea id="contacts" rows="2"></textarea></label>
 <label>Locais seguros<textarea id="safePlaces" rows="2"></textarea></label><label>Atividades sem álcool<textarea id="activities" rows="2"></textarea></label>
 <label class="full-field">Por que quero mudar?<textarea id="reasons" rows="3"></textarea></label>
 <label class="full-field">Profissional/serviço que quero procurar<textarea id="professional" rows="2"></textarea></label>
 <button class="btn primary full-field">Salvar plano</button><p id="planMsg" class="form-message full-field"></p></form></div>`;
 if(plan){for(const k of ["triggers","coping","contacts","safe_places","activities","reasons","professional"]){const id=k==="safe_places"?"safePlaces":k;document.getElementById(id).value=plan[k]||""}}
 document.getElementById("planForm").addEventListener("submit",async e=>{e.preventDefault();try{await api("/plan",{method:"PUT",body:{triggers:document.getElementById("triggers").value,coping:document.getElementById("coping").value,contacts:document.getElementById("contacts").value,safePlaces:document.getElementById("safePlaces").value,activities:document.getElementById("activities").value,reasons:document.getElementById("reasons").value,professional:document.getElementById("professional").value}});planMsg.className="form-message success";planMsg.textContent="Plano salvo com sucesso."}catch(err){planMsg.className="form-message error";planMsg.textContent=err.message}});
};
