/** Headless, dependency-free integration smoke test of the Apps Script workflow. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const A1 = /^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/;
function columnNumber(label) {
  return label.split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
}
class MockRange {
  constructor(sheet, r, c, rows, columns) { Object.assign(this, { sheet, r, c, rows, columns }); }
  setValues(values) {
    assert.equal(values.length, this.rows);
    values.forEach((row, dr) => {
      assert.equal(row.length, this.columns);
      row.forEach((value, dc) => this.sheet.setCell(this.r + dr, this.c + dc, value));
    });
    return this;
  }
  getValues() {
    return Array.from({ length: this.rows }, (_, dr) =>
      Array.from({ length: this.columns }, (_, dc) => this.sheet.getCell(this.r + dr, this.c + dc)));
  }
  setValue(v) { this.sheet.setCell(this.r, this.c, v); return this; }
  getValue() { return this.sheet.getCell(this.r, this.c); }
  setFontWeight() { return this; } setBackground() { return this; }
  setFontColor() { return this; } setFontSize() { return this; }
  setNumberFormat() { return this; } setHorizontalAlignment() { return this; }
  setDataValidation() { return this; } merge() { return this; } breakApart() { return this; }
}
class MockSheet {
  constructor(name) { this.name = name; this.cells = {}; this.charts = []; }
  setCell(r, c, value) { this.cells[`${r}:${c}`] = value; }
  getCell(r, c) { return this.cells[`${r}:${c}`] ?? ''; }
  getName() { return this.name; }
  getLastRow() { return Math.max(0, ...Object.keys(this.cells).filter(k => this.cells[k] !== '').map(k => Number(k.split(':')[0]))); }
  getLastColumn() { return Math.max(0, ...Object.keys(this.cells).filter(k => this.cells[k] !== '').map(k => Number(k.split(':')[1]))); }
  getMaxRows() { return 100; }
  getMaxColumns() { return 26; }
  getRange(...args) {
    if (typeof args[0] === 'string') {
      const m = args[0].match(A1);
      assert.ok(m, 'Supported A1: ' + args[0]);
      const [c1, r1, c2, r2] = [columnNumber(m[1]), Number(m[2]), columnNumber(m[3] || m[1]), Number(m[4] || m[2])];
      return new MockRange(this, r1, c1, r2 - r1 + 1, c2 - c1 + 1);
    }
    return new MockRange(this, ...args);
  }
  getDataRange() { return this.getRange(1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }
  setFrozenRows() { return this; }
  setColumnWidths() { return this; }
  setColumnWidth() { return this; }
  clear() { this.cells = {}; return this; }
  clearContents() { this.cells = {}; return this; }
  getCharts() { return [...this.charts]; }
  removeChart(chart) { this.charts = this.charts.filter(x => x !== chart); }
  newChart() {
    return {
      asColumnChart() { return this; }, addRange() { return this; }, setNumHeaders() { return this; },
      setPosition() { return this; }, setOption() { return this; }, build() { return { chart: 'demo' }; }
    };
  }
  insertChart(chart) { this.charts.push(chart); }
}
class MockSpreadsheet {
  constructor() { this.sheets = new Map([['Planilha1', new MockSheet('Planilha1')]]); }
  getSheetByName(name) { return this.sheets.get(name) || null; }
  insertSheet(name) { const sh = new MockSheet(name); this.sheets.set(name, sh); return sh; }
  toast() {}
}
const ss = new MockSpreadsheet();
const writes = [];
const context = vm.createContext({
  Date, String, Error, isNaN, console,
  SpreadsheetApp: {
    getActiveSpreadsheet: () => ss,
    newDataValidation: () => ({ requireValueInList() { return this; }, setAllowInvalid() { return this; }, build() { return {}; } }),
    getUi: () => ({ alert() {} })
  },
  DriveApp: { createFile: (name, body, type) => { writes.push({ name, body, type }); return { getUrl: () => 'https://example.invalid/sample.csv' }; } }
});
for (const name of ['Config.gs', 'Logica.gs', 'DadosFicticios.gs', 'Planilhas.gs', 'Auditoria.gs', 'Retornos.gs', 'Dashboard.gs', 'Menu.gs']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', name), 'utf8'), context, { filename: name });
}
context.demoPrepararEstrutura();
assert.equal(ss.getSheetByName('ENTRADA ASO').getLastRow(), 9, '8 fictional ASO rows');
assert.equal(ss.getSheetByName('RETORNOS SIMULADOS').getLastRow(), 9, '8 mock response rows');
context.demoGerarSemanal();
function auditRows() {
  return ['AUDITORIA S-2220', 'AUDITORIA S-2221', 'AUDITORIA S-2220 E S-2240']
    .flatMap(name => ss.getSheetByName(name).getDataRange().getValues().slice(1));
}
const firstRun = auditRows().length;
assert.ok(firstRun >= 3, 'several audit events should be created');
assert.ok(auditRows().some(r => r[6] === 'S-2221'), 'motorist S-2221');
assert.ok(auditRows().some(r => r[6] === 'S-2240'), 'admissional S-2240');
context.demoGerarSemanal();
assert.equal(auditRows().length, firstRun, 'repeat period must not duplicate rows');
context.demoGerarMensal();
assert.ok(auditRows().length > firstRun, 'monthly period should have distinct rows');
assert.equal(ss.getSheetByName('BASE GERAL').getLastRow() - 1, auditRows().length);

const sheet2220 = ss.getSheetByName('AUDITORIA S-2220');
const all = sheet2220.getDataRange().getValues();
const position = all.findIndex(r => r[1] === 'DEMO-002');
assert.ok(position > 0, 'DEMO-002 should be in S-2220');
sheet2220.setCell(position + 1, 11, 'Nota mantida manualmente');
const mockReturns = ss.getSheetByName('RETORNOS SIMULADOS');
const retData = mockReturns.getDataRange().getValues();
const returnPosition = retData.findIndex(r => r[0] === 'DEMO-002' && r[1] === 'S-2220');
mockReturns.setCell(returnPosition + 1, 3, 'REJEITADO');
mockReturns.setCell(returnPosition + 1, 4, '');
mockReturns.setCell(returnPosition + 1, 5, 'Erro posterior fictício');
context.demoAtualizarRetornos();
assert.equal(sheet2220.getCell(position + 1, 9), 'REC-DEMO-002', 'receipt must not be downgraded');
assert.equal(sheet2220.getCell(position + 1, 11), 'Nota mantida manualmente', 'manual notes retained');
context.demoExportarCsv();
assert.equal(writes.length, 1);
assert.ok(writes[0].body.includes('DEMO-'));
console.log('Fluxo demonstrativo completo: aprovado (sem Google ou rede).');
