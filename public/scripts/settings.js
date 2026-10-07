window.loadSettings=async()=>{
 const el=document.getElementById("pageContent");
 el.innerHTML=`<div class="settings-grid"><div class="form-card"><span class="eyebrow">APARÊNCIA</span><h2>Tema do sistema</h2><p class="muted">Escolha como o Equilíbrio será exibido neste dispositivo.</p><div class="setting-row"><div><strong>Modo escuro</strong><span>Reduz o brilho e troca a paleta para tons escuros.</span></div><button class="switch ${document.documentElement.dataset.theme==="dark"?"on":""}" data-theme-toggle aria-label="Alternar tema"><i></i></button></div></div>
 <div class="form-card"><span class="eyebrow">OBJETIVO</span><h2>Meu objetivo</h2><select id="goalSetting"><option value="stop">Parar completamente</option><option value="reduce">Reduzir a frequência</option><option value="professional">Preparar-me para buscar ajuda profissional</option></select><button class="btn primary" id="saveGoal">Salvar objetivo</button><p id="goalMsg" class="form-message"></p></div>
 <div class="form-card"><span class="eyebrow">DADOS</span><h2>Controle dos seus dados</h2><div class="button-stack"><button class="btn ghost" id="exportData">Exportar meus dados</button><button class="btn danger" id="deleteAccount">Excluir minha conta permanentemente</button></div><p class="muted">A exclusão remove os registros associados à conta do banco local.</p></div>
 </div>`;
 const me=await api("/me");document.getElementById("goalSetting").value=me.user.goal||"reduce";
 saveGoal.onclick=async()=>{try{await api("/goal",{method:"PUT",body:{goal:document.getElementById("goalSetting").value}});goalMsg.className="form-message success";goalMsg.textContent="Objetivo atualizado."}catch(e){goalMsg.className="form-message error";goalMsg.textContent=e.message}};
 exportData.onclick=async()=>{const d=await api("/export");const blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="equilibrio-meus-dados.json";a.click();URL.revokeObjectURL(a.href)};
 deleteAccount.onclick=async()=>{if(!confirm("Tem certeza? Essa ação é permanente."))return;await api("/delete-account",{method:"DELETE"});localStorage.clear();location.href="index.html"};
};
window.renderSettings=loadSettings;
