<?php
session_start();
$config = require './config.php';
$link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
$query = "SELECT json_build_object(
           'type',     'FeatureCollection',
           'features', coalesce(jsonb_agg(features.feature), '[]'::jsonb)
          ) f FROM (
            SELECT json_build_object(
              'type',       'Feature',
              'id',         id,
              'geometry',   ST_AsGeoJSON(geom)::json,
              'properties', json_build_object(
                'pavadinimas',          inputs.pavadinimas,
                'tipas',                inputs.tipas,
                'gentis',               inputs.gentis,
                'krastas',              inputs.krastas,
                'vaizdingumas',         inputs.vaizdingumas,
                'arch_reiksme',         inputs.arch_reiksme,
                'mito_reiksme',         inputs.mito_reiksme,
                'ist_reiksme',          inputs.ist_reiksme,
                'vis_reiksme',          inputs.vis_reiksme,
                'tyrimu_duomenys',      inputs.tyrimu_duomenys,
                'pritaikymas_lankymui', inputs.pritaikymas_lankymui,
                'kvr_numeris',          inputs.kvr_numeris,
                'pastabos',             inputs.pastabos
              )
            ) AS feature
            FROM (SELECT id
                        ,geom
                        ,pavadinimas
                        ,coalesce(tipas, 0) tipas
                        ,coalesce(gentis, 0) gentis
                        ,coalesce(krastas, 0) krastas
                        ,coalesce(vaizdingumas, 0) vaizdingumas
                        ,coalesce(arch_reiksme, 0) arch_reiksme
                        ,coalesce(mito_reiksme, 0) mito_reiksme
                        ,coalesce(ist_reiksme, 0) ist_reiksme
                        ,coalesce(vis_reiksme, 0) vis_reiksme
                        ,coalesce(tyrimu_duomenys, 0) tyrimu_duomenys
                        ,coalesce(pritaikymas_lankymui, 0) pritaikymas_lankymui
                        ,coalesce(kvr_numeris, 0) kvr_numeris
                        ,pastabos
                    FROM points
                   WHERE userid = $1
                  ) inputs) features";

$res = pg_query_params($link, $query, array($_SESSION['userid']));
$row = pg_fetch_assoc($res);

echo $row["f"];
?>
