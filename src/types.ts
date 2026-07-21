export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
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
