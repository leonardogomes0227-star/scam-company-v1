import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../supabaseClient';
import type { Coupon, Order, Product, Tenant } from '../../types';

export interface StoreData {
  loading: boolean;
  error: string | null;
  tenant: Tenant | null;
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  setTenant: React.Dispatch<React.SetStateAction<Tenant | null>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  reload: () => Promise<void>;
  /** Busca só os pedidos de novo; devolve quantos pedidos novos chegaram. */
  refreshOrders: () => Promise<number>;
}

/** Carrega e mantém em memória todos os dados da loja do lojista logado. */
export function useStoreData(tenantId: string): StoreData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const ordersRef = useRef<Order[]>([]);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  const normalizeOrders = (rows: Order[] | null) =>
    (rows || []).map((o) => ({
      ...o,
      total: Number(o.total) || 0,
      shipping: o.shipping == null ? null : Number(o.shipping),
      discount: o.discount == null ? null : Number(o.discount),
      items: Array.isArray(o.items) ? o.items : [],
    }));

  const reload = useCallback(async () => {
    const [tenantRes, productsRes, ordersRes, couponsRes] = await Promise.all([
      supabase.from('tenants').select('*').eq('id', tenantId).maybeSingle(),
      supabase.from('products').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
      supabase.from('orders').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
      supabase.from('coupons').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    ]);

    setTenant((tenantRes.data as Tenant) ?? null);
    setProducts(((productsRes.data as Product[]) || []).map((p) => ({ ...p, price: Number(p.price), stock: Number(p.stock) || 0 })));
    setOrders(normalizeOrders(ordersRes.data as Order[]));
    setCoupons(((couponsRes.data as Coupon[]) || []).map((c) => ({ ...c, discount: Number(c.discount) })));

    const failed = [tenantRes, productsRes, ordersRes, couponsRes].find((r) => r.error);
    setError(failed?.error ? failed.error.message : null);
  }, [tenantId]);

  const refreshOrders = useCallback(async () => {
    const { data, error } = await supabase.from('orders').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
    if (error || !data) return 0;
    const fresh = normalizeOrders(data as Order[]);
    const known = new Set(ordersRef.current.map((o) => o.id));
    const added = fresh.filter((o) => !known.has(o.id)).length;
    setOrders(fresh);
    return added;
  }, [tenantId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    reload().finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reload]);

  return { loading, error, tenant, products, orders, coupons, setTenant, setProducts, setOrders, setCoupons, reload, refreshOrders };
}

/** Data do pedido como YYYY-MM-DD, aceitando `date` em texto ou o `created_at`. */
export function orderDay(order: Order): string {
  return (order.date || order.created_at || '').slice(0, 10);
}

export const PAID_STATUSES = ['Pago / Separando', 'Enviado / A Caminho', 'Entregue com Sucesso'];

export const STATUS_TONE: Record<string, 'amber' | 'blue' | 'violet' | 'green' | 'red' | 'neutral'> = {
  'Aguardando Pagamento': 'amber',
  'Pago / Separando': 'blue',
  'Enviado / A Caminho': 'violet',
  'Entregue com Sucesso': 'green',
  Cancelado: 'red',
};
