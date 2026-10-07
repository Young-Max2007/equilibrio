window.loadRewards=async()=>{
 const el=document.getElementById("pageContent");const {checkins}=await api("/checkins");const count=checkins.length;
 const rewards=[
  [5,"🍦","Sorveteria Doce Equilíbrio","5% de desconto","Um pequeno prêmio por começar a registrar seu caminho."],
  [10,"☕","Café Bem-Estar","10% de desconto","Uma pausa para você também faz parte do cuidado."],
  [20,"🎬","Cine Praça","30% de desconto","Escolha uma atividade prazerosa sem álcool."],
  [30,"🏋️","Academia Movimento","60% de desconto","Um incentivo para investir em uma atividade saudável."],
  [50,"🎁","Parceiro Equilíbrio","1 benefício especial","Você chegou a uma grande marca de acompanhamento."]
 ];
 el.innerHTML=`<div class="hero-card reward-hero"><div><span class="eyebrow">SUAS CONQUISTAS</span><h2>${count} check-ins realizados</h2><p>As recompensas valorizam o hábito de se observar. Elas não dependem de uma sequência perfeita de dias.</p></div><div class="big-number">${count}</div></div><div class="reward-grid">${rewards.map(r=>{const unlocked=count>=r[0];return `<article class="reward-card ${unlocked?"unlocked":"locked"}"><div class="reward-top"><span class="reward-icon">${r[1]}</span><span class="reward-status">${unlocked?"DESBLOQUEADA":"BLOQUEADA"}</span></div><span class="eyebrow">${r[0]} CHECK-INS</span><h3>${r[2]}</h3><strong>${r[3]}</strong><p>${r[4]}</p><div class="reward-progress"><span style="width:${Math.min(100,Math.round(count/r[0]*100))}%"></span></div><small>${unlocked?"Disponível para resgate — substitua esta regra pela integração real.":`Faltam ${r[0]-count} check-in(s).`}</small></article>`}).join("")}</div><div class="notice"><strong>Observação:</strong> os estabelecimentos acima são exemplos fictícios. Você pode trocar nomes, descontos e regras diretamente em <code>scripts/rewards.js</code>.</div>`;
};
