create table routes (
  id serial primary key,
  pavadinimas text,
  tipas int,
  gentis int,
  krastas int,
  sritis int,
  vaizdingumas int,
  aprasymas text,
  pastabos text,
  marsrutas text,
  taskai text,
  offroad text,
  deleted timestamp without time zone,
  uuid_value uuid default uuid_generate_v4(),
  userid int
);
