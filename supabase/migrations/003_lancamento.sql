-- =====================================================================
-- Atualização de lançamento. Pode rodar mais de uma vez.
-- 1) Armazenamento de fotos dos produtos (Supabase Storage)
-- 2) Conferência de preços dos pedidos no próprio banco
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Bucket público de fotos: cada loja só grava na própria pasta
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists stck_images_read on storage.objects;
create policy stck_images_read on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists stck_images_insert on storage.objects;
create policy stck_images_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = public.my_tenant_id());

drop policy if exists stck_images_update on storage.objects;
create policy stck_images_update on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = public.my_tenant_id());

drop policy if exists stck_images_delete on storage.objects;
create policy stck_images_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = public.my_tenant_id());

-- ---------------------------------------------------------------------
-- 2) Pedidos: o banco usa SEMPRE o preço cadastrado do produto e o
--    desconto real do cupom. Quem alterar o preço no navegador não
--    consegue registrar um pedido mais barato.
-- ---------------------------------------------------------------------
create or replace function public.validate_order()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_item     jsonb;
  v_items    jsonb := '[]'::jsonb;
  v_price    numeric;
  v_qty      int;
  v_subtotal numeric := 0;
  v_pct      numeric;
  v_discount numeric := 0;
begin
  if new.items is null or jsonb_typeof(new.items) <> 'array' or jsonb_array_length(new.items) = 0 then
    raise exception 'Pedido sem itens';
  end if;

  for v_item in select * from jsonb_array_elements(new.items) loop
    select p.price into v_price
    from products p
    where p.id::text = v_item ->> 'id' and p.tenant_id::text = new.tenant_id::text;

    if v_price is null then
      raise exception 'Produto indisponível: %', coalesce(v_item ->> 'name', v_item ->> 'id');
    end if;

    v_qty := greatest(1, least(999, coalesce((v_item ->> 'quantity')::int, 1)));
    v_subtotal := v_subtotal + v_price * v_qty;
    v_items := v_items || jsonb_build_array(v_item || jsonb_build_object('price', v_price, 'quantity', v_qty));
  end loop;

  if new.coupon is not null and new.coupon <> '' then
    select c.discount into v_pct
    from coupons c
    where c.tenant_id::text = new.tenant_id::text and upper(c.code) = upper(new.coupon);
    if v_pct is null then
      new.coupon := null;
    else
      v_discount := round(v_subtotal * v_pct) / 100;
    end if;
  end if;

  new.items    := v_items;
  new.discount := v_discount;
  new.shipping := greatest(coalesce(new.shipping, 0), 0);
  new.total    := greatest(v_subtotal - v_discount, 0) + new.shipping;
  new.status   := 'Aguardando Pagamento';
  return new;
end;
$$;

drop trigger if exists orders_validate on public.orders;
create trigger orders_validate
  before insert on public.orders
  for each row execute function public.validate_order();

notify pgrst, 'reload schema';
