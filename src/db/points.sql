CREATE TABLE points (
    id serial primary key,
    pavadinimas text,
    geom public.geometry(Point,4326),
    tipas integer,
    gentis integer,
    krastas integer,
    vaizdingumas integer,
    mito_reiksme integer,
    ist_reiksme integer,
    vis_reiksme integer,
    tyrimu_duomenys integer,
    pritaikymas_lankymui integer,
    kvr_numeris integer,
    pastabos text,
    arch_reiksme integer
);
