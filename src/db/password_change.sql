create table password_change (
  id serial primary key,
  userid int,
  hash text,
  created timestamp
);
