create table users (
  id serial primary key,
  name text,
  email text,
  hash text,
  last_login timestamp,
  first_login timestamp,
  login_count int
);
