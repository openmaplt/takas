<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
header('Content-Type: application/json');
if (isset($_POST['email'])) {
  $config = require './config.php';
  $link = pg_connect(vsprintf('host=%s port=%u dbname=%s user=%s password=%s', $config['resource']['db']));

  // Check whether a user with this email exists
  $res = pg_query_params($link, "select id from users where email = $1", array($_POST['email']));
  $row = pg_fetch_assoc($res);

  if ($row) {
    // Generate a cryptographically random UUID v4
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40); // version 4
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80); // variant bits
    $uuid = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));

    // Hash used in the recovery link
    $linkHash = hash('sha256', 'recover' . $uuid);

    // Store UUID and expiry (now + 10 minutes) in the database
    pg_query_params($link,
      "update users set recover_uuid = $1, recover_timestamp = now() + interval '10 minutes' where email = $2",
      array($uuid, $_POST['email'])
    );

    // Send recovery email
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
    $mail->Subject = "Slaptažodžio atstatymas";
    $mail->Body    = "Gautas slaptažodžio atstatymo prašymas.\n" .
                     "Slaptažodį galite atstatyti paspaudę šią nuorodą:\n" .
                     $_POST['host'] . "#" . $linkHash . "\n\n" .
                     "Nuoroda galioja 10 minučių.\n" .
                     "Jei neprašėte atstatyti slaptažodžio, tiesiog ignoruokite šį laišką.";
    $mail->send();
  }
  // Always return result=0 — do not reveal whether the e-mail address exists
  echo json_encode(array("result" => 0));
  pg_close($link);
} else {
  echo json_encode(array("result" => -100));
}
?>
