-- Whattoeat — schema + RLS + bootstrap on signup
-- Run in Supabase SQL Editor (Dashboard → SQL → New query).

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

-- Households (shared menu space)
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at date not null default (timezone('utc', now()))::date,
  primary key (household_id, user_id)
);

create index if not exists household_members_user_id_idx on public.household_members (user_id);

-- Recipes (belong to household)
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  image_url text not null default '',
  prep_time text not null default '',
  servings int,
  tags jsonb not null default '[]'::jsonb,
  is_favorite boolean not null default false,
  source jsonb,
  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_household_id_idx on public.recipes (household_id);

-- Week plan (one row per household)
create table if not exists public.week_plans (
  household_id uuid primary key references public.households (id) on delete cascade,
  days jsonb not null,
  total_meals int not null default 10,
  updated_at timestamptz not null default now()
);

-- Shopping items
create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  quantity text not null default '',
  category text not null,
  is_checked boolean not null default false,
  is_custom boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists shopping_items_household_id_idx on public.shopping_items (household_id);

-- Helpers
create or replace function public.is_household_member(hid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = hid and m.user_id = auth.uid()
  );
$$;

create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  code text;
begin
  loop
    code := 'WTE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    exit when not exists (select 1 from public.households h where h.invite_code = code);
  end loop;
  return code;
end;
$$;

create or replace function public.empty_week_days()
returns jsonb
language sql
immutable
as $$
  select '[
    {"dayName":"Lunes","shortName":"Lun","slots":[{"type":"Almuerzo"},{"type":"Cena"}]},
    {"dayName":"Martes","shortName":"Mar","slots":[{"type":"Almuerzo"},{"type":"Cena"}]},
    {"dayName":"Miércoles","shortName":"Mié","slots":[{"type":"Almuerzo"},{"type":"Cena"}]},
    {"dayName":"Jueves","shortName":"Jue","slots":[{"type":"Almuerzo"},{"type":"Cena"}]},
    {"dayName":"Viernes","shortName":"Vie","slots":[{"type":"Almuerzo"},{"type":"Cena"}]}
  ]'::jsonb;
$$;

-- Bootstrap profile + personal household on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  hid uuid;
  menu_name text;
begin
  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, 'Usuario'), '@', 1)
  );
  menu_name := 'Menú de ' || display_name;

  insert into public.profiles (id, name, email)
  values (new.id, display_name, new.email);

  insert into public.households (name, invite_code)
  values (menu_name, public.generate_invite_code())
  returning id into hid;

  insert into public.household_members (household_id, user_id, role)
  values (hid, new.id, 'owner');

  insert into public.week_plans (household_id, days, total_meals)
  values (hid, public.empty_week_days(), 10);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Join by invite code (moves user to that household; one membership)
create or replace function public.join_household_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  hid uuid;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No autenticado';
  end if;

  select h.id into hid
  from public.households h
  where upper(trim(h.invite_code)) = upper(trim(p_code));

  if hid is null then
    raise exception 'Código inválido';
  end if;

  if exists (
    select 1 from public.household_members m
    where m.household_id = hid and m.user_id = uid
  ) then
    return hid;
  end if;

  -- Leave other households (MVP: un solo menú activo)
  delete from public.household_members where user_id = uid;

  insert into public.household_members (household_id, user_id, role)
  values (hid, uid, 'member');

  return hid;
end;
$$;

grant execute on function public.join_household_by_code(text) to authenticated;

-- Remove a member from the caller's household. Any housemate can remove another
-- (no owner/admin distinction in product). Restores a personal household for the
-- removed user so they are not left without a menu.
create or replace function public.remove_household_member(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  hid uuid;
  removed_name text;
  new_hid uuid;
begin
  if uid is null then
    raise exception 'No autenticado';
  end if;

  if p_user_id = uid then
    raise exception 'No podés eliminarte a vos mismo';
  end if;

  select m.household_id
  into hid
  from public.household_members m
  where m.user_id = uid
  limit 1;

  if hid is null then
    raise exception 'No tenés un menú activo';
  end if;

  if not exists (
    select 1
    from public.household_members m
    where m.household_id = hid
      and m.user_id = p_user_id
  ) then
    raise exception 'Esa persona no está en tu menú';
  end if;

  delete from public.household_members
  where household_id = hid
    and user_id = p_user_id;

  -- Recreate a personal household if they no longer belong anywhere
  if not exists (
    select 1 from public.household_members m where m.user_id = p_user_id
  ) then
    select coalesce(nullif(trim(p.name), ''), 'Usuario')
    into removed_name
    from public.profiles p
    where p.id = p_user_id;

    insert into public.households (name, invite_code)
    values ('Menú de ' || coalesce(removed_name, 'Usuario'), public.generate_invite_code())
    returning id into new_hid;

    insert into public.household_members (household_id, user_id, role)
    values (new_hid, p_user_id, 'owner');

    insert into public.week_plans (household_id, days, total_meals)
    values (new_hid, public.empty_week_days(), 10);
  end if;
end;
$$;

grant execute on function public.remove_household_member(uuid) to authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.recipes enable row level security;
alter table public.week_plans enable row level security;
alter table public.shopping_items enable row level security;

-- Profiles
drop policy if exists "profiles_select_self_or_housemates" on public.profiles;
create policy "profiles_select_self_or_housemates"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.household_members me
      join public.household_members them on them.household_id = me.household_id
      where me.user_id = auth.uid() and them.user_id = profiles.id
    )
  );

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Households
drop policy if exists "households_select_member" on public.households;
create policy "households_select_member"
  on public.households for select to authenticated
  using (public.is_household_member(id));

drop policy if exists "households_update_member" on public.households;
create policy "households_update_member"
  on public.households for update to authenticated
  using (public.is_household_member(id))
  with check (public.is_household_member(id));

-- Members
drop policy if exists "members_select" on public.household_members;
create policy "members_select"
  on public.household_members for select to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "members_delete_owner_or_self" on public.household_members;
drop policy if exists "members_delete_housemate_or_self" on public.household_members;
create policy "members_delete_housemate_or_self"
  on public.household_members for delete to authenticated
  using (
    user_id = auth.uid()
    or public.is_household_member(household_id)
  );

-- Recipes
drop policy if exists "recipes_all_member" on public.recipes;
create policy "recipes_all_member"
  on public.recipes for all to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- Week plans
drop policy if exists "week_plans_all_member" on public.week_plans;
create policy "week_plans_all_member"
  on public.week_plans for all to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- Shopping
drop policy if exists "shopping_all_member" on public.shopping_items;
create policy "shopping_all_member"
  on public.shopping_items for all to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));
