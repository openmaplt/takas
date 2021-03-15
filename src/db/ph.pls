create or replace function ph(p_password text) returns text as $$
begin
  -- Update theese seed values to your site random values and
  -- DO NOT change them afterwards ;-)
  return sha256(cast('e=C4Y/mP2!q*' || p_password || 'Ufal#X#oI@60' as bytea));
end$$ language plpgsql;
