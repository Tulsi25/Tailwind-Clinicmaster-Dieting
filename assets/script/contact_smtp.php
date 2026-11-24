<?php
/*
Diets Koot - website mailer

Variable
	$recaptchaSecret : Recaptcha Secret Key
 
	$dzName : Contact Person Name
	$dzEmail : Contact Person Email
	$dzMessage : Contact Person Message
	$dzRes : response holder
	$dzOtherField : Form other additional fields
	
	
	$dzMailSubject : Mail Subject.
	$dzMailMessage : Mail Body
	$dzMailHeader : Mail Header
	$dzEmailReceiver : Contact receiver email address
	$dzEmailFrom : Mail Form title
	$dzEmailHeader : Mail headers
*/
/* require ReCaptcha class */
require('recaptcha-master/src/autoload.php');

/* ReCaptch Secret */
$recaptchaSecret = '<!-- Put your reCaptcha Key -->';

/* ============================================================
   MAIL SETTINGS -- hosting: Hostinger (PHP is supported, so this works)
   ============================================================

   The password is never kept in this file. Create
   assets/script/smtp-config.php on the server (git-ignored) containing:

       <?php return 'your-password-here';

   Pick ONE of the two setups below and set SMTP_HOST / SMTP_USER to match.

   A) Hostinger mailbox on your own domain  -- RECOMMENDED
      Create it in hPanel > Emails > Email Accounts, e.g. info@yourdomain.com
          SMTP_HOST   = 'smtp.hostinger.com'
          SMTP_USER   = 'info@yourdomain.com'   (the full address)
          SMTP_PORT   = 465      SMTP_SECURE = 'ssl'      (587/'tls' also works)
          password    = that mailbox's password
      Mail then comes from your own domain, which lands in inboxes far more
      reliably than sending as a gmail.com address from a non-Google server.
      $dzEmailTo can still be dietskoot@gmail.com if you prefer to read it
      there, or set up forwarding in hPanel.

   B) Gmail (dietskoot@gmail.com)
          SMTP_HOST   = 'smtp.gmail.com'
          SMTP_USER   = 'dietskoot@gmail.com'
          SMTP_PORT   = 587      SMTP_SECURE = 'tls'
          password    = a 16-character APP PASSWORD, not the account password
                        (myaccount.google.com > Security > 2-Step Verification,
                        then App passwords). A normal password is rejected with
                        "535 Username and Password not accepted".

   Until the password file exists, sending fails and the form reports
   "Some problem in sending mail, please try again later."
   ------------------------------------------------------------ */

$dzEmailTo 		= "dietskoot@gmail.com";   /* Receiver Email Address */
$dzEmailFrom    = "Diets Koot Website";

define('SMTP_HOST',   'smtp.hostinger.com');   /* Hostinger mailbox */
define('SMTP_USER',   'info@dietskootindia.com');   /* <-- mailbox from hPanel > Emails > Mailboxes */
/* The app password is NEVER stored in this file. It is read from either the
   SMTP_PASS environment variable, or assets/script/smtp-config.php, which is
   git-ignored. See smtp-config.example.php for the one-line format. */
$smtpPassFile = __DIR__ . '/smtp-config.php';
$smtpPass     = getenv('SMTP_PASS') ?: (is_readable($smtpPassFile) ? include $smtpPassFile : '');
define('SMTP_PASS',   $smtpPass);
define('SMTP_PORT',   465);     /* Hostinger: 465 with ssl (587 with tls also works) */
define('SMTP_SECURE', 'ssl');   /* must be lowercase: 'tls' or 'ssl' */

#### Load PHP Mailer Library ####
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

//Load Composer's autoloader
require 'php_mail/vendor/autoload.php';
#### Load PHP Mailer Library End ####

function pr($value)
{
	echo "<pre>";
	print_r($value);
	echo "</pre>";
}

#### SMTP Mail Function ####
function smtp_mail($dzEmailTo, $dzEmailFrom, $dzEmail, $dzMailSubject, $dzMailMessage)
{
    $mail = new PHPMailer(true);
	//$mail->SMTPDebug = SMTP::DEBUG_SERVER;             //Enable verbose debug output
    $mail->isSMTP();                                     //Send using SMTP
    $mail->Host       = SMTP_HOST;         				 //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                            //Enable SMTP authentication
    $mail->Username   = SMTP_USER;        				 //SMTP username
    $mail->Password   = SMTP_PASS;                  	 //SMTP password
    $mail->SMTPSecure = SMTP_SECURE;      				 //Must be lowercase 'tls'/'ssl': PHPMailer compares it strictly
    $mail->Port       = SMTP_PORT;                       //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    //Recipients
    /* The From address MUST be the mailbox we authenticated as. Hostinger
       rejects anything else with "553 Sender address rejected: not owned by
       user". The visitor's own address goes in Reply-To, so hitting reply in
       Gmail still answers the patient directly. */
    $mail->setFrom(SMTP_USER, $dzEmailFrom);
    $mail->addAddress($dzEmailTo);                   //Add a recipient
    if (!empty($dzEmail)) {
        $mail->addReplyTo($dzEmail);
    }

    //Content
    $mail->isHTML(true);                                  //Set email format to HTML
    $mail->Subject = $dzMailSubject;
    $mail->Body    = $dzMailMessage;

    return $mail->send();
}
#### SMTP Mail Function End ####

try {
    if (!empty($_POST)) {
	
		$dzRes = array('status' => 0, 'msg'=>'Something Went Wrong.');
	
		$reCaptchaEnable = isset($_POST['reCaptchaEnable']) ? $_POST['reCaptchaEnable'] : 1;
		
		
		if($reCaptchaEnable)
		{
		
			/* validate the ReCaptcha, if something is wrong, we throw an Exception,
				i.e. code stops executing and goes to catch() block */
			
			if (!isset($_POST['g-recaptcha-response'])) {
				$dzRes['status'] = 0;
				$dzRes['msg'] = 'ReCaptcha is not set.';
				echo json_encode($dzRes);
				exit;
			}

			/* do not forget to enter your secret key from https://www.google.com/recaptcha/admin */
			
			$recaptcha = new \ReCaptcha\ReCaptcha($recaptchaSecret, new \ReCaptcha\RequestMethod\CurlPost());
			
			/* we validate the ReCaptcha field together with the user's IP address */
			
			$response = $recaptcha->verify($_POST['g-recaptcha-response'], $_SERVER['REMOTE_ADDR']);

			if (!$response->isSuccess()) {
				$dzRes['status'] = 0;
				$dzRes['msg'] = 'ReCaptcha was not validated.';
				echo json_encode($dzRes);
				exit;
			}
        }
		
		#### Contact Form Script ####
		if($_POST['dzToDo'] == 'Contact')
		{
			$error 			= false;
			$dzName			= !empty($_POST['dzName'])?trim(strip_tags($_POST['dzName'])):'';
			$dzEmail		= !empty($_POST['dzEmail'])?trim(strip_tags($_POST['dzEmail'])):'';
			$dzMessage		= !empty($_POST['dzMessage'])?strip_tags($_POST['dzMessage']):'';

			if(empty($dzName)){
				
				if(isset($_POST['dzFirstName']) || isset($_POST['dzLastName'])){
					if(empty($_POST['dzFirstName']) || empty($_POST['dzLastName'])){
							$error	=	true;
							$msg	=	'Please fill name.';
					}else{
						$dzName = $_POST['dzFirstName'].' '.$_POST['dzLastName'];
					}
				}else{
					$error	=	true;
					$msg	=	'Please fill name.';	
				}
				
			}else if(!isAlphabetic($dzName)){
				$error = true;
				$msg	=	'Please enter alphbetic  characters.';
			}
			
			$dzPhoneMessage  = '';
			if(isset($_POST['dzPhoneNumber'])){
				
				$dzPhoneNumber = !empty($_POST['dzPhoneNumber']) ? $_POST['dzPhoneNumber']:'';
				
				if(empty($dzPhoneNumber)){
					$error = true;
					$msg   = 'Please enter phone number.';	
				}else if(!isValidPhonenumber($dzPhoneNumber)){
					$error = true;
					$msg   = 'Please enter valid phone number.';
				}
				
				if(!empty($dzPhoneNumber)){
					$dzPhoneMessage = "Phone Number: $dzPhoneNumber <br/>";
				}
				
			}
			
			if(empty($dzEmail)){
				$error = true;
				$msg = 'Please enter email.';
			}else if (!filter_var($dzEmail, FILTER_VALIDATE_EMAIL)) 
			{
				$error	=	true;
				$msg	= 'Wrong Email Format.';
			}
			
			if(empty($dzMessage)){
				$error = true;
				$msg = 'Please enter message.';
			}
			
			if ($error) {
				$dzRes['msg'] = $msg;
				echo json_encode($dzRes);
				exit;
			}
			
			$dzMailSubject = 'New enquiry from the Diets Koot website';
			$dzMailMessage	= 	"
								A person want to contact you: <br><br>
								Name: $dzName<br/>
								Email: $dzEmail<br/>".$dzPhoneMessage."
								Message: $dzMessage<br/>
								";
								
			$dzOtherField = "";
			if(!empty($_POST['dzOther']))
			{
				$dzOther = $_POST['dzOther'];
				$message = "";
				foreach($dzOther as $key => $value)
				{
					$fieldName = ucfirst(str_replace('_',' ',$key));
					$fieldValue = ucfirst(str_replace('_',' ',$value));
					$dzOtherField .= $fieldName." : ".$fieldValue."<br>";
				}
			}
			$dzMailMessage .= $dzOtherField; 
        
            #### Calling SMTP Mail Function ####
			$res = smtp_mail($dzEmailTo, $dzEmailFrom, $dzEmail, $dzMailSubject, $dzMailMessage);
            #### Calling SMTP Mail Function End ####
            
			if($res)
			{
				$dzRes['status'] = 1;
				$dzRes['msg'] = 'Thank you for submitting. We will contact you soon.';
			}
			else
			{
				$dzRes['status'] = 0;
				$dzRes['msg'] = 'Some problem in sending mail, please try again later.';
			}
			echo json_encode($dzRes);
			exit;
		}
		#### Contact Form Script End ####
		
		#### Appointment Form Script ####
		if($_POST['dzToDo'] == 'Appointment')
		{
			$error 			= false;
			$dzName			= !empty($_POST['dzName'])?trim(strip_tags($_POST['dzName'])):'';
			$dzEmail		= !empty($_POST['dzEmail'])?trim(strip_tags($_POST['dzEmail'])):'';
			$dzMessage		= !empty($_POST['dzMessage'])?strip_tags($_POST['dzMessage']):'';	
			
			if(empty($dzName)){
				
				if(isset($_POST['dzFirstName']) || isset($_POST['dzLastName'])){
					if(empty($_POST['dzFirstName']) || empty($_POST['dzLastName'])){
							$error	=	true;
							$msg	=	'Please fill name.';
					}else{
						$dzName = $_POST['dzFirstName'].' '.$_POST['dzLastName'];
					}
				}else{
					$error	=	true;
					$msg	=	'Please fill name.';	
				}
				
				
			}else if(!isAlphabetic($dzName)){
				$error = true;
				$msg	=	'Please enter alphbetic  characters.';
			}
			
			$dzPhoneMessage  = '';
			if(isset($_POST['dzPhoneNumber'])){
				
				$dzPhoneNumber = !empty($_POST['dzPhoneNumber']) ? $_POST['dzPhoneNumber']:'';
				
				if(empty($dzPhoneNumber)){
					$error = true;
					$msg   = 'Please enter phone number.';	
				}else if(!isValidPhonenumber($dzPhoneNumber)){
					$error = true;
					$msg   = 'Please enter valid phone number.';
				}
				
				if(!empty($dzPhoneNumber)){
					$dzPhoneMessage = "Phone Number: $dzPhoneNumber <br/>";
				}
			}
			
			if(empty($dzEmail)){
				$error = true;
				$msg = 'Please enter email.';
			}else if(!filter_var($dzEmail, FILTER_VALIDATE_EMAIL)){
				$error = true;
				$msg = 'Wrong Email Format.';
			}
			
			/* if(empty($dzMessage)){
				$error = true;
				$msg = 'Please enter message.';
			} */
			
			if ($error) {
				$dzRes['msg'] = $msg;
				echo json_encode($dzRes);
				exit;
			}



			$dzMailSubject = 'New appointment request from the Diets Koot website';
			$dzMailMessage	= 	"
								A person want to contact you: <br><br>
								Name: $dzName<br/>
								Email: $dzEmail<br/>".$dzPhoneMessage."
								Message: $dzMessage<br/>
								";
			$dzOtherField = "";
			if(!empty($_POST['dzOther']))
			{
				$dzOther = $_POST['dzOther'];
				$message = "";
				foreach($dzOther as $key => $value)
				{
					$fieldName = ucfirst(str_replace('_',' ',$key));
					$fieldValue = ucfirst(str_replace('_',' ',$value));
					$dzOtherField .= $fieldName." : ".$fieldValue."<br>";
				}
			}
			$dzMailMessage .= $dzOtherField; 
			
			#### Calling SMTP Mail Function ####
			$res = smtp_mail($dzEmailTo, $dzEmailFrom, $dzEmail, $dzMailSubject, $dzMailMessage);
			#### Calling SMTP Mail Function End ####
			
			if($res)
			{
				$dzRes['status'] = 1;
				$dzRes['msg'] = 'Thank you for submitting. We will contact you soon.';
			}
			else
			{
				$dzRes['status'] = 0;
				$dzRes['msg'] = 'Some problem in sending mail, please try again later.';
			}
			echo json_encode($dzRes);
			exit;
		}	
		#### Appointment Form Script End ####
		
	}
} catch (\Exception $e) {
    $dzRes['status'] = 0;
	$dzRes['msg'] = $e->getMessage().'Some problem in sending mail, please try again later.';
	echo json_encode($dzRes);
	exit;
}

function isAlphabetic($data){
	if (!preg_match("/[^A-Za-z 0-9.'-]/", $data)) // '/[^a-z\d]/i' should also work.
	{
		return true;
	} else{
		return false;
	}
}

function isValidPhonenumber($phone_number){
	if(preg_match('/^[0-9]{10}+$/', $phone_number)) {
		return true;
	} else{
		return false;
	}
}

