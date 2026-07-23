export type UserRole = 'SUPER_ADMIN' | 'STORE_OWNER' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string; // Vazio para SUPER_ADMIN, obrigatório para LOJISTA e CLIENTE
}

export interface StoreTenant {
  id: string; // Ex: 'lkd-imports', 'carbura-ms'
  name: string;
  ownerEmail: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  active: boolean;
  createdAt: string;
  config: {
    whatsapp: string;
    pixKey: string;
    fixedFreight: number;
    freeFreightThreshold: number;
    primaryColor?: string;
    logoUrl?: string;
  };
}

export interface MultiTenantProduct {
  id: string;
  tenantId: string; // Garantia de isolamento
  name: string;
  price: number;
  promoPrice?: number;
  category: string;
  image: string;
  variants?: string[];
  stock: number;
}

export interface MultiTenantOrder {
  id: string;
  tenantId: string;
  customerId?: string;
  customerName: string;
  total: number;
  status: 'Pendente' | 'Pago' | 'Enviado' | 'Cancelado';
  date: string;
  items: any[];
}
