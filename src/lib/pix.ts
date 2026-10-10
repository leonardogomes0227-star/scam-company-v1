// Geração do "Pix Copia e Cola" (BR Code estático) conforme o manual do Banco Central.

function field(id: string, value: string): string {
  return id + String(value.length).padStart(2, '0') + value;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function sanitize(text: string, max: number): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .slice(0, max)
    .toUpperCase();
}

export interface PixParams {
  key: string;
  merchantName: string;
  merchantCity?: string;
  amount?: number;
  txid?: string;
}

export function buildPixPayload({ key, merchantName, merchantCity = 'BRASIL', amount, txid }: PixParams): string {
  const account = field('00', 'br.gov.bcb.pix') + field('01', key.trim());
  const ref = (txid || '***').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';

  let payload =
    field('00', '01') +
    field('26', account) +
    field('52', '0000') +
    field('53', '986') +
    (amount && amount > 0 ? field('54', amount.toFixed(2)) : '') +
    field('58', 'BR') +
    field('59', sanitize(merchantName, 25) || 'LOJA') +
    field('60', sanitize(merchantCity, 15) || 'BRASIL') +
    field('62', field('05', ref));

  payload += '6304';
  return payload + crc16(payload);
}
