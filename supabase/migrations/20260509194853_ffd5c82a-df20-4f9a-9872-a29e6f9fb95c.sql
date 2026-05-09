
create or replace function public.claim_first_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  admin_count int;
begin
  if uid is null then
    raise exception 'Must be signed in';
  end if;
  select count(*) into admin_count from public.user_roles where role = 'admin';
  if admin_count > 0 then
    return false;
  end if;
  insert into public.user_roles (user_id, role) values (uid, 'admin')
  on conflict do nothing;
  return true;
end;
$$;

revoke execute on function public.claim_first_admin() from public, anon;
grant execute on function public.claim_first_admin() to authenticated;
