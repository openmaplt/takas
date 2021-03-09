<?php
if (isset($_GET['klase'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $query = "select raktas, reiksme from classes where klase = $1 order by id";
  $res = pg_query_params($link, $query, array($_GET['klase']));
  $klasif = array();
  while ($row = pg_fetch_assoc($res)) {
    $el = new StdClass();
    $el->raktas = $row['raktas'];
    $el->reiksme = $row['reiksme'];
    array_push($klasif, $el);
  }
  header('Content-Type: application/json');
  echo json_encode($klasif);
  pg_close($link);
}
?>
