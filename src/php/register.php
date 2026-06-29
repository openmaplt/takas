<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
header('Content-Type: application/json');
if (isset($_POST['username']) && isset($_POST['email'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));
  $query = "select result, hash from register_user($1, $2) as (result int, hash text)";
  $res = pg_query_params($link, $query, array($_POST['username'], $_POST['email']));
  $row = pg_fetch_assoc($res);
  echo json_encode(array("result" => $row['result'], "hash" => $row['hash']));
  if ($row['result'] == 0) {
    $smtp = $config['smtp'];
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $smtp['host'];
    $mail->Port       = $smtp['port'];
    $mail->SMTPAuth   = true;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Username   = $smtp['username'];
    $mail->Password   = $smtp['password'];
    $mail->CharSet    = 'UTF-8';
    $mail->setFrom($smtp['from'], $smtp['from_name']);
    $mail->addAddress($_POST['email']);
    $mail->Subject = "Registracija į Taką";
    $mail->Body    = "Jūs sėkmingai pradėjote registraciją į maršrutų planavimo sistemą Takas.\n" .
                     "Pabaikite registraciją adresu:\n" .
                     $_POST['host'] . "#" . $row['hash'];
    $mail->send();
  }
  pg_close($link);
} else {
  echo json_encode(array("result" => -100));
}
?>
