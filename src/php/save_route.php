<?php
session_start();
if (isset($_POST['taskai']) &&
    isset($_POST['marsrutas']) &&
    isset($_POST['pavadinimas'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $id = $_POST['id'];
  if ($id == 0) {
    $query = "INSERT INTO routes (pavadinimas, marsrutas, taskai, offroad, userid)
                   VALUES ($1, $2, $3, $4, $5) RETURNING id, uuid_value";
    $res = pg_query_params($link, $query, array(
      $_POST['pavadinimas'],
      $_POST['marsrutas'],
      $_POST['taskai'],
      $_POST['offroad'],
      $_SESSION['userid']
    ));
    $row = pg_fetch_assoc($res);
    $id = $row['id'];
    $uuid = $row['uuid_value'];
    echo json_encode(array("id" => $id, "uuid" => $uuid));
  } else {
    $query = "UPDATE routes
                 SET pavadinimas = $1
                    ,marsrutas = $2
                    ,taskai = $3
                    ,offroad = $4
               WHERE id = $5
                 and userid = $6";
    $res = pg_query_params($link, $query, array($_POST['pavadinimas'], $_POST['marsrutas'], $_POST['taskai'], $_POST['offroad'], $id, $_SESSION['userid']));
    echo json_encode(array("id" => $id));
  }
  header('Content-Type: application/json');
  pg_close($link);
}
?>
