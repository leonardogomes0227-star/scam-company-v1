import type { Tenant } from '../types';
import { sameCity } from './cep';

export type DeliveryId = 'pickup' | 'local' | 'far' | 'national';

export interface DeliveryOption {
  id: DeliveryId;
  title: string;
  description: string;
  /** null = frete a combinar com a loja pelo WhatsApp */
  fee: number | null;
  /** Formas de pagamento aceitas nesta modalidade */
  payments: string[];
}

export interface ShippingConfig {
  city: string;
  state: string;
  shippingLocal: number;
  shippingFar: number;
  pickupEnabled: boolean;
  pickupAddress: string;
  shipNationwide: boolean;
  shippingNational: number | null;
  freeShippingMin: number | null;
}

const num = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null);

export function shippingConfig(t: Tenant | null | undefined): ShippingConfig {
  return {
    city: t?.city?.trim() || '',
    state: t?.state?.trim() || '',
    shippingLocal: num(t?.shipping_local) ?? 10,
    shippingFar: num(t?.shipping_far) ?? 18,
    pickupEnabled: t?.pickup_enabled ?? false,
    pickupAddress: t?.pickup_address?.trim() || '',
    shipNationwide: t?.ship_nationwide ?? true,
    shippingNational: num(t?.shipping_national),
    freeShippingMin: num(t?.free_shipping_min),
  };
}

/**
 * Monta as opções de entrega para o endereço do cliente.
 * - Mesma cidade da loja (ou loja sem cidade configurada): entrega local.
 * - Outra cidade: envio (Correios/transportadora), com valor fixo ou a combinar.
 * - Retirada na loja sempre que estiver habilitada.
 */
export function deliveryOptions(cfg: ShippingConfig, customerCity: string, customerState: string, subtotal: number): DeliveryOption[] {
  const knownCustomer = !!customerCity.trim();
  const storeCityKnown = !!cfg.city;
  const isLocal = !storeCityKnown || !knownCustomer || (sameCity(cfg.city, customerCity) && (!cfg.state || !customerState || cfg.state.toUpperCase() === customerState.toUpperCase()));
  const free = cfg.freeShippingMin != null && cfg.freeShippingMin > 0 && subtotal >= cfg.freeShippingMin;
  const apply = (fee: number | null) => (fee == null ? null : free ? 0 : fee);

  const options: DeliveryOption[] = [];
  if (cfg.pickupEnabled) {
    options.push({
      id: 'pickup',
      title: 'Retirar na loja',
      description: cfg.pickupAddress || 'Combine o horário pelo WhatsApp',
      fee: 0,
      payments: ['Pix', 'Cartão', 'Dinheiro'],
    });
  }
  if (isLocal) {
    const where = cfg.city ? ` em ${cfg.city}` : '';
    options.push({ id: 'local', title: `Entrega${where} — centro`, description: 'Entrega rápida na região central', fee: apply(cfg.shippingLocal), payments: ['Pix', 'Cartão', 'Dinheiro'] });
    options.push({ id: 'far', title: `Entrega${where} — bairros afastados`, description: 'Demais bairros da cidade', fee: apply(cfg.shippingFar), payments: ['Pix', 'Cartão', 'Dinheiro'] });
  }
  if ((!isLocal || !storeCityKnown) && cfg.shipNationwide) {
    options.push({
      id: 'national',
      title: 'Envio para sua cidade',
      description: cfg.shippingNational == null ? 'Correios/transportadora — a loja informa o frete no WhatsApp' : 'Correios/transportadora',
      fee: apply(cfg.shippingNational),
      payments: ['Pix', 'Cartão'],
    });
  }
  return options;
}

export const PAYMENT_HINTS: Record<string, Record<DeliveryId, string>> = {
  Pix: { pickup: 'Código na hora', local: 'Código na hora', far: 'Código na hora', national: 'Código na hora' },
  Cartão: { pickup: 'Na retirada', local: 'Na entrega', far: 'Na entrega', national: 'Link de pagamento' },
  Dinheiro: { pickup: 'Na retirada', local: 'Na entrega', far: 'Na entrega', national: '' },
};
