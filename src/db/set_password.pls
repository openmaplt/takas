create or replace function set_password(p_id integer, p_password text) returns int as $$
declare
begin
  update users set hash = sha256('e=C4Y/mP2!q*' || p_password || 'Ufal#X#oI@60') where id = p_id;
end$$ language plpgsql;
