<?php
session_start();
header('Content-Type: application/json');
if (isset($_POST['test'])) {
  $_SESSION['userid'] = 0;
  echo json_encode(array("id" => 0));
} elseif (isset($_POST['logout'])) {
  session_unset();
  $_SESSION['userid'] = -1;
  echo json_encode(array("id" => -1));
} elseif (isset($_POST['user']) && isset($_POST['pass'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $query = "select check_password($1, $2) id";
  $res = pg_query_params($link, $query, array($_POST['user'], $_POST['pass']));
  $row = pg_fetch_assoc($res);
  $_SESSION['userid'] = $row['id'];
  echo json_encode(array("id" => $row['id']));
  pg_close($link);
}
?>
