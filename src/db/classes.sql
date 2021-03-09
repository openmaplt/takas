drop table if exists classes;
create table classes (id serial primary key, klase text, raktas int, reiksme text);

insert into classes (klase, raktas, reiksme) values ('tipas', 1, 'Archeologijos paveldas');
insert into classes (klase, raktas, reiksme) values ('tipas', 2, 'Mitologijos paveldas');
insert into classes (klase, raktas, reiksme) values ('tipas', 3, 'Istorijos paveldas');
insert into classes (klase, raktas, reiksme) values ('tipas', 4, 'Etninės kultūros paveldas');
insert into classes (klase, raktas, reiksme) values ('tipas', 5, 'Gamtos paveldas');

insert into classes (klase, raktas, reiksme) values ('gentis', 1,  'Lietuviai');
insert into classes (klase, raktas, reiksme) values ('gentis', 2,  'Aukštaičiai');
insert into classes (klase, raktas, reiksme) values ('gentis', 3,  'Sėliai');
insert into classes (klase, raktas, reiksme) values ('gentis', 4,  'Latgaliai');
insert into classes (klase, raktas, reiksme) values ('gentis', 5,  'Žiemgaliai');
insert into classes (klase, raktas, reiksme) values ('gentis', 6,  'Žemaičiai');
insert into classes (klase, raktas, reiksme) values ('gentis', 7,  'Kuršiai');
insert into classes (klase, raktas, reiksme) values ('gentis', 8,  'Skalviai');
insert into classes (klase, raktas, reiksme) values ('gentis', 9,  'Nadruviai');
insert into classes (klase, raktas, reiksme) values ('gentis', 10, 'Sūduviai (jotvingiai, dainaviai)');

insert into classes (klase, raktas, reiksme) values ('krastas', 1, 'Dainava');
insert into classes (klase, raktas, reiksme) values ('krastas', 2, 'Jotva');
insert into classes (klase, raktas, reiksme) values ('krastas', 3, 'Sūduva');
insert into classes (klase, raktas, reiksme) values ('krastas', 4, 'Nalšia');
insert into classes (klase, raktas, reiksme) values ('krastas', 5, 'Neris');
insert into classes (klase, raktas, reiksme) values ('krastas', 6, 'Deltuva');
insert into classes (klase, raktas, reiksme) values ('krastas', 7, 'Sėla');
insert into classes (klase, raktas, reiksme) values ('krastas', 8, 'Žiemgala');
insert into classes (klase, raktas, reiksme) values ('krastas', 9, 'Upytė');
insert into classes (klase, raktas, reiksme) values ('krastas', 10, 'Trakų kunigaikštystė');
insert into classes (klase, raktas, reiksme) values ('krastas', 11, 'Žemaičių kunigaikštystė');
insert into classes (klase, raktas, reiksme) values ('krastas', 12, 'Karšuva');
insert into classes (klase, raktas, reiksme) values ('krastas', 13, 'Medininkai');
insert into classes (klase, raktas, reiksme) values ('krastas', 14, 'Pagraudė');
insert into classes (klase, raktas, reiksme) values ('krastas', 15, 'Knituva');
insert into classes (klase, raktas, reiksme) values ('krastas', 16, 'Lamata');
insert into classes (klase, raktas, reiksme) values ('krastas', 17, 'Skalva');
insert into classes (klase, raktas, reiksme) values ('krastas', 18, 'Pilsotas');
insert into classes (klase, raktas, reiksme) values ('krastas', 19, 'Mėguva');
insert into classes (klase, raktas, reiksme) values ('krastas', 20, 'Diuvzarė');
insert into classes (klase, raktas, reiksme) values ('krastas', 21, 'Ceklis');
insert into classes (klase, raktas, reiksme) values ('krastas', 22, 'Lietuva (XII–XIII a. žemė)');

insert into classes (klase, raktas, reiksme) values ('reiksme', 1, 'Unikali');
insert into classes (klase, raktas, reiksme) values ('reiksme', 2, 'Reta');
insert into classes (klase, raktas, reiksme) values ('reiksme', 3, 'Būdinga');
insert into classes (klase, raktas, reiksme) values ('reiksme', 4, 'Nėra');

insert into classes (klase, raktas, reiksme) values ('reiksme2', 1, 'Unikalu');
insert into classes (klase, raktas, reiksme) values ('reiksme2', 2, 'Reta');
insert into classes (klase, raktas, reiksme) values ('reiksme2', 3, 'Būdinga');
insert into classes (klase, raktas, reiksme) values ('reiksme2', 4, 'Nėra');

insert into classes (klase, raktas, reiksme) values ('vis_reiksme', 1, 'Yra');
insert into classes (klase, raktas, reiksme) values ('vis_reiksme', 2, 'Nėra');

insert into classes (klase, raktas, reiksme) values ('tyrimu_duomenys', 1, 'Atlikti');
insert into classes (klase, raktas, reiksme) values ('tyrimu_duomenys', 2, 'Nėra');

insert into classes (klase, raktas, reiksme) values ('pritaikymas', 1, 'Pritaikyta');
insert into classes (klase, raktas, reiksme) values ('pritaikymas', 2, 'Nepritaikyta');
