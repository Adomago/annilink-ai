-- AniLink AI MVP schema: profiles, listings, orders, ai_chat_logs

create extension if not exists "pgcrypto";

create type public.app_role as enum ('farmer', 'buyer', 'admin');
create type public.listing_status as enum ('active', 'sold_out', 'archived');
create type public.listing_moderation_status as enum ('pending', 'approved', 'rejected');
create type public.order_status as enum ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null,
  full_name text not null,
  phone text,
  location text,
  farm_name text,
  business_name text,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  vegetable text not null,
  quantity_kg numeric(10,2) not null check (quantity_kg > 0),
  available_quantity_kg numeric(10,2) not null check (available_quantity_kg >= 0),
  price_per_kg numeric(10,2) not null check (price_per_kg > 0),
  unit text not null default 'kg',
  location text not null,
  harvest_date date not null,
  image_url text,
  image_path text,
  status public.listing_status not null default 'active',
  moderation_status public.listing_moderation_status not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  farmer_id uuid not null references public.profiles(id) on delete restrict,
  quantity_kg numeric(10,2) not null check (quantity_kg > 0),
  price_per_kg numeric(10,2) not null check (price_per_kg > 0),
  total_price numeric(12,2) not null check (total_price > 0),
  delivery_date date not null,
  notes text,
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  feature text not null,
  prompt text not null,
  response text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_listings_farmer_id on public.listings(farmer_id);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_orders_farmer_id on public.orders(farmer_id);
create index if not exists idx_orders_buyer_id on public.orders(buyer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_ai_chat_logs_user_id on public.ai_chat_logs(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_listings_updated_at on public.listings;
create trigger set_listings_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.process_order_status_change(
  p_order_id uuid,
  p_new_status public.order_status,
  p_actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_actor_role public.app_role;
  v_next_qty numeric(10,2);
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  select role into v_actor_role from public.profiles where id = p_actor_id;

  if v_actor_role is null then
    raise exception 'Actor profile not found';
  end if;

  if v_actor_role = 'admin' then
    null;
  elsif v_actor_role = 'farmer' then
    if v_order.farmer_id <> p_actor_id then
      raise exception 'Farmer cannot modify this order';
    end if;
  elsif v_actor_role = 'buyer' then
    if v_order.buyer_id <> p_actor_id then
      raise exception 'Buyer cannot modify this order';
    end if;
  end if;

  if v_order.status in ('rejected', 'completed', 'cancelled') then
    raise exception 'Finalized orders cannot be changed';
  end if;

  if p_new_status = 'accepted' and v_order.status <> 'pending' then
    raise exception 'Only pending orders can be accepted';
  end if;

  if p_new_status = 'rejected' and v_order.status <> 'pending' then
    raise exception 'Only pending orders can be rejected';
  end if;

  if p_new_status = 'completed' and v_order.status <> 'accepted' then
    raise exception 'Only accepted orders can be completed';
  end if;

  if p_new_status = 'cancelled' and v_order.status not in ('pending', 'accepted') then
    raise exception 'Only pending or accepted orders can be cancelled';
  end if;

  if p_new_status = 'accepted' then
    select available_quantity_kg - v_order.quantity_kg
      into v_next_qty
    from public.listings
    where id = v_order.listing_id
    for update;

    if v_next_qty is null then
      raise exception 'Listing not found';
    end if;

    if v_next_qty < 0 then
      raise exception 'Insufficient stock';
    end if;

    update public.listings
    set available_quantity_kg = v_next_qty,
        status = case when v_next_qty = 0 then 'sold_out' else status end
    where id = v_order.listing_id;
  end if;

  update public.orders
  set status = p_new_status,
      updated_at = now()
  where id = p_order_id;
end;
$$;

revoke all on function public.process_order_status_change(uuid, public.order_status, uuid) from public;
grant execute on function public.process_order_status_change(uuid, public.order_status, uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.orders enable row level security;
alter table public.ai_chat_logs enable row level security;

create policy "profiles_self_or_admin_select" on public.profiles
for select to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "profiles_self_update" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_insert_self" on public.profiles
for insert to authenticated
with check (id = auth.uid());

create policy "admin_manage_profiles" on public.profiles
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "farmers_manage_own_listings" on public.listings
for all to authenticated
using (farmer_id = auth.uid() and public.current_user_role() = 'farmer')
with check (farmer_id = auth.uid() and public.current_user_role() = 'farmer');

create policy "buyers_view_active_listings" on public.listings
for select to authenticated
using (
  public.current_user_role() = 'buyer'
  and status = 'active'
  and moderation_status = 'approved'
);

create policy "admins_manage_all_listings" on public.listings
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "buyers_create_orders" on public.orders
for insert to authenticated
with check (
  buyer_id = auth.uid()
  and public.current_user_role() = 'buyer'
);

create policy "buyers_view_own_orders" on public.orders
for select to authenticated
using (buyer_id = auth.uid() and public.current_user_role() = 'buyer');

create policy "farmers_view_own_orders" on public.orders
for select to authenticated
using (farmer_id = auth.uid() and public.current_user_role() = 'farmer');

create policy "admins_view_all_orders" on public.orders
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "users_insert_ai_logs" on public.ai_chat_logs
for insert to authenticated
with check (user_id = auth.uid());

create policy "users_view_own_ai_logs" on public.ai_chat_logs
for select to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin');

-- Storage bucket for listing images
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "listing_images_farmer_upload" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'listing-images'
  and owner = auth.uid()
  and public.current_user_role() = 'farmer'
);

create policy "listing_images_public_read" on storage.objects
for select to authenticated
using (bucket_id = 'listing-images');

create policy "listing_images_farmer_update" on storage.objects
for update to authenticated
using (bucket_id = 'listing-images' and owner = auth.uid())
with check (bucket_id = 'listing-images' and owner = auth.uid());

create policy "listing_images_farmer_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'listing-images' and owner = auth.uid());
