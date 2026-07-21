import { Product, StoreConfig } from '@/types';

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

export const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const generatePixPayload = (key: string, name: string, amount: number): string => {
  const amt = amount.toFixed(2);
  const sanitizedName = name.substring(0, 25).padEnd(25, ' ');
  return `00020126580014BR.GOV.BCB.PIX0136${key.replace(/\s/g, '')}5204000053039865406${amt}5802BR5925${sanitizedName}6009SAO PAULO62070503***6304ABCD`;
};
