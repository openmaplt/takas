<?php
header('Content-Type: application/json');
if (isset($_POST['hash']) && isset($_POST['password'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $query = "select change_password($1, $2) result";
  $res = pg_query_params($link, $query, array($_POST['hash'], $_POST['password']));
  $row = pg_fetch_assoc($res);
  echo json_encode(array("result" => $row['result']));
  pg_close($link);
} else {
  echo json_encode(array("result" => -100));
}
?>
