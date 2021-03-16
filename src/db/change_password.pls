create or replace function change_password(p_hash text, p_password text) returns int as $$
declare
c record;
l_userid int = -1;
l_id int;
l_result int;
l_return record;
begin
  for c in (select id, userid from password_change where hash = p_hash) loop
    l_id = c.id;
    l_userid = c.userid;
  end loop;
  if l_userid = -1 then
    return -1;
  else
    delete from password_change where id = l_id;
    update users set hash = ph(p_password) where id = l_userid;
    return 0;
  end if;
end$$ language plpgsql;
