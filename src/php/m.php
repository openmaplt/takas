<?php
if (isset($_GET['uuid'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $query = "SELECT marsrutas, taskai, offroad, pavadinimas FROM routes WHERE uuid_value = $1";
  $res = pg_query_params($link, $query, array($_GET['uuid']));
  $row = pg_fetch_assoc($res);
  header('Content-Type: application/json');
  echo json_encode(array(
    "marsrutas" => $row['marsrutas'],
    "taskai" => $row['taskai'],
    "offroad" => $row['offroad'],
    "pavadinimas" => $row['pavadinimas']
  ));
  pg_close($link);
}
?>
