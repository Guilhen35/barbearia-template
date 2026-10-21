'use strict';
/*
 * Banco de dados de DEMONSTRAÇÃO.
 * Intercepta as chamadas no formato da API do Supabase (/rest/v1/...)
 * e responde com dados fictícios guardados no localStorage do visitante.
 * Nenhum dado sai do navegador.
 */
(function () {
  const CHAVE = 'srp_demo_db_v1';
  const pad = (n) => String(n).padStart(2, '0');

  // Hash SHA-256 de "demo": a senha da demonstração (o app compara hashes)
  const HASH_SENHA_DEMO = '2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea';

  const BARBEIROS = [
    { id: 1, nome: 'João Marcelo (Zynho)', apelido: 'Zynho' },
    { id: 2, nome: 'Gustavo (Tavin)', apelido: 'Tavin' },
    { id: 3, nome: 'Matheus Felipe', apelido: 'Matheus' }
  ];

  const SERVICOS = [
    ['Corte masculino padrão', 'cortes', 'Degradê, social e estilos modernos', 55, 45],
    ['Corte americano', 'cortes', 'Estilo americano moderno', 50, 45],
    ['Corte navalhado', 'cortes', 'Finalização navalhada', 60, 50],
    ['Barba padrão', 'barba', 'Acabamento e alinhamento', 45, 30],
    ['Barba italiana', 'barba', 'Barba estilizada premium', 50, 40],
    ['Corte + barba', 'combos', 'Combo completo', 85, 75],
    ['Corte + barba + sobrancelha', 'combos', 'Pacote premium', 90, 90],
    ['Luzes + corte incluso', 'quimica', 'Reflexo/luzes', 180, 150],
    ['Selagem masculina', 'quimica', 'Tratamento capilar', 70, 60],
    ['Pezinho', 'extras', 'Acabamento rápido', 20, 15],
    ['Sobrancelha', 'extras', 'Modelagem navalha', 20, 15]
  ].map(([nome, categoria, descricao, preco, tempo]) => ({ nome, categoria, descricao, preco, tempo }));

  // Nomes e telefones fictícios (telefones com DDD 00, que não existe)
  const CLIENTES = ['Carlos M.', 'André S.', 'Felipe R.', 'Gabriel T.', 'Vinícius P.', 'Leonardo A.', 'Thiago B.', 'Mateus C.', 'Henrique D.', 'Eduardo F.'];

  function criarDadosIniciais() {
    const hoje = new Date();
    const agendamentos = [];
    const horarios = ['09:00', '10:00', '11:00', '14:00', '15:30', '17:00'];
    let id = 1000;

    for (let d = -3; d <= 7; d++) {
      const dia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + d);
      if (dia.getDay() === 0) continue; // domingo fechado
      BARBEIROS.forEach((b, bi) => {
        horarios.forEach((h, hi) => {
          if ((d + bi + hi) % 3 === 0) return; // deixa horários livres
          const s = SERVICOS[(d + bi * 2 + hi + 20) % SERVICOS.length];
          agendamentos.push({
            id: id++,
            status: d < 0 ? 'confirmado' : ((hi + bi) % 4 === 0 ? 'pendente' : 'confirmado'),
            barbeiro_id: b.id,
            barbeiro: b.nome,
            telefone_barbeiro: '',
            servico: s.nome,
            tempo_servico: s.tempo,
            tempo_real: s.tempo,
            data: dia.getDate(),
            mes_offset: 0,
            data_completa: `${pad(dia.getDate())}/${pad(dia.getMonth() + 1)}/${dia.getFullYear()}`,
            criado_em: new Date(dia.getTime() - 86400000).toISOString(),
            horario: h,
            cliente: CLIENTES[(id + hi) % CLIENTES.length],
            telefone: '(00) 90000-0000',
            observacoes: '',
            valor: s.preco,
            pagamento: hi % 2 ? 'pix' : 'hora'
          });
        });
      });
    }

    const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
    const dataISO = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;

    return {
      agendamentos,
      servicos: SERVICOS,
      barbeiros: BARBEIROS.map((b) => ({ ...b, pix_chave: '', pix_nome: '', whatsapp: '', ativo: true })),
      bloqueios: [{ id: 1, barbeiro_id: 3, data: dataISO(amanha), tipo: 'periodo', motivo: 'Curso de capacitação', hora_inicio: '13:00', hora_fim: '18:00' }],
      horarios_especiais: [],
      usuarios: [
        { id: 1, tipo: 'admin', usuario: 'dono', senha_hash: HASH_SENHA_DEMO },
        { id: 2, tipo: 'barbeiro_2', usuario: 'tavin', senha_hash: HASH_SENHA_DEMO },
        { id: 3, tipo: 'barbeiro_3', usuario: 'matheus', senha_hash: HASH_SENHA_DEMO }
      ]
    };
  }

  function ler() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (salvo && salvo.agendamentos) return salvo;
    } catch (e) { /* storage indisponível: usa dados em memória */ }
    const novo = criarDadosIniciais();
    gravar(novo);
    return novo;
  }

  let memoria = null;
  function gravar(db) {
    memoria = db;
    try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch (e) { /* segue em memória */ }
  }
  function banco() { return memoria || (memoria = ler()); }

  // ---- Interpretação simples dos filtros da API do Supabase (PostgREST) ----
  function filtros(params) {
    const lista = [];
    params.forEach((valor, campo) => {
      if (['select', 'order', 'limit', 'offset'].includes(campo)) return;
      const m = /^(eq|neq|gt|gte|lt|lte)\.(.*)$/.exec(valor);
      if (m) lista.push({ campo, op: m[1], valor: decodeURIComponent(m[2]) });
    });
    return lista;
  }

  function combina(linha, f) {
    const a = linha[f.campo];
    const b = f.valor;
    const num = (x) => (x !== null && x !== '' && !isNaN(x) ? Number(x) : x);
    switch (f.op) {
      case 'eq': return String(a) === b;
      case 'neq': return String(a) !== b;
      case 'gt': return num(a) > num(b);
      case 'gte': return num(a) >= num(b);
      case 'lt': return num(a) < num(b);
      case 'lte': return num(a) <= num(b);
      default: return true;
    }
  }

  function ordenar(linhas, order) {
    if (!order) return linhas;
    const regras = order.split(',').map((r) => r.split('.'));
    return [...linhas].sort((x, y) => {
      for (const [campo, dir] of regras) {
        if (x[campo] === y[campo]) continue;
        const r = x[campo] > y[campo] ? 1 : -1;
        return dir === 'desc' ? -r : r;
      }
      return 0;
    });
  }

  function resposta(dados, status = 200) {
    return new Response(status === 204 ? null : JSON.stringify(dados), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  function tratar(url, init) {
    const u = new URL(url, location.href);
    const tabela = u.pathname.split('/rest/v1/')[1];
    const metodo = ((init && init.method) || 'GET').toUpperCase();
    const db = banco();
    if (!db[tabela]) db[tabela] = [];
    const fs = filtros(u.searchParams);
    const bate = (l) => fs.every((f) => combina(l, f));

    if (metodo === 'GET') {
      return resposta(ordenar(db[tabela].filter(bate), u.searchParams.get('order')));
    }

    let corpo = {};
    try { corpo = init && init.body ? JSON.parse(init.body) : {}; } catch (e) { return resposta({ message: 'JSON inválido' }, 400); }

    if (metodo === 'POST') {
      const novos = (Array.isArray(corpo) ? corpo : [corpo]).map((r) => ({ id: r.id || Date.now() + Math.floor(Math.random() * 1000), ...r }));
      db[tabela].push(...novos);
      gravar(db);
      return resposta(novos, 201);
    }
    if (metodo === 'PATCH') {
      const alterados = [];
      db[tabela] = db[tabela].map((l) => (bate(l) ? (alterados.push({ ...l, ...corpo }), { ...l, ...corpo }) : l));
      gravar(db);
      return resposta(alterados);
    }
    if (metodo === 'DELETE') {
      if (!fs.length) return resposta({ message: 'Filtro obrigatório para apagar' }, 400);
      db[tabela] = db[tabela].filter((l) => !bate(l));
      gravar(db);
      return resposta(null, 204);
    }
    return resposta({ message: 'Método não suportado' }, 405);
  }

  const fetchOriginal = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('/rest/v1/')) {
      // Pequeno atraso para parecer uma chamada de rede real
      return new Promise((ok) => setTimeout(() => ok(tratar(url, init)), 120));
    }
    return fetchOriginal(input, init);
  };

  window.DemoDB = {
    restaurar() {
      try {
        localStorage.removeItem(CHAVE);
        Object.keys(localStorage).filter((k) => /^(srp_|srpedro_|admin_senha|senha_barbeiro_|pix_barbeiro_)/.test(k)).forEach((k) => localStorage.removeItem(k));
      } catch (e) { /* ignora */ }
      memoria = null;
      location.reload();
    }
  };

  // Faixa "modo demonstração" nos painéis
  function mostrarFaixa() {
    if (!document.body || !document.body.dataset.demoPainel) return;
    const faixa = document.createElement('div');
    faixa.className = 'demo-faixa';
    faixa.setAttribute('role', 'status');
    const texto = document.createElement('span');
    texto.textContent = 'Modo demonstração · dados fictícios, salvos só no seu navegador · senha: demo';
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = 'Restaurar dados';
    botao.addEventListener('click', () => window.DemoDB.restaurar());
    faixa.append(texto, botao);
    document.body.prepend(faixa);
  }
  document.addEventListener('DOMContentLoaded', mostrarFaixa);
})();
