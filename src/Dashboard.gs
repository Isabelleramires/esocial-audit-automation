/** Rebuilds the consolidated sheet and a simple KPI dashboard. */
function demoAtualizarDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var base = ss.getSheetByName(DEMO_CONFIG.base);
  if (!base) throw new Error('Execute "Preparar estrutura demonstrativa" primeiro.');
  var itens = [];
  demoAbasAuditoria_().forEach(function (nome) {
    demoLinhas_(ss.getSheetByName(nome)).forEach(function (linha) {
      if (linha[1]) itens.push(linha.slice(0, 12).concat(nome));
    });
  });
  demoSubstituirConteudo_(base, DEMO_CONFIG.auditHeaders.concat(['Aba de origem']), itens);
  if (itens.length) base.getRange(2, 5, itens.length, 1).setNumberFormat('dd/mm/yyyy');
  demoMontarDashboard_(itens);
}

function demoMontarDashboard_(itens) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(DEMO_CONFIG.dashboard) || ss.insertSheet(DEMO_CONFIG.dashboard);
  aba.getCharts().forEach(function (grafico) { aba.removeChart(grafico); });
  aba.getRange(1, 1, aba.getMaxRows(), aba.getMaxColumns()).breakApart();
  aba.clear();
  aba.setColumnWidths(1, 5, 160);
  aba.getRange('A1:E1').merge().setValue('AUDITORIA OCUPACIONAL — DEMONSTRAÇÃO')
    .setBackground('#142d4e').setFontColor('#ffffff').setFontSize(15).setFontWeight('bold');
  aba.getRange('A2:E2').merge().setValue('Somente dados fictícios · sem conexão com serviços oficiais')
    .setFontColor('#62738b');
  var resumo = { 'Total de eventos': itens.length, 'Concluídos': 0, 'Pendentes': 0,
    'Reprocessando': 0, 'Corrigidos': 0, 'Inconsistências': 0 };
  var eventos = { 'S-2220': 0, 'S-2221': 0, 'S-2240': 0 };
  itens.forEach(function (linha) {
    var status = demoNormalizar_(linha[11]);
    if (status === 'CONCLUIDO') resumo['Concluídos']++;
    else if (status === 'REPROCESSANDO') resumo['Reprocessando']++;
    else if (status === 'CORRIGIDO') resumo['Corrigidos']++;
    else resumo['Pendentes']++;
    if (linha[9]) resumo['Inconsistências']++;
    if (eventos[linha[6]] !== undefined) eventos[linha[6]]++;
  });
  var kpis = Object.keys(resumo).map(function (nome) { return [nome, resumo[nome]]; });
  aba.getRange(4, 1, kpis.length, 2).setValues(kpis);
  aba.getRange('A4:A9').setFontWeight('bold');
  aba.getRange('B4:B9').setBackground('#ecf5ff').setFontWeight('bold').setHorizontalAlignment('center');
  aba.getRange('A12:B12').setValues([['Evento', 'Quantidade']]).setFontWeight('bold')
    .setBackground('#142d4e').setFontColor('#ffffff');
  aba.getRange('A13:B15').setValues(Object.keys(eventos).map(function (nome) { return [nome, eventos[nome]]; }));
  if (itens.length) {
    var grafico = aba.newChart().asColumnChart()
      .addRange(aba.getRange('A12:B15')).setNumHeaders(1)
      .setPosition(4, 4, 0, 0).setOption('title', 'Eventos por categoria')
      .setOption('legend', { position: 'none' }).build();
    aba.insertChart(grafico);
  }
}

function onEdit(e) {
  if (!e || !e.range) return;
  var nome = e.range.getSheet().getName();
  if (demoAbasAuditoria_().indexOf(nome) < 0) return;
  if (e.range.getRow() < 2) return;
  if (e.range.getColumn() === 11 || e.range.getColumn() === 12) {
    demoAtualizarDashboard();
  }
}
