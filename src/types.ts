export type UserRole = 'SUPER_ADMIN' | 'STORE_OWNER';

export interface Tenant {
  id: string;
  name: string;
  owner_id?: string | null;
  about?: string | null;
  whatsapp?: string | null;
  color?: string | null;
  pix_key?: string | null;
  plan?: 'BASIC' | 'PRO' | string;
  subscription_status?: 'active' | 'pending' | 'blocked' | string;
  shipping_local?: number | null;
  shipping_far?: number | null;
  created_at?: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  category?: string | null;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const ORDER_STATUSES = [
  'Aguardando Pagamento',
  'Pago / Separando',
  'Enviado / A Caminho',
  'Entregue com Sucesso',
  'Cancelado',
] as const;

export interface Order {
  id: string;
  tenant_id: string;
  customer: string;
  whatsapp?: string | null;
  address?: string | null;
  payment?: string | null;
  total: number;
  shipping?: number | null;
  discount?: number | null;
  coupon?: string | null;
  status: string;
  date: string;
  items?: OrderItem[] | null;
  created_at?: string;
}

export interface Coupon {
  id: string;
  tenant_id: string;
  code: string;
  discount: number;
}

export interface Review {
  id: string;
  tenant_id: string;
  product_id: string;
  name: string;
  comment: string;
  rating: number;
  created_at?: string;
}
