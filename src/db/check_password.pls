create or replace function check_password(p_user text, p_password text) returns int as $$
declare
c record;
l_id int = -1;
begin
  for c in (select id
              from users
             where name = p_user
               and hash = ph(p_password)) loop
    l_id = c.id;
  end loop;
  return l_id;
end$$ language plpgsql;
