// src/whatsappService.ts

/**
 * Gera o link direto para o WhatsApp do cliente com uma mensagem formatada
 * @param {string} telefone - Número do WhatsApp do cliente (com DDD)
 * @param {string} nomeCliente - Nome do cliente
 * @param {string} numeroPedido - ID ou código do pedido
 * @param {string} status - Status atual (ex: Aprovado, Enviado)
 * @param {string} rastreio - Código de rastreio dos Correios/Transportadora (opcional)
 */
export function gerarLinkWhatsAppNotificacao(
  telefone: string, 
  nomeCliente: string, 
  numeroPedido: string, 
  status: string, 
  rastreio?: string
) {
  // Limpa caracteres especiais do telefone
  const foneLimpo = telefone.replace(/\D/g, '');

  let textoMensagem = `Olá, *${nomeCliente}*! Passando para atualizar sobre o seu pedido *${numeroPedido}*.\n\n` +
    `Status atual: *${status}* 📦`;

  if (rastreio) {
    textoMensagem += `\n\nO seu código de rastreio é: *${rastreio}*. Você já pode acompanhar a entrega!`;
  }

  textoMensagem += `\n\nQualquer dúvida, estamos à disposição!`;

  const urlCodificada = encodeURIComponent(textoMensagem);
  return `https://wa.me/55${foneLimpo}?text=${urlCodificada}`;
}
