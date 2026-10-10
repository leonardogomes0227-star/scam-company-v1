-- =====================================================================
-- STCK Company — schema do Supabase
-- Rode este arquivo inteiro no SQL Editor do Supabase. Ele é idempotente:
-- pode ser executado mais de uma vez e só cria/ajusta o que estiver faltando.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------
create table if not exists public.tenants (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);
alter table public.tenants add column if not exists owner_id uuid references auth.users (id) on delete set null;
alter table public.tenants add column if not exists about text;
alter table public.tenants add column if not exists whatsapp text;
alter table public.tenants add column if not exists color text default '#f59e0b';
alter table public.tenants add column if not exists pix_key text;
alter table public.tenants add column if not exists plan text not null default 'PRO';
alter table public.tenants add column if not exists subscription_status text not null default 'active';
alter table public.tenants add column if not exists shipping_local numeric(10,2) not null default 10;
alter table public.tenants add column if not exists shipping_far numeric(10,2) not null default 18;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'STORE_OWNER' check (role in ('SUPER_ADMIN', 'STORE_OWNER')),
  tenant_id text references public.tenants (id) on delete set null
);

create table if not exists public.products (
  id text primary key,
  tenant_id text not null references public.tenants (id) on delete cascade,
  name text not null,
  price numeric(10,2) not null default 0
);
alter table public.products add column if not exists description text;
alter table public.products add column if not exists stock integer not null default 0;
alter table public.products add column if not exists image text;
alter table public.products add column if not exists category text default 'Geral';
alter table public.products add column if not exists created_at timestamptz not null default now();

create table if not exists public.orders (
  id text primary key,
  tenant_id text not null references public.tenants (id) on delete cascade,
  customer text not null,
  total numeric(10,2) not null default 0
);
alter table public.orders add column if not exists whatsapp text;
alter table public.orders add column if not exists address text;
alter table public.orders add column if not exists payment text;
alter table public.orders add column if not exists status text not null default 'Aguardando Pagamento';
alter table public.orders add column if not exists date date not null default current_date;
alter table public.orders add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.orders add column if not exists shipping numeric(10,2) not null default 0;
alter table public.orders add column if not exists discount numeric(10,2) not null default 0;
alter table public.orders add column if not exists coupon text;
alter table public.orders add column if not exists created_at timestamptz not null default now();

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants (id) on delete cascade,
  code text not null,
  discount numeric(5,2) not null check (discount > 0 and discount <= 100),
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  comment text not null check (char_length(comment) between 1 and 500),
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists products_tenant_idx on public.products (tenant_id);
create index if not exists orders_tenant_idx on public.orders (tenant_id);
create index if not exists coupons_tenant_idx on public.coupons (tenant_id);
create index if not exists reviews_product_idx on public.reviews (product_id);

-- ---------------------------------------------------------------------
-- Funções auxiliares
-- ---------------------------------------------------------------------
create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'SUPER_ADMIN');
$$;

create or replace function public.my_tenant_id()
returns text language sql stable security definer set search_path = public as $$
  select tenant_id from profiles where id = auth.uid();
$$;

-- Cria a loja e o perfil automaticamente quando um lojista se cadastra.
-- O front envia store_name e tenant_id em options.data do signUp.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'store_name'), ''), 'Minha Loja');
  v_base text := coalesce(nullif(new.raw_user_meta_data ->> 'tenant_id', ''), 'loja');
  v_id text := v_base;
  v_n int := 1;
begin
  while exists (select 1 from tenants where id = v_id) loop
    v_n := v_n + 1;
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

-- Rastreio público: devolve só o necessário, sem expor dados do cliente.
create or replace function public.track_order(p_tenant_id text, p_code text)
returns table (id text, status text, total numeric, date date)
language sql stable security definer set search_path = public as $$
  select o.id, o.status, o.total, o.date
  from orders o
  where o.tenant_id = p_tenant_id and upper(o.id) = upper(trim(p_code))
  limit 1;
$$;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.coupons enable row level security;
alter table public.reviews enable row level security;

-- tenants: vitrine pública lê; dono edita a própria loja; super admin tudo
drop policy if exists tenants_read on public.tenants;
create policy tenants_read on public.tenants for select using (true);
drop policy if exists tenants_owner_update on public.tenants;
create policy tenants_owner_update on public.tenants for update
  using (id = public.my_tenant_id() or public.is_super_admin())
  with check (id = public.my_tenant_id() or public.is_super_admin());

drop policy if exists tenants_admin_delete on public.tenants;
create policy tenants_admin_delete on public.tenants for delete using (public.is_super_admin());

-- Lojista não pode mudar o próprio plano/status de assinatura
create or replace function public.protect_tenant_billing()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_super_admin() then
    new.plan := old.plan;
    new.subscription_status := old.subscription_status;
    new.owner_id := old.owner_id;
  end if;
  return new;
end;
$$;
drop trigger if exists tenants_protect_billing on public.tenants;
create trigger tenants_protect_billing before update on public.tenants
  for each row execute function public.protect_tenant_billing();

-- profiles: cada um lê o próprio; super admin lê todos
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select
  using (id = auth.uid() or public.is_super_admin());

-- products: leitura pública; escrita só do dono da loja
drop policy if exists products_read on public.products;
create policy products_read on public.products for select using (true);
drop policy if exists products_owner_write on public.products;
create policy products_owner_write on public.products for all
  using (tenant_id = public.my_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.my_tenant_id() or public.is_super_admin());

-- orders: qualquer visitante cria pedido; só o dono lê/atualiza
drop policy if exists orders_public_insert on public.orders;
create policy orders_public_insert on public.orders for insert
  with check (status = 'Aguardando Pagamento');
drop policy if exists orders_owner_read on public.orders;
create policy orders_owner_read on public.orders for select
  using (tenant_id = public.my_tenant_id() or public.is_super_admin());
drop policy if exists orders_owner_update on public.orders;
create policy orders_owner_update on public.orders for update
  using (tenant_id = public.my_tenant_id() or public.is_super_admin());
drop policy if exists orders_owner_delete on public.orders;
create policy orders_owner_delete on public.orders for delete
  using (tenant_id = public.my_tenant_id() or public.is_super_admin());

-- coupons: vitrine valida os cupons da loja; dono gerencia
drop policy if exists coupons_read on public.coupons;
create policy coupons_read on public.coupons for select using (true);
drop policy if exists coupons_owner_write on public.coupons;
create policy coupons_owner_write on public.coupons for all
  using (tenant_id = public.my_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.my_tenant_id() or public.is_super_admin());

-- reviews: leitura e criação públicas; dono pode apagar
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select using (true);
drop policy if exists reviews_public_insert on public.reviews;
create policy reviews_public_insert on public.reviews for insert with check (true);
drop policy if exists reviews_owner_delete on public.reviews;
create policy reviews_owner_delete on public.reviews for delete
  using (tenant_id = public.my_tenant_id() or public.is_super_admin());

-- ---------------------------------------------------------------------
-- Para tornar um usuário Super Admin (troque o e-mail):
-- update public.profiles set role = 'SUPER_ADMIN'
--   where id = (select id from auth.users where email = 'voce@exemplo.com');
-- ---------------------------------------------------------------------
