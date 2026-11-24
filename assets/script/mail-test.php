<?php
/* ---------------------------------------------------------------------------
   One-off SMTP checker.

       https://dietskoot.com/assets/script/mail-test.php?key=dk-check-2026

   Reports what it found, checks the password for the usual copy-paste
   problems, then tries to send on 465/ssl and, if that fails, on 587/tls.

   DELETE THIS FILE once the form works.
--------------------------------------------------------------------------- */

$key = 'dk-check-2026';

if (!isset($_GET['key']) || !hash_equals($key, $_GET['key'])) {
    http_response_code(404);
    exit('Not found');
}

header('Content-Type: text/plain; charset=utf-8');

$config = file_get_contents(__DIR__ . '/contact_smtp.php');
preg_match('/\$dzEmailTo\s*=\s*"([^"]+)"/', $config, $m);          $to   = $m[1] ?? '';
preg_match("/define\('SMTP_HOST',\s*'([^']*)'/", $config, $m);     $host = $m[1] ?? '';
preg_match("/define\('SMTP_USER',\s*'([^']*)'/", $config, $m);     $user = $m[1] ?? '';

$passFile = __DIR__ . '/smtp-config.php';
$pass = getenv('SMTP_PASS') ?: (is_readable($passFile) ? include $passFile : '');

echo "Settings in use\n";
echo "---------------\n";
echo "host : {$host}\n";
echo "user : {$user}\n";
echo "to   : {$to}\n\n";

if ($pass === '') {
    exit("No password found.\nCreate {$passFile} containing:\n\n    <?php return 'your-password';\n");
}

/* --- password hygiene, without printing the password itself --------------- */
echo "Password check\n";
echo "--------------\n";
echo "length            : " . strlen($pass) . "\n";
echo "leading space     : " . ($pass !== ltrim($pass) ? "YES - remove it" : "no") . "\n";
echo "trailing space/NL : " . ($pass !== rtrim($pass) ? "YES - remove it" : "no") . "\n";
echo "contains a quote  : " . (strpbrk($pass, "'\"") !== false ? "YES - see note below" : "no") . "\n";
echo "contains backslash: " . (strpos($pass, '\\') !== false ? "YES - see note below" : "no") . "\n";
echo "first/last char   : " . substr($pass, 0, 1) . " ... " . substr($pass, -1) . "\n\n";

require __DIR__ . '/php_mail/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

function attempt($host, $user, $pass, $to, $port, $secure)
{
    echo "\n=== trying port {$port} ({$secure}) ===\n";
    $mail = new PHPMailer(true);
    try {
        $mail->SMTPDebug   = SMTP::DEBUG_SERVER;
        $mail->Debugoutput = 'echo';
        $mail->Timeout     = 20;
        $mail->isSMTP();
        $mail->Host       = $host;
        $mail->SMTPAuth   = true;
        $mail->Username   = $user;
        $mail->Password   = $pass;
        $mail->SMTPSecure = $secure;
        $mail->Port       = $port;

        $mail->setFrom($user, 'Website mail test');
        $mail->addAddress($to);
        $mail->Subject = 'Website mail test';
        $mail->Body    = 'If this arrived, the website forms can send mail.';

        $mail->send();
        echo "\nSENT on port {$port}. Check {$to}, including spam.\n";
        return true;
    } catch (Exception $e) {
        echo "\nfailed on port {$port}: " . $mail->ErrorInfo . "\n";
        return false;
    }
}

$ok = attempt($host, $user, $pass, $to, 465, 'ssl');
if (!$ok) {
    $ok = attempt($host, $user, $pass, $to, 587, 'tls');
}

echo "\n\n";
if ($ok) {
    echo "DONE - now delete this file, and the website forms will work.\n";
} else {
    echo "Both ports failed to authenticate.\n\n";
    echo "The connection itself is fine, so this is the password.\n";
    echo "Check it like this:\n";
    echo "  1. Open https://webmail.hostinger.com and sign in as {$user}\n";
    echo "     with the same password. If that fails, the password is wrong -\n";
    echo "     reset it in hPanel > Emails > Mailboxes > the 3-dot menu.\n";
    echo "  2. If webmail works but this does not, the file may be mangling it.\n";
    echo "     A password containing a quote or backslash must be written as:\n";
    echo "         <?php return \"pa\\\\ss'word\";\n";
    echo "     Simplest fix: set a password with only letters and digits.\n";
}
