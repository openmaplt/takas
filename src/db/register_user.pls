create or replace function register_user(p_username text, p_email text) returns record as $$
declare
i int;
l_hash text;
l_id int;
l_result int;
l_return record;
begin
  select count(1) into i from users where name = p_username;
  if i > 0 then
    l_result = -1;
    l_hash = '';
  else
    insert into users (name, email, login_count) values (p_username, p_email, 0) returning id into l_id;
    l_hash = uuid_generate_v4();
    insert into password_change (userid, hash, created) values (l_id, l_hash, now());
    l_result = 0;
    l_hash = l_hash;
  end if;
  select l_result result, l_hash hash into l_return;
  return l_return;
end$$ language plpgsql;
