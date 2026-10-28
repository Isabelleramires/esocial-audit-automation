/** Fictional people, fictional companies, and local sample dates. */
function demoCriarDadosExemplo_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var entrada = ss.getSheetByName(DEMO_CONFIG.entry);
  var retornos = ss.getSheetByName(DEMO_CONFIG.returns);
  var hoje = demoData_(new Date());
  var inicioSemana = demoPeriodo_('SEMANAL', hoje).inicio;
  var primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  function diasAtras(n) {
    var d = new Date(hoje.getTime()); d.setDate(d.getDate() - n); return d;
  }
  function diaSemana(n) {
    var d = new Date(inicioSemana.getTime()); d.setDate(d.getDate() + n); return d;
  }
  var datas = [hoje, diasAtras(1), diaSemana(0), primeiroDiaMes, diasAtras(4), diasAtras(7), diasAtras(11), diasAtras(17)];
  var tipos = ['ADMISSIONAL', 'MUDANÇA DE FUNÇÃO', 'PERIÓDICO', 'PERIÓDICO', 'RETORNO AO TRABALHO', 'MUDANÇA DE FUNÇÃO', 'DEMISSIONAL', 'PERIÓDICO'];
  var cargos = ['Analista', 'Operador', 'Motorista', 'Motorista', 'Assistente', 'Analista', 'Técnico', 'Administrativo'];
  if (entrada.getLastRow() === 1) {
    var linhas = datas.map(function (data, indice) {
      var id = 'DEMO-' + String(indice + 1).padStart(3, '0');
      var empresa = 'Empresa Fictícia ' + (indice % 2 === 0 ? 'A' : 'B');
      return [id, empresa, 'Colaborador Exemplo ' + (indice + 1), cargos[indice], data, tipos[indice], 'Exame demonstrativo', 'Dados sintéticos'];
    });
    entrada.getRange(2, 1, linhas.length, DEMO_CONFIG.entryHeaders.length).setValues(linhas);
    entrada.getRange(2, 5, linhas.length, 1).setNumberFormat('dd/mm/yyyy');
  }
  if (retornos.getLastRow() === 1) {
    var exemplos = [
      ['DEMO-001', 'S-2220', 'ACEITO', 'REC-DEMO-001', 'Processamento fictício aprovado'],
      ['DEMO-001', 'S-2240', 'REJEITADO', '', 'Campo demonstrativo incompleto'],
      ['DEMO-002', 'S-2220', 'ACEITO', 'REC-DEMO-002', 'Processamento fictício aprovado'],
      ['DEMO-003', 'S-2220', 'PENDENTE', '', 'Aguardando processamento fictício'],
      ['DEMO-003', 'S-2221', 'REPROCESSANDO', '', 'Reprocessamento demonstrativo'],
      ['DEMO-004', 'S-2221', 'REJEITADO', '', 'Informação sintética divergente'],
      ['DEMO-005', 'S-2220', 'REJEITADO', '', 'Registro fictício incompleto'],
      ['DEMO-006', 'S-2220', 'ACEITO', 'REC-DEMO-006', 'Processamento fictício aprovado']
    ];
    retornos.getRange(2, 1, exemplos.length, DEMO_CONFIG.returnHeaders.length).setValues(exemplos);
  }
}
