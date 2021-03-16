<?php
session_start();
if (isset($_GET['id'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $id = $_GET['id'];
  $query = "UPDATE routes SET deleted = now() WHERE id = $1 and userid = $2";
  $res = pg_query_params($link, $query, array($id, $_SESSION['userid']));
  pg_close($link);
}
?>
