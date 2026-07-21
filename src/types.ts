export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; 
  promoPrice?: number;
  category: string;
  image: string;
  active: boolean;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreConfig {
  name: string;
  whatsapp: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  about: string;
}

export type Page = 'home' | 'loja' | 'admin';
export type AdminTab = 'produtos' | 'ia' | 'configuracoes';
export type ToneOfVoice =
  | "direto"
  | "urgencia"
  | "humor"
  | "autoridade"
  | "provocador"

export interface ScriptBlock {
  time: string
  label: string
  text: string
  visualInstruction: string
}

export interface GeneratedScript {
  blocks: ScriptBlock[]
  caption: string
  audioSuggestion: string
}