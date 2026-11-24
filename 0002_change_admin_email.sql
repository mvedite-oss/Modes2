-- Atualiza o ADM para miguelccc360@gmail.com (para bancos que já rodaram a migration 0000)
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username) values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if lower(new.email) = 'miguelccc360@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;

-- Se a conta já existir, dá permissão de admin a ela
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where lower(email) = 'miguelccc360@gmail.com'
on conflict do nothing;
