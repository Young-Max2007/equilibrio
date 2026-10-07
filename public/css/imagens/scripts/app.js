const API="/api";
const token=()=>localStorage.getItem("equilibrio_token");
const user=()=>JSON.parse(localStorage.getItem("equilibrio_user")||"null");

function applyTheme(){
  document.documentElement.dataset.theme=localStorage.getItem("equilibrio_theme")||"light";
}
applyTheme();
const pageLoaders={
  principal:()=>{}, checkin:()=>window.loadCheckin?.(), recompensas:()=>window.loadRewards?.(),
  gatilhos:()=>window.loadTriggers?.(), plano:()=>window.loadPlan?.(), apoio:()=>window.loadSupport?.(),
  conteudos:()=>{}, progresso:()=>window.loadProgress?.(), configuracoes:()=>window.loadSettings?.()
};

async function api(path,options={}){
  const headers={...(options.headers||{}),Authorization:"Bearer "+token()};
  if(options.body && typeof options.body!=="string"){
    headers["Content-Type"]="application/json";
    options.body=JSON.stringify(options.body);
  }
  const r=await fetch(API+path,{...options,headers});
  const data=await r.json().catch(()=>({}));
  if(r.status===401){
    localStorage.removeItem("equilibrio_token");
    localStorage.removeItem("equilibrio_user");
    location.href="index.html";
    throw new Error(data.error||"Sessão expirada.");
  }
  if(!r.ok)throw new Error(data.error||"Erro na operação.");
  return data;
}

function initPage(page){
  if(!token()){location.href="index.html";return;}
  renderShell(page);
  document.addEventListener("click",e=>{
    if(e.target.closest("[data-logout]")) logout();
    if(e.target.closest("[data-menu]")) document.body.classList.toggle("menu-open");
    if(e.target.closest("[data-theme-toggle]")) toggleTheme();
  });
  loadPage(page);
}

function renderShell(page){
  const links=[
    ["principal.html","⌂","Início","principal"],
    ["checkin.html","✓","Check-in diário","checkin"],
    ["recompensas.html","★","Recompensas","recompensas"],
    ["gatilhos.html","◈","Mapa de gatilhos","gatilhos"],
    ["plano.html","◌","Plano de prevenção","plano"],
    ["apoio.html","♡","Rede de apoio","apoio"],
    ["conteudos.html","▤","Conteúdos","conteudos"],
    ["progresso.html","◒","Progresso","progresso"],
    ["configuracoes.html","⚙","Configurações","configuracoes"]
  ];
  document.getElementById("appShell").innerHTML=`
  <div class="app">
    <aside class="sidebar">
      <div class="brand"><img src="imagens/logo.svg" alt="Logo Equilíbrio"><span>Equilíbrio</span></div>
      <nav>${links.map(x=>`<a class="${page===x[3]?"active":""}" href="${x[0]}"><b>${x[1]}</b>${x[2]}</a>`).join("")}</nav>
      <button class="logout-link" data-logout>Sair da conta</button>
    </aside>
    <div class="mobile-top"><button class="icon-btn" data-menu>☰</button><div class="brand"><img src="imagens/logo.svg" alt="Logo"><span>Equilíbrio</span></div></div>
    <main class="main"><header class="topbar"><div><span class="eyebrow">SEU ESPAÇO</span><h1 id="pageTitle">${pageTitle(page)}</h1></div><div class="user-chip">${escapeHtml(user()?.name||"Usuário")}</div></header><section id="pageContent"></section></main>
  </div>`;
}

function pageTitle(p){
  return {principal:"Olá, "+(user()?.name?.split(" ")[0]||"por aqui")+" 👋",checkin:"Check-in diário",recompensas:"Recompensas",gatilhos:"Mapa de gatilhos",plano:"Plano de prevenção",apoio:"Rede de apoio",conteudos:"Biblioteca de conteúdos",progresso:"Seu progresso",configuracoes:"Configurações"}[p]||"Equilíbrio";
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function toggleTheme(){const next=(document.documentElement.dataset.theme==="dark"?"light":"dark");localStorage.setItem("equilibrio_theme",next);applyTheme();if(window.renderSettings)window.renderSettings();}
function logout(){fetch(API+"/logout",{method:"POST",headers:{Authorization:"Bearer "+token()}}).finally(()=>{localStorage.removeItem("equilibrio_token");localStorage.removeItem("equilibrio_user");location.href="index.html";});}

async function loadPage(page){
  const el=document.getElementById("pageContent");
  if(page==="principal"){
    const [me,cs]=await Promise.all([api("/me"),api("/checkins")]);
    const count=cs.checkins.length, last=cs.checkins[0];
    el.innerHTML=`
      <div class="hero-card"><div><span class="eyebrow">HOJE</span><h2>Você não precisa resolver tudo de uma vez.</h2><p>O importante é observar, registrar e escolher o próximo passo possível.</p><a class="btn primary" href="checkin.html">Fazer meu check-in</a></div><div class="hero-mark">✦</div></div>
      <div class="stats-grid"><div class="stat-card"><span>Check-ins</span><strong>${count}</strong><small>registros realizados</small></div><div class="stat-card"><span>Última vontade</span><strong>${last?last.craving:"—"}</strong><small>de 0 a 10</small></div><div class="stat-card"><span>Objetivo</span><strong>${goalLabel(me.user.goal)}</strong><small>pode ser alterado</small></div></div>
      <div class="section-heading"><div><span class="eyebrow">PRÓXIMOS PASSOS</span><h2>Seu espaço de cuidado</h2></div></div>
      <div class="card-grid three"><a class="feature-card" href="gatilhos.html"><b>◈</b><h3>Entenda seus gatilhos</h3><p>Registre contextos, pensamentos e o que ajudou.</p></a><a class="feature-card" href="plano.html"><b>◌</b><h3>Monte seu plano</h3><p>Defina estratégias para momentos difíceis.</p></a><a class="feature-card" href="recompensas.html"><b>★</b><h3>Veja suas recompensas</h3><p>Check-ins também podem virar pequenas conquistas.</p></a></div>`;
  }
  if(page==="conteudos"){
    el.innerHTML=`<div class="notice"><strong>Importante:</strong> este conteúdo é educativo. O sistema não diagnostica dependência nem substitui avaliação profissional.</div>
    <div class="content-grid">
      ${[
        ["Gatilhos","Como identificar lugares, pessoas, emoções e horários associados à vontade."],
        ["Craving","A vontade pode subir e descer. Observar a intensidade ajuda a escolher uma resposta."],
        ["Recusar bebidas","Prepare frases curtas e alternativas antes de situações sociais."],
        ["Sono e estresse","Rotinas de sono, descanso e redução de estresse podem apoiar o cuidado."],
        ["Família e apoio","Pedir ajuda não é fracasso. Combine formas de contato que respeitem sua privacidade."],
        ["Uso de risco e AUD","Informação pode orientar uma conversa com profissional, mas não substitui diagnóstico."],
        ["Abstinência","Após uso pesado, parar abruptamente pode ser perigoso. Procure avaliação profissional."],
        ["Buscar ajuda","Psicólogos, médicos, CAPS e grupos podem fazer parte da rede de cuidado."]
      ].map(x=>`<article class="article-card"><span class="article-icon">●</span><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}</div>`;
  }
}
  pageLoaders[page]?.();
}

function goalLabel(g){return {stop:"Parar",reduce:"Reduzir",professional:"Buscar ajuda"}[g]||"Definir"}

