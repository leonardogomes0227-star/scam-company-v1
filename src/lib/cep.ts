export interface CepAddress {
  cep: string;
  street: string;
  district: string;
  city: string;
  state: string;
}

export function formatCep(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Consulta o CEP no ViaCEP (serviço público e gratuito). Retorna null se não existir. */
export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) throw new Error('Falha ao consultar o CEP');
  const data = await res.json();
  if (data.erro) return null;
  return {
    cep: formatCep(digits),
    street: data.logradouro || '',
    district: data.bairro || '',
    city: data.localidade || '',
    state: data.uf || '',
  };
}

/** Compara cidades ignorando acentos, caixa e espaços extras. */
export function sameCity(a?: string | null, b?: string | null): boolean {
  const norm = (s?: string | null) =>
    (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
  return !!norm(a) && norm(a) === norm(b);
}

export const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
