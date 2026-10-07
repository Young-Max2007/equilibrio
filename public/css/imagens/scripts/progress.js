window.loadProgress=async()=>{
 const el=document.getElementById("pageContent");const {checkins}=await api("/checkins");const n=checkins.length;
 const avg=n?(checkins.reduce((a,x)=>a+x.craving,0)/n).toFixed(1):"—";
 const high=checkins.filter(x=>x.craving>=7).length;
 const none=checkins.filter(x=>x.consumption==="none").length;
 el.innerHTML=`<div class="stats-grid"><div class="stat-card"><span>Total de check-ins</span><strong>${n}</strong><small>observações registradas</small></div><div class="stat-card"><span>Vontade média</span><strong>${avg}</strong><small>escala de 0 a 10</small></div><div class="stat-card"><span>Cravings altos</span><strong>${high}</strong><small>registros com 7+</small></div></div>
 <div class="form-card"><span class="eyebrow">EVOLUÇÃO</span><h2>O que seus registros mostram</h2><div class="progress-line"><span>Check-ins sem consumo</span><b>${none}</b></div><div class="bar"><i style="width:${n?Math.round(none/n*100):0}%"></i></div><div class="progress-line"><span>Registros com craving abaixo de 4</span><b>${n?checkins.filter(x=>x.craving<4).length:0}</b></div><div class="bar"><i style="width:${n?Math.round(checkins.filter(x=>x.craving<4).length/n*100):0}%"></i></div></div>
 <div class="notice"><strong>Lembrete:</strong> progresso não é só quantidade de dias sem beber. Registrar, pedir ajuda, identificar gatilhos e voltar ao plano também são sinais importantes de cuidado.</div>`;
};
