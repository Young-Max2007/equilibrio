
async function initPage(page) {
  const user = await me();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const shell = document.querySelector('#appShell');
  if (!shell) return;

  const nav = [
    ['principal', 'Início'], ['checkin', 'Check-in'], ['gatilhos', 'Gatilhos'],
    ['plano', 'Plano'], ['apoio', 'Apoio'], ['recompensas', 'Recompensas'],
    ['progresso', 'Progresso'], ['conteudos', 'Conteúdos'], ['configuracoes', 'Configurações']
  ];

  shell.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <img src="imagens/logo.svg" class="side-logo" alt="Equilíbrio">
        ${nav.map(([key, label]) => `<a href="${key}.html" class="${page === key ? 'active' : ''}">${label}</a>`).join('')}
        <button id="logoutButton" class="btn secondary" type="button">Sair</button>
      </aside>
      <main class="main">
        <header class="topbar"><h1>${pageTitle(page)}</h1><b>${escapeHTML(user.name)}</b></header>
        <section id="content"></section>
      </main>
    </div>`;

  document.querySelector('#logoutButton').addEventListener('click', () => {
    logout();
    window.location.href = 'index.html';
  });

  applyTheme();

  const renderer = window[`page_${page}`];
  if (typeof renderer === 'function') {
    try {
      await renderer(user);
    } catch (error) {
      console.error(`Erro ao carregar a página ${page}:`, error);
      shell.querySelector('#content').innerHTML = `
        <article class="card">
          <h2>Não foi possível carregar esta página.</h2>
          <p>Ocorreu um erro ao carregar os dados. Tente atualizar a página.</p>
        </article>`;
    }
  }
}

function pageTitle(page) {
  return {
    principal: 'Olá 👋', checkin: 'Check-in diário', gatilhos: 'Mapa de gatilhos',
    plano: 'Plano de prevenção', apoio: 'Apoio rápido', recompensas: 'Recompensas',
    progresso: 'Seu progresso', conteudos: 'Conteúdos', configuracoes: 'Configurações'
  }[page] || 'Equilíbrio';
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function applyTheme() {
  document.documentElement.dataset.theme = localStorage.getItem('eq_theme') === 'dark' ? 'dark' : 'light';
}

function getContent() { return document.querySelector('#content'); }

window.page_principal = async user => {
  const checkins = await byUser('checkins', user.id);
  getContent().innerHTML = `<div class="grid">
    <article class="card"><h3>Check-ins</h3><strong class="stat">${checkins.length}</strong></article>
    <article class="card"><h3>Objetivo</h3><p>${escapeHTML(user.goal || 'Ainda não definido')}</p></article>
    <article class="card"><h3>Última vontade</h3><strong class="stat">${checkins.at(-1)?.craving ?? '—'}</strong></article>
  </div><div class="grid grid2">
    <article class="card"><h2>Como você está hoje?</h2><p>Faça um check-in sem julgamento.</p><a href="checkin.html"><button type="button">Fazer check-in</button></a></article>
    <article class="card"><h2>Vontade forte?</h2><p>Respire, mude de ambiente e procure apoio.</p><a href="apoio.html"><button type="button">Abrir apoio</button></a></article>
  </div>`;
};

window.page_checkin = async user => {
  getContent().innerHTML = `<form id="checkinForm" class="card formgrid">
    <label>Humor<select id="mood"><option>Muito mal</option><option>Mal</option><option>Regular</option><option>Bem</option><option>Muito bem</option></select></label>
    <label>Consumo<select id="cons"><option>Nenhum</option><option>Menor que o planejado</option><option>Conforme planejado</option><option>Maior que o planejado</option></select></label>
    <label>Vontade 0–10<input id="craving" type="range" min="0" max="10" value="0"><b id="cravingValue">0</b></label>
    <label>Gatilho<select id="trigger"><option>Ansiedade</option><option>Estresse</option><option>Solidão</option><option>Conflito</option><option>Festa</option><option>Tédio</option><option>Hábito</option><option>Outro</option></select></label>
    <label>Precisa de apoio?<select id="need"><option>Não</option><option>Sim</option></select></label>
    <button type="submit">Salvar</button><p id="checkinMessage"></p>
  </form>`;
  const form = document.querySelector('#checkinForm');
  const craving = document.querySelector('#craving');
  const cravingValue = document.querySelector('#cravingValue');
  craving.addEventListener('input', () => cravingValue.textContent = craving.value);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    await add('checkins', { userId: user.id, date: Date.now(), mood: document.querySelector('#mood').value,
      cons: document.querySelector('#cons').value, craving: Number(craving.value),
      trigger: document.querySelector('#trigger').value, need: document.querySelector('#need').value });
    document.querySelector('#checkinMessage').textContent = Number(craving.value) >= 7
      ? 'Salvo. A vontade está alta: priorize segurança e apoio.'
      : 'Salvo. Obrigado por registrar como você está.';
  });
};

window.page_recompensas = async user => {
  const count = (await byUser('checkins', user.id)).length;
  const rewards = [[5, '5%', 'Sorveteria'], [10, '10%', 'Lazer'], [20, '30%', 'Bem-estar'], [30, '60%', 'Academia']];
  getContent().innerHTML = `<div class="grid grid2">${rewards.map(([needed, discount, name]) =>
    `<article class="card"><strong class="stat">${discount}</strong><h2>${name}</h2><p>${count >= needed ? '🎉 Desbloqueada!' : `🔒 ${needed} check-ins. Faltam ${needed - count}.`}</p></article>`).join('')}</div>`;
};

window.page_gatilhos = async user => {
  getContent().innerHTML = `<form id="triggerForm" class="card formgrid">
    <label>Onde?<input id="place"></label><label>Com quem?<input id="who"></label><label>Como se sentiu?<input id="feel"></label>
    <label>O que pensou?<input id="thought"></label><label>O que fez?<input id="act"></label><label>O que ajudou?<textarea id="help"></textarea></label>
    <button type="submit">Registrar</button></form><div id="triggerList" class="list"></div>`;
  const form = document.querySelector('#triggerForm');
  async function refresh() {
    const items = (await byUser('triggers', user.id)).reverse();
    document.querySelector('#triggerList').innerHTML = items.map(x => `<article class="card"><b>${escapeHTML(x.place)}</b><p>${escapeHTML(x.feel)} — ${escapeHTML(x.help)}</p></article>`).join('') || '<p>Nenhum registro.</p>';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    await add('triggers', { userId: user.id, date: Date.now(), place: document.querySelector('#place').value,
      who: document.querySelector('#who').value, feel: document.querySelector('#feel').value,
      thought: document.querySelector('#thought').value, act: document.querySelector('#act').value, help: document.querySelector('#help').value });
    form.reset(); await refresh();
  });
  await refresh();
};

window.page_plano = async user => {
  const existing = (await byUser('plans', user.id))[0] || {};
  getContent().innerHTML = `<form id="planForm" class="card formgrid">
    <label>Principais gatilhos<textarea id="planA"></textarea></label><label>O que farei?<textarea id="planB"></textarea></label>
    <label>Pessoas para chamar<textarea id="planC"></textarea></label><label>Lugares/atividades seguras<textarea id="planD"></textarea></label>
    <label>Meus motivos<textarea id="planE"></textarea></label><button type="submit">Salvar plano</button><p id="planMessage"></p></form>`;
  document.querySelector('#planA').value = existing.a || '';
  document.querySelector('#planB').value = existing.b || '';
  document.querySelector('#planC').value = existing.c || '';
  document.querySelector('#planD').value = existing.d || '';
  document.querySelector('#planE').value = existing.e || '';
  document.querySelector('#planForm').addEventListener('submit', async event => {
    event.preventDefault();
    await put('plans', { ...existing, userId: user.id,
      a: document.querySelector('#planA').value, b: document.querySelector('#planB').value,
      c: document.querySelector('#planC').value, d: document.querySelector('#planD').value,
      e: document.querySelector('#planE').value });
    document.querySelector('#planMessage').textContent = 'Plano salvo.';
  });
};

window.page_apoio = async user => {
  getContent().innerHTML = `<div class="grid grid2"><article class="card"><h2>Vontade forte</h2><ol><li>Respire por 2 minutos.</li><li>Espere 10 minutos.</li><li>Beba água.</li><li>Mude de ambiente.</li><li>Leia seus motivos.</li><li>Procure alguém de confiança.</li></ol><div class="notice"><b>Segurança:</b> em risco imediato, procure ajuda de emergência.</div></article><article class="card"><h2>Mensagem de apoio</h2><textarea id="supportMsg">Oi! Estou precisando conversar um pouco. Você pode ficar comigo por alguns minutos?</textarea><button id="copySupport" type="button">Copiar mensagem</button><p class="muted">Nada é enviado automaticamente.</p></article></div>`;
  document.querySelector('#copySupport').addEventListener('click', async () => {
    const message = document.querySelector('#supportMsg').value;
    try { await navigator.clipboard.writeText(message); } catch { /* clipboard pode não estar disponível em contexto inseguro */ }
  });
};

window.page_conteudos = async user => {
  getContent().innerHTML = `<div class="grid grid2">${['Entendendo gatilhos','Como lidar com a vontade','Sono e estresse','Recusar uma bebida','Quando buscar ajuda profissional','Uso de risco e dependência'].map(title => `<article class="card"><h2>${title}</h2><p>Conteúdo educativo para apoiar prevenção, autocuidado e busca de ajuda.</p></article>`).join('')}</div><div class="notice"><b>Importante:</b> abstinência de álcool pode ser perigosa. Possível dependência exige avaliação profissional antes de interromper abruptamente.</div>`;
};

window.page_progresso = async user => {
  const checkins = await byUser('checkins', user.id);
  const average = checkins.length ? (checkins.reduce((sum, item) => sum + item.craving, 0) / checkins.length).toFixed(1) : '—';
  getContent().innerHTML = `<div class="grid"><article class="card"><h3>Check-ins</h3><strong class="stat">${checkins.length}</strong></article><article class="card"><h3>Vontade média</h3><strong class="stat">${average}</strong></article><article class="card"><h3>Maior vontade</h3><strong class="stat">${checkins.length ? Math.max(...checkins.map(item => item.craving)) : '—'}</strong></article></div><article class="card"><h2>Histórico recente</h2>${checkins.slice().reverse().slice(0, 30).map(item => `<p>${new Date(item.date).toLocaleString('pt-BR')} — ${escapeHTML(item.mood)} — vontade ${item.craving}/10 — ${escapeHTML(item.trigger)}</p>`).join('') || '<p>Nenhum registro.</p>'}</article>`;
};

window.page_configuracoes = async user => {
  getContent().innerHTML = `<div class="grid grid2"><article class="card"><h2>Objetivo</h2><select id="goal"><option value="stop">Parar completamente</option><option value="reduce">Reduzir frequência</option><option value="professional">Preparar-me para buscar ajuda profissional</option></select><button id="saveGoal" type="button">Salvar</button><p id="goalMessage"></p></article><article class="card"><h2>Tema</h2><button id="themeToggle" type="button">Alternar claro/escuro</button></article><article class="card"><h2>Dados</h2><p>Esta versão guarda os dados no IndexedDB deste navegador.</p><button id="exportDataButton" type="button">Exportar JSON</button><button id="deleteDataButton" type="button">Apagar conta e dados</button></article></div>`;
  const goal = document.querySelector('#goal');
  goal.value = user.goal || '';
  document.querySelector('#saveGoal').addEventListener('click', async () => {
    user.goal = goal.value; await put('users', user); document.querySelector('#goalMessage').textContent = 'Objetivo atualizado.';
  });
  document.querySelector('#themeToggle').addEventListener('click', () => {
    localStorage.setItem('eq_theme', document.body.classList.contains('dark') ? 'light' : 'dark');
    location.reload();
  });
  document.querySelector('#exportDataButton').addEventListener('click', exportData);
  document.querySelector('#deleteDataButton').addEventListener('click', deleteData);
};

async function exportData() {
  const user = await me();
  if (!user) return;
  const data = { user, checkins: await byUser('checkins', user.id), triggers: await byUser('triggers', user.id), plans: await byUser('plans', user.id) };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  link.download = 'equilibrio-dados.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function deleteData() {
  if (!window.confirm('Apagar permanentemente sua conta e dados deste navegador?')) return;
  const user = await me();
  if (!user) return;
  for (const store of ['checkins', 'triggers', 'plans', 'support']) {
    for (const item of await byUser(store, user.id)) await del(store, item.id);
  }
  await del('users', user.id);
  logout();
  window.location.href = 'index.html';
}
