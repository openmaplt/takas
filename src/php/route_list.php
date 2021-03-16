<?php
session_start();
$config = require './config.php';
$link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
$query = "SELECT id, pavadinimas FROM routes WHERE deleted is null and userid = $1 ORDER BY pavadinimas";
$res = pg_query_params($link, $query, array($_SESSION['userid']));
$marsrutai = array();
while ($row = pg_fetch_assoc($res)) {
  $el = new StdClass();
  $el->id = $row['id'];
  $el->pavadinimas = $row['pavadinimas'];
  array_push($marsrutai, $el);
}
pg_close($link);
header('Content-Type: application/json');
echo json_encode($marsrutai);
?>
