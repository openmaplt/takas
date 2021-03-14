create or replace function check_password(p_user text, p_password text) returns int as $$
declare
c record;
l_id int = -1;
begin
  for c in (select id
              from users
             where user = p_user
               and hash = sha256('e=C4Y/mP2!q*' || p_password || 'Ufal#X#oI@60')) loop
    l_id = c.id;
  end loop;
  return l_id;
end$$ language plpgsql;
