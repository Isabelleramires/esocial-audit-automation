/** Generates local audit rows. Only reads the synthetic ENTRADA ASO worksheet. */
function demoGerarSemanal() { demoGerarAuditoria_('SEMANAL'); }
function demoGerarMensal() { demoGerarAuditoria_('MENSAL'); }

function demoMapaRetornos_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DEMO_CONFIG.returns);
  var mapa = {};
  demoLinhas_(sheet).forEach(function (row) {
    if (row[0] && row[1]) mapa[demoChave_(row[0], row[1])] = row;
  });
  return mapa;
}

function demoGerarAuditoria_(tipo) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var entrada = ss.getSheetByName(DEMO_CONFIG.entry);
  if (!entrada) throw new Error('Execute "Preparar estrutura demonstrativa" primeiro.');
  var hoje = demoData_(new Date());
  var periodo = demoPeriodo_(tipo, hoje);
  var mapa = demoMapaRetornos_();
  var novas = {};
  var existentes = {};
  demoAbasAuditoria_().forEach(function (nome) {
    existentes[nome] = {};
    novas[nome] = [];
    demoLinhas_(ss.getSheetByName(nome)).forEach(function (linha) {
      existentes[nome][demoChaveAuditoria_(linha[0], linha[1], linha[6])] = true;
    });
  });
  var ignorados = 0;
  demoLinhas_(entrada).forEach(function (registro) {
    if (!registro[0] || !registro[4]) return;
    var data;
    try { data = demoData_(registro[4]); } catch (_) { ignorados++; return; }
    if (!demoEstaNoPeriodo_(data, periodo, hoje)) return;
    var eventos = demoClassificarEventos_(registro[5], registro[3]);
    eventos.forEach(function (evento) {
      var abaDestino = demoAbaPorEvento_(evento, eventos);
      var chave = demoChaveAuditoria_(periodo.titulo, registro[0], evento);
      if (existentes[abaDestino][chave]) return; // idempotent
      existentes[abaDestino][chave] = true;
      var retorno = mapa[demoChave_(registro[0], evento)];
      var novaLinha = [
        periodo.titulo, registro[0], registro[1], registro[2], data, registro[5], evento,
        '', '', '', registro[7] || '', 'PENDENTE'
      ];
      novas[abaDestino].push(demoAplicarRetorno_(novaLinha, retorno));
    });
  });
  var criados = 0;
  demoAbasAuditoria_().forEach(function (nome) {
    var aba = ss.getSheetByName(nome);
    var linhas = novas[nome];
    if (!linhas.length) return;
    var primeira = aba.getLastRow() + 1;
    aba.getRange(primeira, 1, linhas.length, DEMO_CONFIG.auditHeaders.length).setValues(linhas);
    aba.getRange(primeira, 5, linhas.length, 1).setNumberFormat('dd/mm/yyyy');
    criados += linhas.length;
  });
  demoAtualizarDashboard();
  ss.toast(criados + ' evento(s) gerado(s). ' + ignorados + ' data(s) inválida(s).', 'Auditoria ' + tipo, 7);
}
