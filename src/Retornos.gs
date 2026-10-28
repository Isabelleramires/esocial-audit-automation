/** Applies simulated returns without erasing notes or downgrading confirmed receipts. */
function demoAtualizarRetornos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mapa = demoMapaRetornos_();
  var atualizados = 0;
  demoAbasAuditoria_().forEach(function (nome) {
    var aba = ss.getSheetByName(nome);
    var linhas = demoLinhas_(aba);
    if (!linhas.length) return;
    var mudou = false;
    var novasLinhas = linhas.map(function (linha) {
      var retorno = mapa[demoChave_(linha[1], linha[6])];
      var atualizada = demoAplicarRetorno_(linha, retorno);
      if (JSON.stringify(atualizada) !== JSON.stringify(linha)) {
        atualizados++;
        mudou = true;
      }
      return atualizada;
    });
    if (mudou) aba.getRange(2, 1, novasLinhas.length, DEMO_CONFIG.auditHeaders.length).setValues(novasLinhas);
  });
  demoAtualizarDashboard();
  ss.toast(atualizados + ' retorno(s) alterado(s).', 'Auditoria Demo', 5);
}
