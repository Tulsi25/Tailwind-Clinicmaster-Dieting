<?php
/* ---------------------------------------------------------------------------
   One-off SMTP checker.

   Open it in a browser on the live site:

       https://yourdomain.com/assets/script/mail-test.php?key=dk-check-2026

   It tries to send one email to the address in contact_smtp.php and prints the
   full SMTP conversation, so a wrong password or port says so in plain words
   instead of the form's generic "Some problem in sending mail".

   DELETE THIS FILE once the form works. Change $key below if you prefer.
--------------------------------------------------------------------------- */

$key = 'dk-check-2026';

if (!isset($_GET['key']) || !hash_equals($key, $_GET['key'])) {
    http_response_code(404);
    exit('Not found');
}

header('Content-Type: text/plain; charset=utf-8');

/* Pull the same settings the real form uses, without sending anything yet. */
$config = file_get_contents(__DIR__ . '/contact_smtp.php');
preg_match('/\$dzEmailTo\s*=\s*"([^"]+)"/', $config, $m);
$to = $m[1] ?? '';

$passFile = __DIR__ . '/smtp-config.php';
$pass = getenv('SMTP_PASS') ?: (is_readable($passFile) ? include $passFile : '');

preg_match("/define\('SMTP_HOST',\s*'([^']*)'/", $config, $m);   $host = $m[1] ?? '';
preg_match("/define\('SMTP_USER',\s*'([^']*)'/", $config, $m);   $user = $m[1] ?? '';
preg_match('/define\(\'SMTP_PORT\',\s*(\d+)/', $config, $m);     $port = (int)($m[1] ?? 587);
preg_match("/define\('SMTP_SECURE',\s*'([^']*)'/", $config, $m); $secure = $m[1] ?? 'tls';

echo "Settings in use\n";
echo "---------------\n";
echo "host    : {$host}\n";
echo "user    : {$user}\n";
echo "port    : {$port} ({$secure})\n";
echo "send to : {$to}\n";
echo "password: " . ($pass === '' ? "MISSING - create smtp-config.php" : "found (" . strlen($pass) . " characters)") . "\n\n";

if ($pass === '') {
    exit("Stopping: create assets/script/smtp-config.php containing\n\n    <?php return 'your-mailbox-password';\n");
}

require __DIR__ . '/php_mail/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

$mail = new PHPMailer(true);
try {
    $mail->SMTPDebug  = SMTP::DEBUG_SERVER;      // print the whole conversation
    $mail->Debugoutput = 'echo';
    $mail->isSMTP();
    $mail->Host       = $host;
    $mail->SMTPAuth   = true;
    $mail->Username   = $user;
    $mail->Password   = $pass;
    $mail->SMTPSecure = $secure;
    $mail->Port       = $port;

    $mail->setFrom($to, 'Website mail test');
    $mail->addAddress($to);
    $mail->Subject = 'Website mail test';
    $mail->Body    = 'If this arrived, the website forms can send mail.';

    $mail->send();
    echo "\n\nSENT. Check {$to} (including spam). Now delete this file.\n";
} catch (Exception $e) {
    echo "\n\nFAILED: " . $mail->ErrorInfo . "\n";
    echo "\nCommon causes:\n";
    echo " - Gmail: you must use a 16-character App Password, not the account password.\n";
    echo " - Wrong port/encryption: try 465 with 'ssl', or 587 with 'tls'.\n";
    echo " - Hostinger mailbox: host is smtp.hostinger.com and the username is the full address.\n";
}
