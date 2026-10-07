const $ = (selector) => document.querySelector(selector);

const state = {
  user: JSON.parse(localStorage.getItem("equilibrio_user")) || null,
  records: JSON.parse(localStorage.getItem("equilibrio_records")) || [],
  goal: Number(localStorage.getItem("equilibrio_goal")) || 30,
  section: "inicio"
};

function save() {
  localStorage.setItem("equilibrio_user", JSON.stringify(state.user));
  localStorage.setItem("equilibrio_records", JSON.stringify(state.records));
  localStorage.setItem("equilibrio_goal", state.goal);
}

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
}

function showView(id) {
  ["authView", "registerView", "dashboardView"].forEach(x => $("#" + x).classList.add("hidden"));
  $("#" + id).classList.remove("hidden");
}

function enterDashboard() {
  if (!state.user) return showView("authView");
  $("#userName").textContent = state.user.name.split(" ")[0];
  $("#avatar").textContent = state.user.name.charAt(0).toUpperCase();
  showView("dashboardView");
  render();
}

function login(e) {
  e.preventDefault();
  const email = $("#email").value.trim();
  const name = email.split("@")[0].replace(/[._-]+/g, " ") || "Você";
  state.user = { name: name.replace(/\b\w/g, c => c.toUpperCase()), email };
  save();
  enterDashboard();
  toast("Bem-vindo de volta!");
}

function register(e) {
  e.preventDefault();
  state.user = {
    name: $("#name").value.trim(),
    email: $("#registerEmail").value.trim()
  };
  save();
  enterDashboard();
  toast("Conta criada com sucesso!");
}

function getStats() {
  const today = new Date().toISOString().slice(0,10);
  const todayRecord = state.records.find(r => r.date === today);
  const soberDays = state.records.filter(r => r.drinks === 0).length;
  const totalDays = Math.max(state.records.length, 1);
  const progress = Math.min(100, Math.round((soberDays / state.goal) * 100));
  return { todayRecord, soberDays, totalDays, progress };
}

function renderHome() {
  const { todayRecord, soberDays, progress } = getStats();
  return `
    <div class="hero">
      <span class="eyebrow">SEU PROGRESSO</span>
      <h3>Pequenas escolhas constroem grandes mudanças.</h3>
      <p>Você não precisa fazer tudo de uma vez. Registre seu dia, acompanhe seu ritmo e continue avançando.</p>
    </div>

    <div class="grid stats-grid">
      <div class="card"><span class="stat-label">Dias registrados</span><strong class="stat-value">${state.records.length}</strong></div>
      <div class="card"><span class="stat-label">Dias sem beber</span><strong class="stat-value green">${soberDays}</strong></div>
      <div class="card"><span class="stat-label">Meta atual</span><strong class="stat-value">${state.goal} dias</strong></div>
      <div class="card"><span class="stat-label">Progresso</span><strong class="stat-value green">${progress}%</strong></div>
    </div>

    <div class="grid two-col">
      <div class="card">
        <h3>Como está seu dia?</h3>
        ${todayRecord ? `
          <div class="list-item"><span>Humor registrado</span><strong>${todayRecord.mood}</strong></div>
          <div class="list-item"><span>Quantidade registrada</span><strong>${todayRecord.drinks} ${todayRecord.drinks == 1 ? "dose" : "doses"}</strong></div>
          <div class="action-row" style="margin-top:14px"><button class="secondary-btn" data-go="registro">Atualizar registro</button></div>
        ` : `
          <p style="color:var(--muted);line-height:1.6">Ainda não registramos o seu dia. Reserve um minuto para anotar como você está.</p>
          <button class="primary-btn" data-go="registro">Registrar meu dia</button>
        `}
      </div>
      <div class="card">
        <h3>Minha meta</h3>
        <div class="progress-row"><span>${soberDays} dias concluídos</span><strong>${state.goal} dias</strong></div>
        <div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div>
        <p style="color:var(--muted);font-size:13px;line-height:1.5;margin-top:14px">Seu objetivo é pessoal. O importante é acompanhar sua evolução.</p>
      </div>
    </div>
  `;
}

function renderRecord() {
  const today = new Date().toISOString().slice(0,10);
  const existing = state.records.find(r => r.date === today);
  const drinks = existing?.drinks ?? 0;
  const mood = existing?.mood ?? "Bem";

  return `
    <div class="card record-form">
      <span class="eyebrow">REGISTRO DIÁRIO</span>
      <h3>Como foi seu dia?</h3>
      <p style="color:var(--muted);line-height:1.5">Registrar sem julgamento ajuda você a enxergar padrões ao longo do tempo.</p>

      <label>Como você está se sentindo?</label>
      <div class="mood-grid">
        ${["Ótimo","Bem","Normal","Difícil","Muito difícil"].map((m,i) => `
          <button class="mood ${mood === m ? "selected" : ""}" data-mood="${m}">
            <span>${["😄","🙂","😐","😟","😞"][i]}</span><small>${m}</small>
          </button>`).join("")}
      </div>

      <label for="drinkRange">Quantas doses você consumiu hoje?</label>
      <div class="range-row">
        <input id="drinkRange" type="range" min="0" max="20" value="${drinks}">
        <strong id="drinkCount">${drinks}</strong>
      </div>

      <button id="saveRecord" class="primary-btn">Salvar registro</button>
    </div>
  `;
}

function renderProgress() {
  const { soberDays, progress } = getStats();
  const ordered = [...state.records].sort((a,b) => b.date.localeCompare(a.date));
  return `
    <div class="grid two-col">
      <div class="card">
        <span class="eyebrow">VISÃO GERAL</span>
        <h3>Seu progresso</h3>
        <div style="font-size:46px;font-weight:900;color:var(--green-dark);letter-spacing:-.05em">${progress}%</div>
        <div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div>
        <p style="color:var(--muted);font-size:13px;line-height:1.5">Você acumulou <strong>${soberDays}</strong> dia(s) sem beber na sua jornada registrada.</p>
      </div>
      <div class="card">
        <h3>Resumo</h3>
        <div class="list">
          <div class="list-item"><span>Registros</span><strong>${state.records.length}</strong></div>
          <div class="list-item"><span>Meta</span><strong>${state.goal} dias</strong></div>
          <div class="list-item"><span>Dias sem beber</span><strong>${soberDays}</strong></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3>Histórico recente</h3>
      ${ordered.length ? `<div class="list">${ordered.slice(0,10).map(r => `<div class="list-item"><span>${new Date(r.date+"T12:00:00").toLocaleDateString("pt-BR")} · ${r.mood}</span><strong>${r.drinks} doses</strong></div>`).join("")}</div>` : `<div class="empty">Seus registros aparecerão aqui.</div>`}
    </div>
  `;
}

function renderGoals() {
  const { soberDays } = getStats();
  const progress = Math.min(100, Math.round((soberDays / state.goal) * 100));
  return `
    <div class="card">
      <span class="eyebrow">OBJETIVO PESSOAL</span>
      <h3>Minha meta</h3>
      <p style="color:var(--muted);line-height:1.5">Defina quantos dias sem beber você gostaria de alcançar nesta etapa.</p>
      <label for="goalInput">Meta em dias</label>
      <input id="goalInput" type="number" min="1" max="365" value="${state.goal}">
      <button id="saveGoal" class="primary-btn">Atualizar meta</button>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="goal-head"><span>Progresso da meta</span><strong>${soberDays}/${state.goal}</strong></div>
      <div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div>
    </div>
  `;
}

function render() {
  const titles = { inicio:"Olá, "+state.user.name.split(" ")[0]+" 👋", registro:"Registro diário", progresso:"Meu progresso", metas:"Minhas metas" };
  $("#pageTitle").textContent = titles[state.section];
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.section === state.section));

  const views = { inicio:renderHome, registro:renderRecord, progresso:renderProgress, metas:renderGoals };
  $("#content").innerHTML = views[state.section]();
  bindContent();
}

function bindContent() {
  document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { state.section=b.dataset.go; render(); });
  document.querySelectorAll("[data-mood]").forEach(b => b.onclick = () => {
    document.querySelectorAll("[data-mood]").forEach(x=>x.classList.remove("selected"));
    b.classList.add("selected");
  });

  const range = $("#drinkRange");
  if (range) range.oninput = () => $("#drinkCount").textContent = range.value;

  const saveRecord = $("#saveRecord");
  if (saveRecord) saveRecord.onclick = () => {
    const today = new Date().toISOString().slice(0,10);
    const mood = document.querySelector(".mood.selected")?.dataset.mood || "Bem";
    const drinks = Number(range.value);
    const existing = state.records.find(r => r.date === today);
    if (existing) { existing.mood=mood; existing.drinks=drinks; }
    else state.records.push({date:today,mood,drinks});
    save(); toast("Registro salvo!"); state.section="inicio"; render();
  };

  const saveGoal = $("#saveGoal");
  if (saveGoal) saveGoal.onclick = () => {
    const value = Math.max(1, Math.min(365, Number($("#goalInput").value) || 30));
    state.goal=value; save(); toast("Meta atualizada!"); render();
  };
}

$("#loginForm").addEventListener("submit", login);
$("#registerForm").addEventListener("submit", register);
$("#showRegister").onclick = () => showView("registerView");
$("#showLogin").onclick = () => showView("authView");
$("#logoutBtn").onclick = () => { state.user=null; localStorage.removeItem("equilibrio_user"); showView("authView"); toast("Até logo!"); };
$("#togglePassword").onclick = () => {
  const input=$("#password");
  input.type=input.type==="password" ? "text" : "password";
};
$("#mobileMenu").onclick = () => $(".sidebar").classList.toggle("open");
document.querySelectorAll(".nav-item").forEach(b => b.onclick = () => {
  state.section=b.dataset.section;
  $(".sidebar").classList.remove("open");
  render();
});

if (state.user) enterDashboard(); else showView("authView");
