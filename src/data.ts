export const CATEGORIES = [
  'Todos',
  'Eletrônicos',
  'Acessórios',
  'Vestuário',
  'Calçados',
  'Casa & Decoração'
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function generatePixPayload(key: string, name: string, amount: number): string {
  const cleanKey = key ? key.trim() : '00000000000';
  const cleanName = name ? name.substring(0, 25).trim() : 'LOJA';
  const valStr = amount.toFixed(2);
  
  return `00020126580014BR.GOV.BCB.PIX0114${cleanKey}520400005303986540${valStr.length < 10 ? '0' + valStr.length : valStr}${valStr}5802BR5915${cleanName}6009SAO PAULO62070503***6304`;
}

export function generateScript(product: any, tone: string) {
  return {
    hook: `🔥 Procurando ${product?.name || 'este produto'} com o melhor preço do mercado?`,
    demo: `Garantimos entrega rápida, suporte via WhatsApp e pagamento facilitado via Pix!`,
    cta: `Clique no link do perfil e faça seu pedido agora mesmo antes que esgote o estoque!`
  };
}
