<?php
$to      = 'jerry760707@yahoo.com.tw';
$subject = 'the subject';
$message = 'hello';
$headers = 'From: xwang16@wpi.edu' . "\r\n" .
    'Reply-To: xwang16@wpi.edu' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

mail($to, $subject, $message, $headers);
?>
