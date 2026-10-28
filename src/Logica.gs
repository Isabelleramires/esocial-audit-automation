/** Original, intentionally simplified data-processing rules for the public demo. */
function demoNormalizar_(valor) {
  return String(valor == null ? '' : valor)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim().toUpperCase().replace(/\s+/g, ' ');
}

// Routing illustrates event processing; it is not an eSocial rules engine.
function demoClassificarEventos_(tipoExame, cargo) {
  var tipo = demoNormalizar_(tipoExame);
  var funcao = demoNormalizar_(cargo);
  var permitidos = ['ADMISSIONAL', 'PERIODICO', 'DEMISSIONAL', 'RETORNO AO TRABALHO', 'MUDANCA DE FUNCAO'];
  if (permitidos.indexOf(tipo) === -1) {
    throw new Error('Tipo de exame não demonstrado: ' + tipoExame);
  }
  var eventos = tipo === 'ADMISSIONAL' ? ['S-2220', 'S-2240'] : ['S-2220'];
  if (funcao.indexOf('MOTORISTA') !== -1 && funcao.indexOf('AUXILIAR') === -1) {
    eventos.push('S-2221');
  }
  return eventos;
}

// S-2221 is its own worksheet even when the same fictitious ASO has other events.
function demoAbaPorEvento_(evento, eventos) {
  if (evento === 'S-2221') return DEMO_CONFIG.audit2221;
  if (eventos.indexOf('S-2240') !== -1) return DEMO_CONFIG.auditCombined;
  return DEMO_CONFIG.audit2220;
}

function demoData_(entrada) {
  var data;
  if (entrada instanceof Date) data = new Date(entrada.getTime());
  else if (typeof entrada === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entrada)) {
    var p = entrada.split('-').map(Number);
    data = new Date(p[0], p[1] - 1, p[2]);
  } else data = new Date(entrada);
  if (isNaN(data.getTime())) throw new Error('Data inválida no arquivo demonstrativo.');
  data.setHours(0, 0, 0, 0);
  return data;
}

function demoDataISO_(entrada) {
  var d = demoData_(entrada);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function demoPeriodo_(tipo, referencia) {
  var hoje = demoData_(referencia || new Date());
  var inicio = new Date(hoje.getTime());
  var fim = new Date(hoje.getTime());
  if (tipo === 'SEMANAL') {
    inicio.setDate(inicio.getDate() - inicio.getDay());
    fim = new Date(inicio.getTime());
    fim.setDate(fim.getDate() + 6);
  } else if (tipo === 'MENSAL') {
    inicio.setDate(1);
  } else {
    throw new Error('Período desconhecido: ' + tipo);
  }
  return { inicio: inicio, fim: fim, titulo: tipo + ': ' + demoDataISO_(inicio) + ' a ' + demoDataISO_(fim) };
}

function demoEstaNoPeriodo_(entrada, periodo, referencia) {
  var d = demoData_(entrada);
  var hoje = demoData_(referencia || new Date());
  return d >= periodo.inicio && d <= periodo.fim && d <= hoje;
}

function demoStatusRetorno_(retorno) {
  switch (demoNormalizar_(retorno)) {
    case 'ACEITO': return 'CONCLUÍDO';
    case 'REPROCESSANDO': return 'REPROCESSANDO';
    default: return 'PENDENTE';
  }
}

function demoChave_(id, evento) {
  return String(id).trim() + '|' + String(evento).trim();
}
function demoChaveAuditoria_(periodo, id, evento) {
  return String(periodo) + '|' + demoChave_(id, evento);
}

/** Reconcile without destroying free-form notes and without downgrading receipts. */
function demoAplicarRetorno_(linha, retorno) {
  var nova = linha.slice();
  if (!retorno || !retorno[2]) return nova;
  var situacao = demoNormalizar_(retorno[2]);
  if (['ACEITO', 'REJEITADO', 'PENDENTE', 'REPROCESSANDO'].indexOf(situacao) === -1) return nova;
  if (nova[8] && situacao !== 'ACEITO') return nova; // receipt already confirmed
  nova[7] = situacao;
  if (situacao === 'ACEITO' && retorno[3]) {
    nova[8] = String(retorno[3]);
    nova[9] = '';
    nova[11] = 'CONCLUÍDO';
  } else if (situacao === 'REJEITADO' && retorno[4]) {
    nova[9] = String(retorno[4]);
    if (!nova[11]) nova[11] = 'PENDENTE';
  } else if (situacao === 'REPROCESSANDO') {
    if (!nova[11] || nova[11] === 'PENDENTE') nova[11] = 'REPROCESSANDO';
  } else if (!nova[11]) {
    nova[11] = 'PENDENTE';
  }
  return nova;
}

function demoCsvCampo_(valor) {
  var texto = valor instanceof Date ? demoDataISO_(valor) : String(valor == null ? '' : valor);
  // Neutralizes spreadsheet formula injection when CSV is opened in a spreadsheet.
  if (/^[\s]*[=+\-@]/.test(texto)) texto = "'" + texto;
  return '"' + texto.replace(/"/g, '""') + '"';
}
