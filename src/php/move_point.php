<?php
session_start();
if (isset($_GET['id']) && isset($_GET['lat']) && isset($_GET['lon'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $query = "UPDATE points
               set geom = ST_SetSRID(ST_MakePoint($1, $2),4326)
             where id = $3
               and userid = $4";
  $res = pg_query_params($link, $query, array(
    $_GET['lon'],
    $_GET['lat'],
    $_GET['id'],
    $_SESSION['userid']
  ));
}
?>
