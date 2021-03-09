<?php
if (isset($_GET['id'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $query = "SELECT get_route($1) as route";
  $res = pg_query_params($link, $query, array($_GET['id']));
  $row = pg_fetch_assoc($res);
  header('Content-Type: application/json');
  echo $row['route'];
  pg_close($link);
}
?>
