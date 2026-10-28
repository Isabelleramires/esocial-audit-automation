/** Google Sheets custom menu, available when the workbook opens. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Auditoria Demo')
    .addItem('1. Preparar estrutura demonstrativa', 'demoPrepararEstrutura')
    .addSeparator()
    .addItem('2. Gerar auditoria semanal', 'demoGerarSemanal')
    .addItem('3. Gerar auditoria mensal', 'demoGerarMensal')
    .addSeparator()
    .addItem('4. Atualizar retornos simulados', 'demoAtualizarRetornos')
    .addItem('5. Atualizar Dashboard', 'demoAtualizarDashboard')
    .addItem('6. Exportar Base Geral CSV', 'demoExportarCsv')
    .addToUi();
}

function demoExportarCsv() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(DEMO_CONFIG.base);
  if (!aba) throw new Error('Execute "Preparar estrutura demonstrativa" primeiro.');
  var conteudo = aba.getDataRange().getValues().map(function (linha) {
    return linha.map(demoCsvCampo_).join(',');
  }).join('\r\n');
  var nome = 'auditoria-demo-' + demoDataISO_(new Date()) + '.csv';
  var arquivo = DriveApp.createFile(nome, '\uFEFF' + conteudo, 'text/csv');
  SpreadsheetApp.getUi().alert('Arquivo CSV demonstrativo salvo no seu Drive:\n' + arquivo.getUrl());
}
