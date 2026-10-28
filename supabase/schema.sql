-- =====================================================================
-- STCK Company — schema do Supabase
-- Cole TUDO no SQL Editor e clique em Run. Pode rodar quantas vezes quiser:
-- só cria/ajusta o que estiver faltando e funciona com tabelas antigas.
-- =====================================================================


-- =====================================================================
-- 1. TABELAS E COLUNAS
-- =====================================================================

-- Lojas
create table if not exists public.tenants (
  id text primary key,
  name text not null
);
alter table public.tenants add column if not exists created_at          timestamptz default now();
alter table public.tenants add column if not exists owner_id            uuid;
alter table public.tenants add column if not exists about               text;
alter table public.tenants add column if not exists whatsapp            text;
alter table public.tenants add column if not exists color               text default '#f59e0b';
alter table public.tenants add column if not exists pix_key             text;
alter table public.tenants add column if not exists plan                text default 'PRO';
alter table public.tenants add column if not exists subscription_status text default 'active';
alter table public.tenants add column if not exists shipping_local      numeric(10,2) default 10;
alter table public.tenants add column if not exists shipping_far        numeric(10,2) default 18;
alter table public.tenants add column if not exists city                text;
alter table public.tenants add column if not exists state               text;
alter table public.tenants add column if not exists pickup_enabled      boolean default false;
alter table public.tenants add column if not exists pickup_address      text;
alter table public.tenants add column if not exists ship_nationwide     boolean default true;
alter table public.tenants add column if not exists shipping_national   numeric(10,2);
alter table public.tenants add column if not exists free_shipping_min   numeric(10,2);
-- Personalização da vitrine (tema, banner, seções, horário, pagamentos, bairros)
alter table public.tenants add column if not exists custom              jsonb default '{}'::jsonb;

-- Perfis (liga o usuário do Auth à loja)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'STORE_OWNER'
);
alter table public.profiles add column if not exists tenant_id text;

-- Produtos
create table if not exists public.products (
  id text primary key,
  tenant_id text not null,
  name text not null,
  price numeric(10,2) not null default 0
);
alter table public.products add column if not exists description text;
alter table public.products add column if not exists stock       integer default 0;
alter table public.products add column if not exists image       text;
alter table public.products add column if not exists category    text default 'Geral';
alter table public.products add column if not exists created_at  timestamptz default now();
alter table public.products add column if not exists variants      text;
alter table public.products add column if not exists compare_price numeric(10,2);
alter table public.products add column if not exists featured      boolean default false;

-- Pedidos
create table if not exists public.orders (
  id text primary key,
  tenant_id text not null,
  customer text not null,
  total numeric(10,2) not null default 0
);
alter table public.orders add column if not exists whatsapp   text;
alter table public.orders add column if not exists address    text;
alter table public.orders add column if not exists payment    text;
alter table public.orders add column if not exists status     text default 'Aguardando Pagamento';
alter table public.orders add column if not exists date       text;
alter table public.orders add column if not exists items      jsonb default '[]'::jsonb;
alter table public.orders add column if not exists shipping   numeric(10,2) default 0;
alter table public.orders add column if not exists discount   numeric(10,2) default 0;
alter table public.orders add column if not exists coupon     text;
alter table public.orders add column if not exists created_at timestamptz default now();

-- Cupons
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  code text not null,
  discount numeric(5,2) not null default 0
);
alter table public.coupons add column if not exists created_at timestamptz default now();

-- Avaliações
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  product_id text not null,
  name text not null,
  comment text not null,
  rating smallint not null default 5
);
alter table public.reviews add column if not exists created_at timestamptz default now();

-- Índices
create index if not exists products_tenant_idx on public.products (tenant_id);
create index if not exists orders_tenant_idx   on public.orders (tenant_id);
create index if not exists coupons_tenant_idx  on public.coupons (tenant_id);
create index if not exists reviews_product_idx on public.reviews (product_id);


-- =====================================================================
-- 2. FUNÇÕES
-- =====================================================================

-- Usuário logado é Super Admin?
create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role::text = 'SUPER_ADMIN');
$$;

-- Loja do usuário logado
create or replace function public.my_tenant_id()
returns text language sql stable security definer set search_path = public as $$
  select tenant_id::text from profiles where id = auth.uid();
$$;

-- Cria a loja e o perfil automaticamente quando um lojista se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'store_name'), ''), 'Minha Loja');
  v_base text := coalesce(nullif(new.raw_user_meta_data ->> 'tenant_id', ''), 'loja');
  v_id   text := v_base;
  v_n    int  := 1;
begin
  while exists (select 1 from tenants where id::text = v_id) loop
    v_n  := v_n + 1;
    v_id := v_base || '-' || v_n;
  end loop;

  insert into tenants (id, name, owner_id, about)
  values (v_id, v_name, new.id, 'Bem-vindo à nossa loja!');

  insert into profiles (id, role, tenant_id)
  values (new.id, 'STORE_OWNER', v_id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lojista não pode alterar o próprio plano / status da assinatura
create or replace function public.protect_tenant_billing()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_super_admin() then
    new.plan                := old.plan;
    new.subscription_status := old.subscription_status;
    new.owner_id            := old.owner_id;
  end if;
  return new;
end;
$$;

drop trigger if exists tenants_protect_billing on public.tenants;
create trigger tenants_protect_billing
  before update on public.tenants
  for each row execute function public.protect_tenant_billing();

-- Rastreio público: devolve só status/total/data, sem dados do cliente
drop function if exists public.track_order(text, text);
create function public.track_order(p_tenant_id text, p_code text)
returns table (id text, status text, total numeric, date text)
language sql stable security definer set search_path = public as $$
  select o.id::text, o.status::text, o.total::numeric, o.date::text
  from orders o
  where o.tenant_id::text = p_tenant_id
    and upper(o.id::text) = upper(trim(p_code))
  limit 1;
$$;
grant execute on function public.track_order(text, text) to anon, authenticated;


-- =====================================================================
-- 3. SEGURANÇA (RLS)
-- Remove políticas antigas dessas tabelas e recria do zero.
-- =====================================================================
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('tenants', 'profiles', 'products', 'orders', 'coupons', 'reviews')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.tenants  enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders   enable row level security;
alter table public.coupons  enable row level security;
alter table public.reviews  enable row level security;

-- Lojas: vitrine lê; dono edita a própria; Super Admin edita/apaga qualquer uma
create policy tenants_read on public.tenants
  for select using (true);
create policy tenants_owner_update on public.tenants
  for update using (id::text = public.my_tenant_id() or public.is_super_admin())
  with check (id::text = public.my_tenant_id() or public.is_super_admin());
create policy tenants_admin_delete on public.tenants
  for delete using (public.is_super_admin());

-- Perfis: cada um lê o seu; Super Admin lê todos
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_super_admin());

-- Produtos: leitura pública; só o dono da loja altera
create policy products_read on public.products
  for select using (true);
create policy products_owner_write on public.products
  for all using (tenant_id::text = public.my_tenant_id() or public.is_super_admin())
  with check (tenant_id::text = public.my_tenant_id() or public.is_super_admin());

-- Pedidos: qualquer visitante cria; só o dono vê e altera
create policy orders_public_insert on public.orders
  for insert with check (status::text = 'Aguardando Pagamento');
create policy orders_owner_read on public.orders
  for select using (tenant_id::text = public.my_tenant_id() or public.is_super_admin());
create policy orders_owner_update on public.orders
  for update using (tenant_id::text = public.my_tenant_id() or public.is_super_admin());
create policy orders_owner_delete on public.orders
  for delete using (tenant_id::text = public.my_tenant_id() or public.is_super_admin());

-- Cupons: vitrine lê para validar; só o dono gerencia
create policy coupons_read on public.coupons
  for select using (true);
create policy coupons_owner_write on public.coupons
  for all using (tenant_id::text = public.my_tenant_id() or public.is_super_admin())
  with check (tenant_id::text = public.my_tenant_id() or public.is_super_admin());

-- Avaliações: leitura e envio públicos (com limites); dono pode apagar
create policy reviews_read on public.reviews
  for select using (true);
create policy reviews_public_insert on public.reviews
  for insert with check (
    rating between 1 and 5
    and char_length(name) between 1 and 60
    and char_length(comment) between 1 and 500
  );
create policy reviews_owner_delete on public.reviews
  for delete using (tenant_id::text = public.my_tenant_id() or public.is_super_admin());


-- =====================================================================
-- 4. SUPER ADMIN (rode separado, DEPOIS de criar sua conta no site)
-- update public.profiles set role = 'SUPER_ADMIN'
--   where id = (select id from auth.users where email = 'seu@email.com');
-- =====================================================================
