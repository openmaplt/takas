<?php
if (isset($_GET['id'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $query = "DELETE from points where id = $1";
  $res = pg_query_params($link, $query, array($_GET['id']));
}
?>
