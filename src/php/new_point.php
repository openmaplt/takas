<?php
if (isset($_GET['lat']) && isset($_GET['lon']) && isset($_GET['crc'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $query = "INSERT INTO points (geom) values (ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), $3::int), 4326))";
  $res = pg_query_params($link, $query, array($_GET['lon'], $_GET['lat'], $_GET['crc']));
  $lat = 0;
  $lon = 0;
  if ($_GET['crc'] != 4326) {
    $query = "SELECT st_x(st_transform(ST_SetSRID(ST_MakePoint($1, $2),$3::int), 4326)) lon
                    ,st_y(st_transform(ST_SetSRID(ST_MakePoint($1, $2),$3::int), 4326)) lat";
    $res = pg_query_params($link, $query, array($_GET['lon'], $_GET['lat'], $_GET['crc']));
    $row = pg_fetch_assoc($res);
    $lat = $row['lat'];
    $lon = $row['lon'];
  } else {
    $lat = $_GET['lat'];
    $lon = $_GET['lon'];
  }
  pg_close($link);
  header('Content-Type: application/json');
  echo json_encode(array("lat" => $lat, "lon" => $lon));
}
?>
