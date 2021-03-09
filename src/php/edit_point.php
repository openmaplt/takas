<?php
if (isset($_POST['id']) && isset($_POST['pavadinimas'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $query = "UPDATE points set pavadinimas = $1,
                              tipas = case when $2 = 0 then null else $2 end,
                              gentis = case when $3 = 0 then null else $3 end,
                              krastas = case when $4 = 0 then null else $4 end,
                              vaizdingumas = case when $5 = 0 then null else $5 end,
                              arch_reiksme = case when $6 = 0 then null else $6 end,
                              mito_reiksme = case when $7 = 0 then null else $7 end,
                              ist_reiksme = case when $8 = 0 then null else $8 end,
                              vis_reiksme = case when $9 = 0 then null else $9 end,
                              tyrimu_duomenys = case when $10 = 0 then null else $10 end,
                              pritaikymas_lankymui = case when $11 = 0 then null else $11 end,
                              kvr_numeris = case when $12 = 0 then null else $12 end,
                              pastabos = $13::text
                        where id = $14";
  $res = pg_query_params($link, $query, array(
    $_POST['pavadinimas'],          // 1
    $_POST['tipas'],                // 2
    $_POST['gentis'],               // 3
    $_POST['krastas'],              // 4
    $_POST['vaizdingumas'],         // 5
    $_POST['arch_reiksme'],         // 6
    $_POST['mito_reiksme'],         // 7
    $_POST['ist_reiksme'],          // 8
    $_POST['vis_reiksme'],          // 9
    $_POST['tyrimu_duomenys'],      // 10
    $_POST['pritaikymas_lankymui'], // 11
    $_POST['kvr_numeris'],          // 12
    $_POST['pastabos'],             // 13
    $_POST['id']));                 // 14
}
?>
