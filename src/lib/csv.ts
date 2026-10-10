/** Gera e baixa um CSV compatível com Excel/Google Planilhas (separador ";" e BOM UTF-8). */
export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const content = [header, ...rows].map((r) => r.map(escape).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Número no formato brasileiro para planilhas (1234,50). */
export function csvNumber(n: number): string {
  return (Number(n) || 0).toFixed(2).replace('.', ',');
}
