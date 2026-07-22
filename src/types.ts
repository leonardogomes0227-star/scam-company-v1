export interface Product {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  image: string;
  category: string;
  variants?: string[];
  active?: boolean;
  description?: string;
}

export interface StoreConfig {
  name: string;
  about: string;
  whatsapp: string;
  pixKey: string;
  bannerUrl?: string;
  logoUrl?: string;
  fixedFreight?: number;
  freeFreightThreshold?: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
}

export interface Order {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

export interface Testimonial {
  id: string;
  name: string;
  stars: number;
  comment: string;
}
