const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const ctx = vm.createContext({ Date, String, Error, isNaN });
for (const filename of ['Config.gs', 'Logica.gs']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', filename), 'utf8'), ctx, { filename });
}
let passed = 0;
function test(description, fn) {
  fn();
  passed++;
  process.stdout.write('✓ ' + description + '\n');
}
const events = (exam, job) => Array.from(ctx.demoClassificarEventos_(exam, job || 'Analista'));
test('Admissional gera dois eventos demonstrativos', () => assert.deepEqual(events('Admissional'), ['S-2220', 'S-2240']));
test('Mudança de função segue fluxo S-2220', () => assert.deepEqual(events('Mudança de Função'), ['S-2220']));
test('Motorista também gera evento ilustrativo S-2221', () => assert.deepEqual(events('Periódico', 'Motorista'), ['S-2220', 'S-2221']));
test('Auxiliar não é tratado como motorista', () => assert.deepEqual(events('Periódico', 'Auxiliar de motorista'), ['S-2220']));
test('Tipo não previsto não é classificado silenciosamente', () => assert.throws(() => events('Exame desconhecido'), /Tipo de exame/));
test('Aba S-2221 é separada', () => assert.equal(ctx.demoAbaPorEvento_('S-2221', events('Periódico', 'Motorista')), 'AUDITORIA S-2221'));
test('Aba combinada mantém ambos os eventos admissionais', () => assert.equal(ctx.demoAbaPorEvento_('S-2240', events('Admissional')), 'AUDITORIA S-2220 E S-2240'));
const semanal = ctx.demoPeriodo_('SEMANAL', new Date(2026, 9, 28));
test('Semana começa domingo', () => assert.equal(ctx.demoDataISO_(semanal.inicio), '2026-10-25'));
test('Semana termina sábado', () => assert.equal(ctx.demoDataISO_(semanal.fim), '2026-10-31'));
const mensal = ctx.demoPeriodo_('MENSAL', new Date(2026, 9, 28));
test('Mês começa no dia 1', () => assert.equal(ctx.demoDataISO_(mensal.inicio), '2026-10-01'));
test('Mês não ultrapassa hoje', () => assert.equal(ctx.demoDataISO_(mensal.fim), '2026-10-28'));
test('Não inclui datas futuras', () => assert.equal(ctx.demoEstaNoPeriodo_(new Date(2026, 9, 29), mensal, new Date(2026, 9, 28)), false));
test('Normaliza acentos e espaços', () => assert.equal(ctx.demoNormalizar_('  Reprocessando  '), 'REPROCESSANDO'));
test('Status de retorno aceito é concluído', () => assert.equal(ctx.demoStatusRetorno_('ACEITO'), 'CONCLUÍDO'));
test('Exportação protege contra fórmulas CSV', () => assert.equal(ctx.demoCsvCampo_('=HYPERLINK("x")'), `"'=HYPERLINK(""x"")"`));
const linha = ['periodo', 'DEMO-101', 'Empresa Fictícia', 'Pessoa Exemplo', new Date(2026, 9, 28), 'PERIÓDICO', 'S-2220', '', '', '', 'Anotação manual', 'CORRIGIDO'];
test('Retorno ausente preserva anotação e status', () => {
  const next = ctx.demoAplicarRetorno_(linha, null);
  assert.equal(next[10], 'Anotação manual'); assert.equal(next[11], 'CORRIGIDO');
});
test('Retorno recebido preenche recibo sem apagar anotação', () => {
  const next = ctx.demoAplicarRetorno_(linha, ['DEMO-101', 'S-2220', 'ACEITO', 'REC-DEMO-101', '']);
  assert.equal(next[8], 'REC-DEMO-101'); assert.equal(next[10], 'Anotação manual'); assert.equal(next[11], 'CONCLUÍDO');
});
test('Erro posterior não rebaixa recibo confirmado', () => {
  const confirmado = ctx.demoAplicarRetorno_(linha, ['DEMO-101', 'S-2220', 'ACEITO', 'REC-DEMO-101', '']);
  const next = ctx.demoAplicarRetorno_(confirmado, ['DEMO-101', 'S-2220', 'REJEITADO', '', 'Erro demo']);
  assert.equal(next[8], 'REC-DEMO-101'); assert.equal(next[11], 'CONCLUÍDO');
});
console.log('\n' + passed + ' testes de lógica: aprovados.');
