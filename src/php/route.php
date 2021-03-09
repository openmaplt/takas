<?php
if (isset($_GET['id'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $query = "SELECT marsrutas, taskai, bekele, pavadinimas, uuid_value FROM routes WHERE id = $1";
  $res = pg_query_params($link, $query, array($_GET['id']));
  $row = pg_fetch_assoc($res);
  header('Content-Type: application/json');
  echo json_encode(array(
    "marsrutas" => $row['marsrutas'],
    "taskai" => $row['taskai'],
    "bekele" => $row['bekele'],
    "pavadinimas" => $row['pavadinimas'],
    "uuid" => $row['uuid_value']
  ));
  pg_close($link);
}
?>
