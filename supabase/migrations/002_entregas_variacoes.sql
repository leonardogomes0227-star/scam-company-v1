-- Atualização: entregas (cidade, envio para todo o Brasil, retirada, frete grátis)
-- e produtos com tamanhos/cores e preço promocional. Pode rodar mais de uma vez.
alter table public.tenants add column if not exists city              text;
alter table public.tenants add column if not exists state             text;
alter table public.tenants add column if not exists pickup_enabled    boolean default false;
alter table public.tenants add column if not exists pickup_address    text;
alter table public.tenants add column if not exists ship_nationwide   boolean default true;
alter table public.tenants add column if not exists shipping_national numeric(10,2);
alter table public.tenants add column if not exists free_shipping_min numeric(10,2);

alter table public.products add column if not exists variants      text;
alter table public.products add column if not exists compare_price numeric(10,2);

-- Recarrega o cache de colunas da API
notify pgrst, 'reload schema';
