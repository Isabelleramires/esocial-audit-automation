/** Configuration for a local demonstration, without remote services. */
var DEMO_CONFIG = {
  entry: 'ENTRADA ASO',
  returns: 'RETORNOS SIMULADOS',
  audit2220: 'AUDITORIA S-2220',
  audit2221: 'AUDITORIA S-2221',
  auditCombined: 'AUDITORIA S-2220 E S-2240',
  base: 'BASE GERAL',
  dashboard: 'DASHBOARD',
  entryHeaders: ['ID Registro', 'Empresa fictícia', 'Colaborador fictício', 'Cargo ilustrativo', 'Data ASO', 'Tipo de exame', 'Exame', 'Observações'],
  returnHeaders: ['ID Registro', 'Evento', 'Retorno simulado', 'Recibo fictício', 'Detalhes simulados'],
  auditHeaders: ['Período', 'ID Registro', 'Empresa fictícia', 'Colaborador fictício', 'Data ASO', 'Tipo de exame', 'Evento', 'Retorno simulado', 'Recibo fictício', 'Inconsistência', 'Observações', 'Status tratativa'],
  allowedStatuses: ['PENDENTE', 'REPROCESSANDO', 'CORRIGIDO', 'CONCLUÍDO']
};

function demoAbasAuditoria_() {
  return [DEMO_CONFIG.audit2220, DEMO_CONFIG.audit2221, DEMO_CONFIG.auditCombined];
}
