/** Creates a clean demo workbook without overwriting existing rows. */
function demoGarantirAba_(nome, cabecalhos) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(nome) || ss.insertSheet(nome);
  var intervalo = aba.getRange(1, 1, 1, cabecalhos.length);
  intervalo.setValues([cabecalhos]);
  intervalo.setFontWeight('bold').setBackground('#142d4e').setFontColor('#ffffff');
  aba.setFrozenRows(1);
  aba.setColumnWidths(1, cabecalhos.length, 160);
  if (nome === DEMO_CONFIG.entry) aba.setColumnWidth(5, 130);
  if (nome.indexOf('AUDITORIA') >= 0) aba.setColumnWidth(11, 240);
  return aba;
}

function demoPrepararEstrutura() {
  demoGarantirAba_(DEMO_CONFIG.entry, DEMO_CONFIG.entryHeaders);
  demoGarantirAba_(DEMO_CONFIG.returns, DEMO_CONFIG.returnHeaders);
  demoAbasAuditoria_().forEach(function (nome) {
    demoGarantirAba_(nome, DEMO_CONFIG.auditHeaders);
    demoAplicarValidacaoStatus_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nome));
  });
  demoGarantirAba_(DEMO_CONFIG.base, DEMO_CONFIG.auditHeaders.concat(['Aba de origem']));
  demoCriarDadosExemplo_();
  demoAtualizarDashboard();
  SpreadsheetApp.getActiveSpreadsheet().toast('Estrutura demonstrativa pronta.', 'Auditoria Demo', 5);
}

function demoAplicarValidacaoStatus_(aba) {
  var regra = SpreadsheetApp.newDataValidation()
    .requireValueInList(DEMO_CONFIG.allowedStatuses, true).setAllowInvalid(false).build();
  aba.getRange(2, 12, Math.max(aba.getMaxRows() - 1, 1), 1).setDataValidation(regra);
}

function demoLinhas_(aba) {
  if (!aba || aba.getLastRow() < 2) return [];
  return aba.getRange(2, 1, aba.getLastRow() - 1, aba.getLastColumn()).getValues();
}

function demoSubstituirConteudo_(aba, cabecalhos, linhas) {
  aba.clearContents();
  demoGarantirAba_(aba.getName(), cabecalhos);
  if (linhas.length) aba.getRange(2, 1, linhas.length, cabecalhos.length).setValues(linhas);
}
