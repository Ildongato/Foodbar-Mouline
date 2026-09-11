<?php
// Upload only this file to assets/php/mouline-contact.php on Mouline's PHP hosting.
// The old contact.php remains untouched. Requires PHP 8.1+ and configured mail().
declare(strict_types=1);
namespace MoulineContact;

ini_set('display_errors', '0');

const RECIPIENT = 'info@mouline.be';
const ALLOWED_ORIGINS = [
    'https://www.mouline.be',
    'https://mouline.be',
    'https://ildongato.github.io',
    'http://127.0.0.1:4173',
    'http://localhost:4173',
];

function reply(array $body, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Vary: Origin');
header('X-Content-Type-Options: nosniff');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!in_array($origin, ALLOWED_ORIGINS, true)) {
    reply(['message' => 'Verstuur de aanvraag via de Mouline-website.'], 403);
}
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Idempotency-Key');
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($method !== 'POST') {
    header('Allow: POST, OPTIONS');
    reply(['message' => 'Gebruik het contactformulier om een aanvraag te versturen.'], 405);
}
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    reply(['message' => 'Ongeldige aanvraag.'], 415);
}
$raw = file_get_contents('php://input', false, null, 0, 16001);
if ($raw === false || strlen($raw) > 16000) {
    reply(['message' => 'Je bericht is te lang.'], 413);
}
try {
    $data = json_decode($raw, true, 16, JSON_THROW_ON_ERROR);
} catch (\JsonException $error) {
    reply(['message' => 'Ongeldige aanvraag.'], 400);
}
$keys = ['intent', 'name', 'email', 'phone', 'date', 'time', 'partySize', 'occasion', 'message', 'website'];
if (!is_array($data)) {
    reply(['message' => 'Ongeldige aanvraag.'], 400);
}
foreach ($keys as $key) {
    if (!isset($data[$key]) || !is_string($data[$key])) {
        reply(['message' => 'Vul alle vereiste velden in.'], 400);
    }
}
if ($data['website'] !== '') {
    reply(['message' => 'De aanvraag kon niet worden verwerkt. Bel ons even.'], 400);
}
$errors = [];
if (!in_array($data['intent'], ['Reservatie', 'Catering', 'Andere vraag'], true)) {
    $errors['intent'] = 'Kies waarvoor je contact opneemt.';
}
if (strlen(trim($data['name'])) < 2) $errors['name'] = 'Vul je naam in.';
$email = trim($data['email']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) {
    $errors['email'] = 'Vul een geldig e-mailadres in.';
}
if (strlen(preg_replace('/\D/', '', $data['phone'])) < 8) {
    $errors['phone'] = 'Vul een geldig telefoonnummer in.';
}
if ($data['intent'] !== 'Andere vraag') {
    $zone = new \DateTimeZone('Europe/Brussels');
    $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $data['date'], $zone);
    if (!$date || $date->format('Y-m-d') !== $data['date'] || $date < new \DateTimeImmutable('today', $zone)) {
        $errors['date'] = 'Kies vandaag of een datum in de toekomst.';
    }
    if (!ctype_digit($data['partySize']) || (int) $data['partySize'] < 1 || (int) $data['partySize'] > 999) {
        $errors['partySize'] = 'Vul het aantal personen in (1 tot 999).';
    }
}
if ($data['intent'] === 'Reservatie' && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/D', $data['time'])) {
    $errors['time'] = 'Kies een uur.';
}
if ($data['intent'] === 'Catering' && strlen(trim($data['occasion'])) < 2) {
    $errors['occasion'] = 'Vermeld het type gelegenheid.';
}
if ($data['intent'] !== 'Reservatie' && strlen(trim($data['message'])) < 5) {
    $errors['message'] = 'Vertel ons kort waarmee we je kunnen helpen.';
}
foreach ($keys as $key) {
    if (preg_match_all('/./us', $data[$key]) > ($key === 'message' ? 5000 : 200)) {
        $errors[$key] = 'Deze invoer is te lang.';
    }
}
if ($errors) reply(['message' => 'Controleer de aangeduide velden.', 'errors' => $errors], 422);
$key = $_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? '';
if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/Di', $key)) {
    reply(['message' => 'Vernieuw de pagina en probeer opnieuw.'], 400);
}

$payload = [
    'Aanvraag' => $data['intent'],
    'Naam' => trim($data['name']),
    'E-mail' => $email,
    'Telefoon' => trim($data['phone']),
];
if ($data['intent'] !== 'Andere vraag') {
    $payload['Datum'] = $data['date'];
    $payload['Aantal personen'] = $data['partySize'];
}
if ($data['intent'] === 'Reservatie') $payload['Uur'] = $data['time'];
if ($data['intent'] === 'Catering') $payload['Type gelegenheid'] = trim($data['occasion']);
$payload['Bericht'] = trim($data['message']);
$fingerprint = hash('sha256', json_encode($payload));
$success = ['message' => $data['intent'] === 'Reservatie'
    ? 'Bedankt. Je aanvraag is verstuurd naar Mouline. Je reservatie is definitief zodra Mouline ze heeft bevestigd.'
    : 'Bedankt. Je aanvraag is verstuurd naar Mouline. We nemen contact met je op.'];

// Keep only hashes, timestamps and delivery state outside the public webroot.
// A lock prevents two simultaneous retries from sending the same request twice.
umask(0077);
$statePath = sys_get_temp_dir() . '/mouline-contact-' . hash('sha256', __FILE__) . '.json';
$handle = fopen($statePath, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) {
    reply(['message' => 'Versturen is even niet beschikbaar. Je gegevens blijven ingevuld. Bel ons even.'], 503);
}
$stored = stream_get_contents($handle);
$state = $stored === '' ? ['requests' => [], 'rate' => []] : json_decode($stored, true);
if (!is_array($state) || !is_array($state['requests'] ?? null) || !is_array($state['rate'] ?? null)) {
    reply(['message' => 'Versturen is even niet beschikbaar. Bel ons even.'], 503);
}
$now = time();
$state['requests'] = array_filter($state['requests'], fn ($entry) => $entry['time'] > $now - 86400);
$state['rate'] = array_filter($state['rate'], fn ($entry) => $entry['time'] > $now - 900);
$requestKey = hash('sha256', strtolower($key));
$previous = $state['requests'][$requestKey] ?? null;
if ($previous) {
    if ($previous['fingerprint'] !== $fingerprint) {
        reply(['message' => 'Deze aanvraag is gewijzigd. Pas je gegevens aan en probeer opnieuw.'], 409);
    }
    if ($previous['status'] === 'sent') reply($success);
    reply(['message' => 'De verzending is nog niet bevestigd. Bel ons even voordat je opnieuw verstuurt.'], 409);
}
$client = hash('sha256', __FILE__ . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
$rate = $state['rate'][$client] ?? ['time' => $now, 'count' => 0];
if ($rate['count'] >= 10) {
    header('Retry-After: 900');
    reply(['message' => 'Je hebt meerdere aanvragen verstuurd. Probeer later opnieuw of bel ons.'], 429);
}
$rate['count']++;
$state['rate'][$client] = $rate;
$state['requests'][$requestKey] = ['time' => $now, 'fingerprint' => $fingerprint, 'status' => 'pending'];
function saveState($handle, array $state): bool
{
    $json = json_encode($state);
    rewind($handle);
    return ftruncate($handle, 0) && fwrite($handle, $json) === strlen($json) && fflush($handle);
}
if (!saveState($handle, $state)) {
    reply(['message' => 'Versturen is even niet beschikbaar. Bel ons even.'], 503);
}
$text = implode("\r\n\r\n", array_map(fn ($label, $value) => $label . ': ' . $value, array_keys($payload), $payload));
$subject = '=?UTF-8?B?' . base64_encode($data['intent'] . ' via de Mouline-website') . '?=';
$headers = [
    'From' => 'Foodbar Mouline <info@mouline.be>',
    'Reply-To' => $email,
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => 'base64',
];
try {
    $sent = mail(RECIPIENT, $subject, chunk_split(base64_encode($text), 76, "\r\n"), $headers);
} catch (\Throwable $error) {
    $sent = false;
}
if ($sent) {
    $state['requests'][$requestKey]['status'] = 'sent';
} else {
    unset($state['requests'][$requestKey]);
}
$saved = saveState($handle, $state);
flock($handle, LOCK_UN);
fclose($handle);
if (!$sent || !$saved) {
    reply(['message' => 'We konden de verzending niet bevestigen. Je gegevens blijven ingevuld. Bel ons even.'], 502);
}
reply($success);
