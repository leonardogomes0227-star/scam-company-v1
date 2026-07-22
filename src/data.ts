import { Product, StoreConfig, ToneOfVoice, GeneratedScript } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Tênis Air Runner Pro',
    description: 'Tênis esportivo com amortecimento avançado e solado antiderrapante para máxima performance.',
    price: 289.90,
    category: 'Calçados',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    active: true,
    stock: 42,
  },
  {
    id: '2',
    name: 'Camiseta Urban Minimal',
    description: 'Camiseta premium 100% algodão, corte slim, ideal para o dia a dia urbano.',
    price: 79.90,
    category: 'Roupas',
    image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=400',
    active: true,
    stock: 120,
  },
  {
    id: '3',
    name: 'Mochila Tech Carry',
    description: 'Mochila impermeável com compartimento acolchoado para notebook até 15" e porta USB.',
    price: 179.90,
    category: 'Acessórios',
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
    active: true,
    stock: 35,
  },
  {
    id: '4',
    name: 'Smartwatch Pulse X',
    description: 'Relógio inteligente com monitor cardíaco, GPS integrado e bateria de 7 dias.',
    price: 459.90,
    category: 'Eletrônicos',
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
    active: true,
    stock: 18,
  },
  {
    id: '5',
    name: 'Óculos Shade Classic',
    description: 'Óculos de sol com proteção UV400, armação acetato e lentes polarizadas.',
    price: 139.90,
    category: 'Acessórios',
    image: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=400',
    active: true,
    stock: 60,
  },
  {
    id: '6',
    name: 'Fone Bluetooth Nova',
    description: 'Fone over-ear com cancelamento de ruído ativo, 30h de autonomia e qualidade Hi-Fi.',
    price: 319.90,
    category: 'Eletrônicos',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    active: true,
    stock: 27,
  },
  {
    id: '7',
    name: 'Calça Jogger Flex',
    description: 'Calça jogger em moletom leve com elástico ajustável, perfeita para treinos ou lazer.',
    price: 119.90,
    category: 'Roupas',
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    active: false,
    stock: 0,
  },
  {
    id: '8',
    name: 'Squeeze Eco Flow',
    description: 'Garrafa térmica 500ml em aço inox, mantém bebidas geladas por 24h e quentes por 12h.',
    price: 64.90,
    category: 'Acessórios',
    image: 'https://images.pexels.com/photos/1342529/pexels-photo-1342529.jpeg?auto=compress&cs=tinysrgb&w=400',
    active: true,
    stock: 95,
  },
];

export const INITIAL_CONFIG: StoreConfig = {
  name: 'Scam Company Store',
  whatsapp: '5511999999999',
  pixKey: '11.999.999/0001-99',
  pixKeyType: 'cnpj',
  about: 'Sua vitrine digital com automação de WhatsApp, Pix e criativos de IA.',
};

export const CATEGORIES = ['Todos', 'Roupas', 'Calçados', 'Acessórios', 'Eletrônicos'];

export const formatCurrency = (value: any) => {
  const num = Number(value || 0);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const generatePixPayload = (key: string, name: string, amount: number): string => {
  const amt = Number(amount || 0).toFixed(2);
  const sanitizedName = String(name || 'Loja').substring(0, 25).padEnd(25, ' ');
  return `00020126580014BR.GOV.BCB.PIX0136${String(key || '').replace(/\s/g, '')}5204000053039865406${amt}5802BR5925${sanitizedName}`;
};

export function generateScript(
  product: Product,
  tone: ToneOfVoice,
): GeneratedScript {
  const currentPrice = Number(product.promoPrice ?? product.price || 0);
  const basePrice = Number(product.price || 0);

  const price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(currentPrice);

  const hasPromo = product.promoPrice != null && basePrice > 0;
  const percent = hasPromo
    ? Math.round(((basePrice - Number(product.promoPrice)) / basePrice) * 100)
    : 0;
  let hook = "";
  let hookVisual = "";
  let demo = "";
  let demoVisual = "";
  let cta = "";
  let ctaVisual = "";
  let caption = "";
  let audioSuggestion = "";

  switch (tone) {
    case "urgencia":
      hook = `PARA TUDO! Se você quer ${(product.name || '').toLowerCase()}, o estoque tá nas últimas unidades!`;
      hookVisual = "Mostre o produto em mãos de forma dinâmica ou apontando para a câmera.";
      demo = `${product.description} ${hasPromo ? `Ele tá com ${percent}% OFF!` : "Preço promocional exclusivo só hoje."}`;
      demoVisual = "Mostre detalhes do produto bem de perto (close-up) e em uso rápido.";
      cta = `Por apenas ${price}. Comenta "EU QUERO" no direct agora!`;
      ctaVisual = "Aponte para o texto na tela mostrando o preço e a chamada para o WhatsApp/Direct.";
      caption = `🚨 OFERTA RELÂMPAGO 🚨\n\n${product.name} por apenas ${price} ✅\n\n⚠️ Restam poucas unidades. Garanta o seu com pagamento rápido no Pix!\n\n📲 Link na bio.\n\n#promocao #oferta #${(product.category || '').toLowerCase()}`;
      audioSuggestion = "Áudio em alta / Trend de urgência ou batida acelerada.";
      break;

    case "humor":
      hook = `POV: Você achou o ${(product.name || '').toLowerCase()} perfeito e achou que custava uma fortuna...`;
      hookVisual = "Texto grande na tela com você olhando desacreditado para o produto.";
      demo = `Testei e confesso: ${(product.description || '').toLowerCase()} Fiquei chocado com a qualidade.`;
      demoVisual = "Vídeo curto mostrando a reação abrindo a caixa / usando no dia a dia.";
      cta = `E o preço? Apenas ${price}! Corre no WhatsApp antes que acabe 😂`;
      ctaVisual = "Mostre a tela do celular ou o produto com um sorriso.";
      caption = `Ninguém tava preparado pra esse achado 👀✨\n\n${product.name} por apenas ${price}.\n\n#viral #humor #achados #${(product.category || '').toLowerCase()}`;
      audioSuggestion = "Áudio viral engraçado ou meme em alta no Reels/TikTok.";
      break;

    case "autoridade":
      hook = `Procurando ${(product.name || '').toLowerCase()} com qualidade profissional? Presta atenção nisso aqui.`;
      hookVisual = "Gravação com boa iluminação, segurando o produto com firmeza.";
      demo = `${product.description} Material de alta durabilidade e acabamento impecável.`;
      demoVisual = "Mostre os diferenciais técnicos e acabamento detalhado.";
      cta = `Garanta o seu por ${price}. Pagamento facilitado no Pix com envio rápido.`;
      ctaVisual = "Mostre o produto pronto para uso.";
      caption = `Qualidade e custo-benefício que você procura. 👌\n\n${product.name}\n💰 Apenas ${price}\n\n#qualidade #premium #${(product.category || '').toLowerCase()}`;
      audioSuggestion = "Música de fundo instrumental/lo-fi moderna e elegante.";
      break;

    case "provocador":
      hook = `Você ainda tá usando produto ruim só porque acha que ${(product.name || '').toLowerCase()} é caro?`;
      hookVisual = "Balançar a cabeça dizendo 'não' e mostrar o produto em destaque.";
      demo = `Olha esse resultado: ${(product.description || '').toLowerCase()} Chega de passar raiva!`;
      demoVisual = "Comparativo rápido do uso do produto facilitando a rotina.";
      cta = `Sai por apenas ${price} na nossa loja. Clica no link da bio e resolve isso hoje!`;
      ctaVisual = "Aponte para baixo ou para a bio com o produto na mão.";
      caption = `Parou com a desculpa! 🛑\n\n${product.name} por apenas ${price}.\n\n#novidade #solucao #${(product.category || '').toLowerCase()}`;
      audioSuggestion = "Áudio de transição impacto/música eletrônica com batida marcante.";
      break;

    case "direto":
    default:
      hook = `Procurando ${(product.name || '').toLowerCase()}? Achamos a melhor opção para você!`;
      hookVisual = "Apresente o produto centralizado na tela com visual limpo.";
      demo = `${product.description} Praticidade e preço justo em um só item.`;
      demoVisual = "Demonstração prática em 5 segundos.";
      cta = `Preço especial: ${price}. Chama no WhatsApp pelo link da bio e garanta o seu!`;
      ctaVisual = "Mostre o produto e a chamada em texto cobrindo a parte inferior.";
      caption = `${product.name} disponível na loja! 🔥\n\nGaranta por apenas ${price}.\n\n#${(product.category || '').toLowerCase()} #compras #ofertas`;
      audioSuggestion = "Música pop animada / instrumental leve de fundo.";
      break;
  }

  return {
    blocks: [
      { time: "0-3s", label: "Gancho (Hook)", text: hook, visualInstruction: hookVisual },
      { time: "3-10s", label: "Demonstração & Valor", text: demo, visualInstruction: demoVisual },
      { time: "10-15s", label: "Chamada para Ação (CTA)", text: cta, visualInstruction: ctaVisual },
    ],
    caption,
    audioSuggestion,
  };
}
