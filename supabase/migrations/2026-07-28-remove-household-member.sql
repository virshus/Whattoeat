-- Run this in Supabase → SQL Editor (fixes:
-- "Could not find the function public.remove_household_member(p_user_id)")

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

notify pgrst, 'reload schema';
