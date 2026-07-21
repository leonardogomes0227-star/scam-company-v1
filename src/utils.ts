import { CartItem, StoreConfig } from '@/types';
import { formatCurrency } from '@/data';

export function buildWhatsAppMessage(items: CartItem[], config: StoreConfig, total: number): string {
  const lines = items.map(
    (i) => `• ${i.product.name} x${i.quantity} — ${formatCurrency(i.product.price * i.quantity)}`
  );
  const text = [
    `Olá! Gostaria de finalizar meu pedido na *${config.name}*:`,
    '',
    ...lines,
    '',
    `*Total: ${formatCurrency(total)}*`,
    '',
    `Chave Pix (${config.pixKeyType.toUpperCase()}): \`${config.pixKey}\``,
    '',
    'Aguardo confirmação. Obrigado!',
  ].join('\n');
  return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function generateScript(productName: string, productDesc: string, price: number): string {
  return [
    `[0–3s HOOK]\n"Você sabia que ${productName} pode transformar o seu dia? Olha isso!"`,
    `[3–10s VALOR & DEMO]\n"${productDesc} Com qualidade premium e entrega rápida, o ${productName} é perfeito para quem não abre mão do melhor. E o melhor? Por apenas ${formatCurrency(price)}!"`,
    `[10–15s CTA]\n"Clica no link da bio, adiciona no carrinho e finaliza pelo WhatsApp agora mesmo! Estoque limitado — corre!"`,
  ].join('\n\n');
}
