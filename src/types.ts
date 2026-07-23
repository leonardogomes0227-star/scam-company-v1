export type UserRole = 'SUPER_ADMIN' | 'STORE_OWNER' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string; // Nulo para Super Admin; ID da loja para Lojistas e Clientes
}

export interface StoreTenant {
  id: string; // Ex: 'lkd-imports', 'carbura-ms'
  name: string;
  ownerEmail: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  active: boolean;
  createdAt: string;
  config: {
    about: string;
    whatsapp: string;
    pixKey: string;
    fixedFreight: number;
    freeFreightThreshold: number;
    logoUrl?: string;
  };
}

export interface Product {
  id: string;
  tenantId: string; // Garantia de isolamento por loja
  name: string;
  price: number;
  promoPrice?: number;
  image: string;
  category: string;
  variants?: string[];
  stock: number;
}

export interface Order {
  id: string;
  tenantId: string;
  customerName: string;
  total: number;
  status: 'Pendente' | 'Pago' | 'Enviado' | 'Cancelado';
  date: string;
  items?: any[];
}

export interface Coupon {
  id: string;
  tenantId: string;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
}
