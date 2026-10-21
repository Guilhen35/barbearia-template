// ══════════════════════════════════════════════
//  BARBEARIA — script.js (TEMPLATE DEMONSTRATIVO)
//  ⚠️ Configure os dados antes de usar em produção
// ══════════════════════════════════════════════

// ── DADOS DOS BARBEIROS ──
// ⚠️ Substitua pelos dados reais da barbearia
const barbeiros = [
  {
    id: 1,
    nome: "João Marcelo (Zynho)",
    especialidade: "Especialista em Cortes Modernos, Sociais<br>Cortes Desenhados e Degradê<br>Química, Platinado e Luzes",
    foto: "assets/barbeiro1.jpg",
    telefone: "",   // ⚠️ Configurar: ex: ""
    pix: "",        // ⚠️ Configurar: chave Pix
    pixNome: ""     // ⚠️ Configurar: nome do titular
  },
  {
    id: 2,
    nome: "Gustavo (Tavin)",
    especialidade: "Especialista em Cortes Modernos, Sociais<br>Cortes Desenhados e Degradê",
    foto: "assets/barbeiro2.jpg",
    telefone: "",   // ⚠️ Configurar
    pix: "",        // ⚠️ Configurar
    pixNome: ""     // ⚠️ Configurar
  },
  {
    id: 3,
    nome: "Matheus Felipe",
    especialidade: "Especialista em Cortes Modernos, Sociais<br>Cortes Desenhados e Degradê",
    foto: "assets/barbeiro3.jpg",
    telefone: "",   // ⚠️ Configurar
    pix: "",        // ⚠️ Configurar
    pixNome: ""     // ⚠️ Configurar
  }
];

// ── SERVIÇOS ──
const servicosPadrao = [
  { nome: "Corte masculino padrão", categoria: "cortes", descricao: "Degradê, social e estilos modernos", preco: 55, tempo: 45 },
  { nome: "Corte americano", categoria: "cortes", descricao: "Estilo americano moderno", preco: 50, tempo: 45 },
  { nome: "Corte navalhado", categoria: "cortes", descricao: "Finalização navalhada", preco: 60, tempo: 50 },
  { nome: "Corte infantil", categoria: "cortes", descricao: "Corte masculino infantil", preco: 60, tempo: 45 },
  { nome: "Corte temático", categoria: "cortes", descricao: "Cortes personalizados e desenhos", preco: 70, tempo: 60 },
  { nome: "Barba padrão", categoria: "barba", descricao: "Acabamento e alinhamento", preco: 45, tempo: 30 },
  { nome: "Barba italiana", categoria: "barba", descricao: "Barba estilizada premium", preco: 50, tempo: 40 },
  { nome: "Luzes + corte incluso", categoria: "quimica", descricao: "Reflexo/luzes", preco: 180, tempo: 150 },
  { nome: "Platinado (nevou)", categoria: "quimica", descricao: "Platinado completo", preco: 250, tempo: 180 },
  { nome: "Selagem masculina", categoria: "quimica", descricao: "Tratamento capilar", preco: 70, tempo: 60 },
  { nome: "Selagem + corte", categoria: "quimica", descricao: "Selagem com corte", preco: 130, tempo: 90 },
  { nome: "Pezinho", categoria: "extras", descricao: "Acabamento rápido", preco: 20, tempo: 15 },
  { nome: "Sobrancelha", categoria: "extras", descricao: "Modelagem navalha", preco: 20, tempo: 15 },
  { nome: "Corte + barba", categoria: "combos", descricao: "Combo completo", preco: 85, tempo: 75 },
  { nome: "Corte + barba + sobrancelha", categoria: "combos", descricao: "Pacote premium", preco: 90, tempo: 90 }
];

function getServicos() { return servicosPadrao; }
function getAgendamentos() { return []; }
function getBloqueios() { return []; }
function getHorariosEspeciais() { return []; }

// ── EXPEDIENTE PADRÃO ──
// ⚠️ Configure os horários de cada barbeiro
function getExpedientePadrao(barbeiroId, diaDaSemana) {
  if (diaDaSemana === 0) return null; // Domingo fechado
  if (diaDaSemana === 6) return { inicio: 8 * 60, fim: 20 * 60 }; // Sábado
  if (barbeiroId === 1) return { inicio: 14 * 60, fim: 20 * 60 };
  if (barbeiroId === 2) return { inicio: 13 * 60, fim: 20 * 60 };
  if (barbeiroId === 3) return { inicio: 9 * 60, fim: 20 * 60 };
  return { inicio: 8 * 60, fim: 20 * 60 };
}

function horaParaMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}
function minutosParaHora(minutos) {
  if (minutos >= 24 * 60) minutos = minutos % (24 * 60);
  return `${String(Math.floor(minutos / 60)).padStart(2,"0")}:${String(minutos % 60).padStart(2,"0")}`;
}

function getFaixasDoDia(barbeiroId, dataISO, diaDaSemana) {
  const padrao = getExpedientePadrao(barbeiroId, diaDaSemana);
  return padrao ? [{ inicio: padrao.inicio, fim: padrao.fim }] : [];
}

function verificarDisponibilidade(barbeiroId, dataISO, diaDaSemana, horarioStr, tempoServico) {
  const horarioMin = horaParaMinutos(horarioStr);
  const fimServico = horarioMin + tempoServico;
  const faixas = getFaixasDoDia(barbeiroId, dataISO, diaDaSemana);
  if (!faixas.length) return { ok: false, motivo: "Fechado neste dia." };
  if (!faixas.some(f => horarioMin >= f.inicio && fimServico <= f.fim)) {
    const exp = faixas.map(f => `${minutosParaHora(f.inicio)} às ${minutosParaHora(f.fim)}`).join(" e ");
    return { ok: false, motivo: `Fora do expediente. Horário: ${exp}.` };
  }
  return { ok: true };
}

// ── ESTADO DO APP ──
let barbeiroSelecionado = null, servicoSelecionado = null, dataSelecionada = null;
let horarioSelecionado = null, mesSelecionadoOffset = 0, opcaoPagamento = null;

const cardsContainer = document.querySelector(".cards");
const barbeirosContainer = document.querySelector(".barbeiros-container");
const calendario = document.querySelector("#calendario");
const horariosContainer = document.querySelector(".horarios");
const confirmacao = document.querySelector("#confirmacao");
const resumoBarbeiro = document.querySelector("#resumoBarbeiro");
const resumoServico = document.querySelector("#resumoServico");
const resumoHorario = document.querySelector("#resumoHorario");
const resumoValor = document.querySelector("#resumoValor");
const secaoServicos = document.querySelector("#servicos");
const secaoAgenda = document.querySelector("#agenda");
const secaoBarbeiros = document.querySelector("#barbeiros");

function esconderFluxoInicial() { secaoServicos.style.display = "none"; secaoAgenda.classList.remove("mostrar"); secaoBarbeiros.style.display = "block"; }
function mostrarServicos() { secaoServicos.style.display = "block"; }
function esconderAgendamento() {
  secaoBarbeiros.style.display = "none"; secaoServicos.style.display = "none";
  secaoAgenda.classList.remove("mostrar"); confirmacao.classList.remove("mostrar");
  const secPag = document.querySelector("#secaoPagamento"); if (secPag) secPag.classList.remove("mostrar");
}
function mostrarAgendamento() { secaoBarbeiros.style.display = "block"; if (barbeiroSelecionado) secaoServicos.style.display = "block"; }

function renderizarBarbeiros() {
  barbeirosContainer.innerHTML = "";
  barbeiros.forEach(b => {
    barbeirosContainer.innerHTML += `<div class="barbeiro-card" onclick="selecionarBarbeiro(event, ${b.id})"><img src="${b.foto}" alt="${b.nome}"><div class="barbeiro-info"><h3>${b.nome}</h3><p>${b.especialidade}</p></div></div>`;
  });
}

function selecionarBarbeiro(event, id) {
  barbeiroSelecionado = barbeiros.find(b => b.id === id);
  servicoSelecionado = null; dataSelecionada = null; horarioSelecionado = null;
  calendario.innerHTML = ""; horariosContainer.innerHTML = "";
  secaoAgenda.classList.remove("mostrar");
  document.querySelectorAll(".barbeiro-card").forEach(c => c.classList.remove("barbeiro-selecionado"));
  event.currentTarget.classList.add("barbeiro-selecionado");
  mostrarServicos();
  document.querySelector("#servicos").scrollIntoView({ behavior: "smooth" });
}

function renderizarServicos(lista) {
  cardsContainer.innerHTML = "";
  lista.forEach(s => {
    cardsContainer.innerHTML += `<div class="servico-card"><div class="servico-card-content"><h3>${s.nome}</h3><p>${s.descricao}</p><div class="info"><span>⏱ ${s.tempo} min</span><strong>R$ ${s.preco}</strong></div><button onclick="selecionarServico(event, '${s.nome}')">Escolher</button></div></div>`;
  });
}

function filtrarServicos(categoria) {
  const servicos = getServicos();
  renderizarServicos(categoria === "todos" ? servicos : servicos.filter(s => s.categoria === categoria));
}

function selecionarServico(event, nome) {
  servicoSelecionado = getServicos().find(s => s.nome === nome);
  dataSelecionada = null; horarioSelecionado = null; horariosContainer.innerHTML = "";
  document.querySelectorAll(".servico-card").forEach(c => c.classList.remove("servico-selecionado"));
  event.currentTarget.closest(".servico-card").classList.add("servico-selecionado");
  secaoAgenda.classList.add("mostrar");
  gerarCalendario();
  document.querySelector("#agenda").scrollIntoView({ behavior: "smooth" });
}

function gerarCalendario() {
  calendario.innerHTML = ""; horariosContainer.innerHTML = "";
  const hoje = new Date(), ano = hoje.getFullYear(), mesAtual = hoje.getMonth(), diaHoje = hoje.getDate();
  const mesCalendario = mesAtual + mesSelecionadoOffset;
  const primeiroDia = new Date(ano, mesCalendario, 1), ultimoDia = new Date(ano, mesCalendario + 1, 0);
  const nomeMes = primeiroDia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  calendario.innerHTML += `<div class="controle-mes"><button onclick="trocarMes(0)">Mês atual</button><strong>${nomeMes}</strong><button onclick="trocarMes(1)">Próximo mês</button></div>`;
  ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].forEach(d => { calendario.innerHTML += `<div class="dia-semana">${d}</div>`; });
  for (let i = 0; i < primeiroDia.getDay(); i++) calendario.innerHTML += `<div></div>`;
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const data = new Date(ano, mesCalendario, dia), diaDaSemana = data.getDay();
    const domingo = diaDaSemana === 0, diaPassado = mesSelecionadoOffset === 0 && dia < diaHoje;
    const bloqueado = domingo || diaPassado;
    const hojeClasse = mesSelecionadoOffset === 0 && dia === diaHoje ? "dia-hoje" : "";
    calendario.innerHTML += `<div class="dia ${bloqueado ? "dia-fechado" : ""} ${hojeClasse}" onclick="${bloqueado ? "" : `selecionarDia(event, ${dia})`}">${dia}</div>`;
  }
}

function trocarMes(offset) { mesSelecionadoOffset = offset; dataSelecionada = null; horarioSelecionado = null; gerarCalendario(); }

function selecionarDia(event, dia) {
  dataSelecionada = dia; horarioSelecionado = null;
  document.querySelectorAll(".dia").forEach(d => d.classList.remove("dia-selecionado"));
  event.currentTarget.classList.add("dia-selecionado");
  mostrarGradeHorarios();
}

function mostrarGradeHorarios() {
  horariosContainer.innerHTML = "";
  if (!servicoSelecionado || !dataSelecionada || !barbeiroSelecionado) return;
  const hoje = new Date(), ano = hoje.getFullYear(), mes = hoje.getMonth() + mesSelecionadoOffset;
  const data = new Date(ano, mes, dataSelecionada), diaDaSemana = data.getDay();
  const dataISO = `${ano}-${String(mes + 1).padStart(2,"0")}-${String(dataSelecionada).padStart(2,"0")}`;
  const faixas = getFaixasDoDia(barbeiroSelecionado.id, dataISO, diaDaSemana);
  const expediente = faixas.length > 0 ? faixas.map(f => `${minutosParaHora(f.inicio)} às ${minutosParaHora(f.fim)}`).join(" e ") : "Fechado";
  let gradeHTML = "";
  faixas.forEach(faixa => {
    for (let h = faixa.inicio; h < faixa.fim; h += 60) {
      const horarioStr = minutosParaHora(h);
      gradeHTML += `<div class="horario-ref horario-ref-livre" onclick="preencherHorario('${horarioStr}')">⏰ ${horarioStr}</div>`;
    }
  });
  horariosContainer.innerHTML = `
    <div class="horario-livre-container">
      <p class="expediente-info">⏰ Expediente: <strong>${expediente}</strong></p>
      <p class="expediente-info" style="font-size:12px;margin-top:-8px;">Clique num horário disponível</p>
      <div class="grade-referencia">${gradeHTML}</div>
      <p class="expediente-info" style="font-size:13px;margin-top:8px;margin-bottom:4px;">— ou digite o horário que preferir —</p>
      <div class="horario-input-wrap">
        <input type="time" id="inputHorarioLivre" class="horario-livre-input" oninput="validarHorarioLivre()" placeholder="00:00">
        <div id="horarioFeedback" class="horario-feedback"></div>
      </div>
      <button id="btnConfirmarHorario" class="btn-confirmar-horario" onclick="confirmarHorarioLivre()" disabled>Confirmar horário</button>
    </div>`;
}

function preencherHorario(horario) {
  const input = document.getElementById("inputHorarioLivre");
  if (!input) return;
  input.value = horario;
  validarHorarioLivre();
}

function validarHorarioLivre() {
  const input = document.getElementById("inputHorarioLivre"),
        feedback = document.getElementById("horarioFeedback"),
        btn = document.getElementById("btnConfirmarHorario");
  const horario = input.value;
  if (!horario) { feedback.innerHTML = ""; btn.disabled = true; return; }
  const hoje = new Date(), ano = hoje.getFullYear(), mes = hoje.getMonth() + mesSelecionadoOffset;
  const data = new Date(ano, mes, dataSelecionada), diaDaSemana = data.getDay();
  const dataISO = `${ano}-${String(mes + 1).padStart(2,"0")}-${String(dataSelecionada).padStart(2,"0")}`;
  const resultado = verificarDisponibilidade(barbeiroSelecionado.id, dataISO, diaDaSemana, horario, servicoSelecionado.tempo);
  if (resultado.ok) {
    feedback.innerHTML = `<span class="feedback-ok">✅ Horário disponível!</span>`;
    btn.disabled = false;
    horarioSelecionado = horario;
  } else {
    feedback.innerHTML = `<span class="feedback-erro">❌ ${resultado.motivo}</span>`;
    btn.disabled = true;
    horarioSelecionado = null;
  }
}

function confirmarHorarioLivre() {
  if (!horarioSelecionado) return;
  atualizarResumo();
  // No template, ao invés de pagamento, já mostra o modal demo
  mostrarTelaDemo();
}

function selecionarPagamento(opcao) {
  // No template, ao clicar em qualquer opção de pagamento, mostra o modal demo
  mostrarTelaDemo();
}

function atualizarResumo() {
  const hoje = new Date(), dataAg = new Date(hoje.getFullYear(), hoje.getMonth() + mesSelecionadoOffset, dataSelecionada);
  resumoBarbeiro.textContent = barbeiroSelecionado.nome;
  resumoServico.textContent = servicoSelecionado.nome;
  resumoHorario.textContent = `${String(dataAg.getDate()).padStart(2,"0")}/${String(dataAg.getMonth()+1).padStart(2,"0")} às ${horarioSelecionado}`;
  resumoValor.textContent = `R$ ${servicoSelecionado.preco}`;
}

// ── CONFIRMAR — no template exibe modal demonstrativo ──
function confirmarAgendamento() {
  mostrarTelaDemo();
}

// ── MODAL DEMONSTRATIVO ──
function mostrarTelaDemo() {
  document.getElementById("telademo").style.display = "flex";
  document.body.style.overflow = "hidden";
}
function fecharTelaDemo() {
  document.getElementById("telademo").style.display = "none";
  document.body.style.overflow = "";
}

function mostrarTelaErro(motivo) {
  document.getElementById("mensagemErro").textContent = motivo || "Ocorreu um erro inesperado.";
  document.getElementById("telaerro").style.display = "flex";
  document.body.style.overflow = "hidden";
}
function fecharTelaErro() {
  document.getElementById("telaerro").style.display = "none";
  document.body.style.overflow = "";
}

// ── MENU E NAVEGAÇÃO ──
function alternarGaleria() { const el = document.querySelector("#galeriaConteudo"), btn = document.querySelector("#botaoGaleria"); el.classList.toggle("mostrar"); btn.textContent = el.classList.contains("mostrar") ? "Esconder nosso trabalho" : "Ver nosso trabalho"; }
function alternarHistoria() { const el = document.querySelector("#historiaConteudo"), btn = document.querySelector("#botaoHistoria"); el.classList.toggle("mostrar"); btn.textContent = el.classList.contains("mostrar") ? "Esconder história" : "Conhecer nossa história"; }
function alternarMenu() { document.querySelector("#menuLinks").classList.toggle("mostrar"); }
document.querySelectorAll(".menu-links a").forEach(link => { link.addEventListener("click", () => document.querySelector("#menuLinks").classList.remove("mostrar")); });
window.addEventListener("scroll", () => { document.querySelector(".menu-premium").classList.toggle("menu-scroll", window.scrollY > 40); });
function abrirSecaoMenu(idSecao) { ["#galeria","#historia","#avaliacoes","#localizacao"].forEach(id => { document.querySelector(id).classList.toggle("mostrar", id === idSecao); }); esconderAgendamento(); document.querySelector(idSecao).scrollIntoView({ behavior: "smooth" }); document.querySelector("#menuLinks").classList.remove("mostrar"); }
function irParaAgendamento() { ["#galeria","#historia","#avaliacoes","#localizacao"].forEach(id => document.querySelector(id).classList.remove("mostrar")); mostrarAgendamento(); document.querySelector("#barbeiros").scrollIntoView({ behavior: "smooth" }); document.querySelector("#menuLinks").classList.remove("mostrar"); }
function voltarParaInicio() { ["#galeria","#historia","#avaliacoes","#localizacao"].forEach(id => document.querySelector(id).classList.remove("mostrar")); mostrarAgendamento(); document.querySelector("#inicio").scrollIntoView({ behavior: "smooth" }); document.querySelector("#menuLinks").classList.remove("mostrar"); }

// ── INIT ──
renderizarBarbeiros();
esconderFluxoInicial();
renderizarServicos(getServicos());