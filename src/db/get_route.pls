create or replace function get_route(p_id integer) returns text as $$
declare
l_marsrutas json;
l_offroad json;
l_taskai json;
l_lines text = '';
l_points text = '';
l_result text;
l_tmp json;
l_transport text;
l_lat float;
l_lon float;
l_name text;
l_type text;
i int;
begin
  select marsrutas, offroad, taskai
    into l_marsrutas, l_offroad, l_taskai
    from routes
   where id = p_id;

  raise notice '%', l_marsrutas;

  for i in 0..json_array_length(l_marsrutas->'features')-1 loop
    raise notice '%', l_marsrutas->'features'->i;
    if l_lines != '' then
      l_lines = l_lines || ',';
    end if;
    l_lines = l_lines || (l_marsrutas->'features'->i)::text;
  end loop;

  l_result = l_marsrutas->'features';

  for i in 0..json_array_length(l_taskai)-1 loop
    raise notice '% ----> %', i, l_taskai->i;
    if l_taskai->i->>'transportas' = 'offroad' then
      raise notice '  ====> %', (l_offroad->i+1)::jsonb - 'id';
      l_lines = l_lines || ',' || (l_offroad->i+1)::jsonb - 'id';
    end if;
    if l_points != '' then
      l_points = l_points || ',';
    end if;
    l_tmp = l_taskai->i;
    l_transport = l_tmp->'transportas';
    l_lon = l_tmp->'lon';
    l_lat = l_tmp->'lat';
    l_name = l_tmp->'pavadinimas';
    l_type = l_tmp->'tipas';
    l_points = l_points ||
      '{"type":"Feature","properties":{"id": ' || i+1 || ', "transport":' || l_transport ||
      ',"name":' || l_name ||
      ',"type":' || l_type ||
      '},"geometry":{"type":"Point","coordinates":[' || l_lon || ',' || l_lat || ']}}';
  end loop;

  l_result = '{"type":"FeatureCollection","features":[' || l_lines || ',' || l_points || ']}';

  return l_result;
end$$ language plpgsql;
