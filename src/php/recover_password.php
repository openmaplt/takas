<?php
header('Content-Type: application/json');
if (isset($_POST['hash']) && isset($_POST['password'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));

  // Find a user whose recovery link hash matches and has not yet expired
  $res = pg_query_params($link,
    "select id, recover_uuid from users where recover_timestamp > now() and recover_uuid is not null",
    array()
  );

  $found = null;
  while ($row = pg_fetch_assoc($res)) {
    if (hash('sha256', 'recover' . $row['recover_uuid']) === $_POST['hash']) {
      $found = $row;
      break;
    }
  }

  if (!$found) {
    // Hash not found or link has expired
    echo json_encode(array("result" => -2));
  } else {
    // Use ph() to hash the password — same function change_password() uses
    pg_query_params($link,
      "update users set hash = ph($1), recover_uuid = null, recover_timestamp = null where id = $2",
      array($_POST['password'], $found['id'])
    );
    echo json_encode(array("result" => 0));
  }

  pg_close($link);
} else {
  echo json_encode(array("result" => -100));
}
?>
