import { Product, StoreConfig, ScriptData } from './types';

export const CATEGORIES = [
  'Todos',
  'Eletrônicos',
  'Acessórios',
  'Casa & Decoração',
  'Moda'
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function generatePixPayload(key: string, name: string, amount: number): string {
  const value = Number(amount || 0).toFixed(2);
  const sanitizedName = String(name || 'Loja').substring(0, 25).padEnd(25, ' ');
  return `00020126580014BR.GOV.BCB.PIX0136${String(key || '').replace(/\s/g, '')}5204000053039865406${value}5802BR5925${sanitizedName}6009CAMPO GRANDE62070503***6304`;
}

export function generateScript(
  product: Product,
  tone: string
): ScriptData {
  // ✅ FIX: Uso correto dos parênteses para não conflitar || com ??
  const currentPrice = Number((product.promoPrice ?? product.price) || 0);
  const basePrice = Number(product.price || 0);

  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(currentPrice);

  const hasPromo = product.promoPrice != null && basePrice > 0;
  const discountPercent = hasPromo
    ? Math.round(((basePrice - Number(product.promoPrice)) / basePrice) * 100)
    : 0;

  let hook = '';
  let visualHook = '';
  let demo = '';
  let visualDemo = '';
  let cta = '';
  let visualCta = '';

  if (tone === 'Persuasivo' || tone === 'Vendedor') {
    hook = `Você precisa ver isso antes que acabe! O ${product.name} está com uma condição imperdível.`;
    visualHook = `Mostrar o produto ${product.name} em destaque com texto chamativo na tela.`;
    demo = `Olha a qualidade desse produto! ${product.description || 'Design incrível e alta durabilidade.'}`;
    visualDemo = `Foco nos detalhes do produto sendo utilizado.`;
    cta = `Ganta o seu agora por apenas ${priceFormatted} clicando no link do perfil!`;
    visualCta = `Seta apontando para a bio/link de compra.`;
  } else {
    hook = `Conheça o ${product.name}, a melhor escolha para o seu dia a dia.`;
    visualHook = `Apresentação limpa do produto em um cenário agradável.`;
    demo = `${product.description || 'Ideal para quem busca praticidade e qualidade.'}`;
    visualDemo = `Uso prático do produto mostrando seus benefícios.`;
    cta = `Aproveite por apenas ${priceFormatted}. Link disponível na loja!`;
    visualCta = `Logotipo da loja e chamada para ação simples.`;
  }

  return {
    hook,
    visualHook,
    demo,
    visualDemo,
    cta,
    visualCta,
    hasPromo,
    discountPercent,
    priceFormatted,
  };
}
