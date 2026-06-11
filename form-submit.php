<?php
/**
 * Contact form handler (PHP 7.4+)
 * Copy form-config.example.php to form-config.php and set recipient email.
 * Returns JSON for async fetch from assets/js/main.js
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'code' => 'method', 'message' => 'Method not allowed.']);
  exit;
}

$configFile = __DIR__ . '/form-config.php';
if (!is_file($configFile)) {
  http_response_code(503);
  echo json_encode([
    'ok' => false,
    'code' => 'config',
    'message' => 'The contact form is temporarily unavailable. Please call (610) 624-6800 or (877) 293-3840.',
  ]);
  exit;
}

$cfg = require $configFile;
$to = isset($cfg['to']) ? trim((string) $cfg['to']) : '';
if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'code' => 'config', 'message' => 'The contact form is temporarily unavailable. Please call (610) 624-6800 or (877) 293-3840.']);
  exit;
}

$company = isset($_POST['company']) ? (string) $_POST['company'] : '';
if (trim($company) !== '') {
  echo json_encode(['ok' => true, 'code' => 'ignored']);
  exit;
}

$first = isset($_POST['firstName']) ? trim((string) $_POST['firstName']) : '';
$last = isset($_POST['lastName']) ? trim((string) $_POST['lastName']) : '';
$email = isset($_POST['email']) ? trim((string) $_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim((string) $_POST['phone']) : '';
$summary = isset($_POST['summary']) ? trim((string) $_POST['summary']) : '';
$pulledOver = isset($_POST['pulledOver']) ? (string) $_POST['pulledOver'] : '';
$checkpoint = isset($_POST['checkpoint']) ? (string) $_POST['checkpoint'] : '';
$breath = isset($_POST['breath']) ? (string) $_POST['breath'] : '';
$lic = isset($_POST['license']) ? (string) $_POST['license'] : '';
$fslit = isset($_POST['fslit']) ? (string) $_POST['fslit'] : '';
$extra = isset($_POST['extra']) ? trim((string) $_POST['extra']) : '';

$errors = [];
if ($first === '') {
  $errors['firstName'] = 'First name is required.';
}
if ($last === '') {
  $errors['lastName'] = 'Last name is required.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  $errors['email'] = 'A valid email is required.';
}
if (strlen(preg_replace('/\D/', '', $phone)) < 7) {
  $errors['phone'] = 'A phone number is required.';
}
if (strlen($summary) < 20) {
  $errors['summary'] = 'Please add at least 20 characters in the case summary field.';
}
if (!empty($errors)) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'code' => 'validation', 'fields' => $errors]);
  exit;
}

$fromName = isset($cfg['fromName']) ? (string) $cfg['fromName'] : 'Bauer & Associates Website';
$subject = isset($cfg['subjectPrefix']) ? (string) $cfg['subjectPrefix'] : 'Web inquiry:';
$subject = $subject . ' ' . $last . ' / ' . $first;

$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

$body = "Inquiry from pottstownattorney.com contact form\n\n";
$body .= "Name: $first $last\n";
$body .= "Email: $email\n";
$body .= "Phone: $phone\n\n";
$body .= "Case summary:\n" . $summary . "\n\n";
$body .= "Optional details (if any):\n";
$body .= "Pulled over at night: " . ($pulledOver !== '' ? $pulledOver : "—") . "\n";
$body .= "Checkpoint: " . ($checkpoint !== '' ? $checkpoint : "—") . "\n";
$body .= "Breath test: " . ($breath !== '' ? $breath : "—") . "\n";
$body .= "Valid license: " . ($lic !== '' ? $lic : "—") . "\n";
$body .= "Field tests / lighting: " . ($fslit !== '' ? $fslit : "—") . "\n";
if ($extra !== '') {
  $body .= "\nAdditional:\n" . $extra . "\n";
}
$body .= "\n—\nIP: $ip\n";

$fromHeader = isset($cfg['fromAddress']) && filter_var($cfg['fromAddress'], FILTER_VALIDATE_EMAIL)
  ? $cfg['fromAddress']
  : 'noreply@' . (isset($_SERVER['HTTP_HOST']) ? preg_replace('/^www\./', '', $_SERVER['HTTP_HOST']) : 'localhost');
$headers = [
  'MIME-Version: 1.0',
  'Content-type: text/plain; charset=UTF-8',
  'From: ' . '=?UTF-8?B?' . base64_encode($fromName) . '?= <' . $fromHeader . '>',
  'Reply-To: ' . $email,
  'X-Mailer: PHP',
];

$headersStr = implode("\r\n", $headers);

$mailOk = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headersStr);

if (!$mailOk) {
  http_response_code(500);
  echo json_encode([
    'ok' => false,
    'code' => 'send',
    'message' => 'We could not send your message right now. Please call (610) 624-6800 or (877) 293-3840.',
  ]);
  exit;
}

echo json_encode(['ok' => true, 'code' => 'sent']);
