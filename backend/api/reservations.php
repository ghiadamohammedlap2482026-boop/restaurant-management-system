<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

function respond(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
];
$configuredOrigin = getenv('FRONTEND_ORIGIN');
if ($configuredOrigin !== false && $configuredOrigin !== '') {
    $allowedOrigins = [$configuredOrigin];
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Max-Age: 600');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
if (!in_array($method, ['GET', 'POST', 'PATCH', 'DELETE'], true)) {
    header('Allow: GET, POST, PATCH, DELETE, OPTIONS');
    respond(405, ['message' => 'Method not allowed.']);
}

function parse_request_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        respond(400, ['message' => 'A JSON request body is required.']);
    }
    try {
        $body = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        respond(400, ['message' => 'The request body must be valid JSON.']);
    }
    if (!is_array($body) || $body === [] || array_keys($body) === range(0, count($body) - 1)) {
        respond(400, ['message' => 'The request body must be a JSON object.']);
    }
    return $body;
}

function validate_reservation(array $input, bool $partial = false): array
{
    $errors = [];
    $validated = [];
    $requiredFields = ['customer_name', 'email', 'phone', 'reservation_date', 'reservation_time', 'party_size'];
    $allowedFields = [...$requiredFields, 'notes'];
    if ($partial) {
        $allowedFields[] = 'status';
    }
    foreach (array_keys($input) as $key) {
        if (!in_array($key, $allowedFields, true)) {
            $errors[$key] = 'This field is not allowed.';
        }
    }
    if (!$partial) {
        foreach ($requiredFields as $field) {
            if (!array_key_exists($field, $input)) {
                $errors[$field] = 'This field is required.';
            }
        }
    } elseif ($input === []) {
        $errors['request'] = 'At least one field must be provided.';
    }

    if (array_key_exists('customer_name', $input)) {
        $name = is_string($input['customer_name']) ? trim($input['customer_name']) : '';
        if ($name === '' || strlen($name) > 100) {
            $errors['customer_name'] = 'Name is required and must be 100 characters or fewer.';
        } else {
            $validated['customer_name'] = $name;
        }
    }

    if (array_key_exists('email', $input)) {
        $email = is_string($input['email']) ? trim($input['email']) : '';
        if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            $errors['email'] = 'Enter a valid email address.';
        } else {
            $validated['email'] = $email;
        }
    }

    if (array_key_exists('phone', $input)) {
        $phone = is_string($input['phone']) ? trim($input['phone']) : '';
        $digitCount = preg_match_all('/\d/', $phone);
        if (strlen($phone) > 30 || $digitCount < 7 || $digitCount > 20 || preg_match('/^[+()\d .-]+$/', $phone) !== 1) {
            $errors['phone'] = 'Enter a valid phone number.';
        } else {
            $validated['phone'] = $phone;
        }
    }

    if (array_key_exists('reservation_date', $input)) {
        $dateValue = is_string($input['reservation_date']) ? $input['reservation_date'] : '';
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $dateValue);
        $dateErrors = DateTimeImmutable::getLastErrors();
        if ($date === false || ($dateErrors !== false && ($dateErrors['warning_count'] > 0 || $dateErrors['error_count'] > 0)) || $date->format('Y-m-d') !== $dateValue || $dateValue < date('Y-m-d')) {
            $errors['reservation_date'] = 'Choose a valid date that is today or later.';
        } else {
            $validated['reservation_date'] = $dateValue;
        }
    }

    if (array_key_exists('reservation_time', $input)) {
        $timeValue = is_string($input['reservation_time']) ? $input['reservation_time'] : '';
        if (preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $timeValue) !== 1) {
            $errors['reservation_time'] = 'Choose a valid reservation time.';
        } else {
            $validated['reservation_time'] = $timeValue;
        }
    }

    if (array_key_exists('party_size', $input)) {
        $partySize = filter_var($input['party_size'], FILTER_VALIDATE_INT);
        if ($partySize === false || $partySize < 1 || $partySize > 20) {
            $errors['party_size'] = 'Party size must be between 1 and 20.';
        } else {
            $validated['party_size'] = $partySize;
        }
    }

    if (array_key_exists('notes', $input)) {
        $notes = is_string($input['notes']) ? trim($input['notes']) : '';
        if (strlen($notes) > 1000) {
            $errors['notes'] = 'Notes must be 1000 characters or fewer.';
        } else {
            $validated['notes'] = $notes;
        }
    }

    if (array_key_exists('status', $input)) {
        $status = $input['status'];
        if (!is_string($status) || !in_array($status, ['Pending', 'Confirmed', 'Cancelled'], true)) {
            $errors['status'] = 'Status must be Pending, Confirmed, or Cancelled.';
        } else {
            $validated['status'] = $status;
        }
    }

    if ($errors !== []) {
        respond(422, ['message' => 'Please correct the reservation details.', 'errors' => $errors]);
    }
    return $validated;
}

$idValue = $_GET['id'] ?? null;
$id = null;
if ($idValue !== null) {
    if (!is_string($idValue) && !is_int($idValue)) {
        respond(400, ['message' => 'Reservation ID must be a positive integer.']);
    }
    $id = filter_var($idValue, FILTER_VALIDATE_INT);
    if ($id === false || $id < 1) {
        respond(400, ['message' => 'Reservation ID must be a positive integer.']);
    }
}

$requestData = null;
if ($method === 'POST') {
    $requestData = validate_reservation(parse_request_body());
} elseif ($method === 'PATCH') {
    $requestData = validate_reservation(parse_request_body(), true);
}

try {
    $pdo = database_connection();

    if ($method === 'GET') {
        if ($id !== null) {
            $statement = $pdo->prepare('SELECT * FROM reservations WHERE id = :id');
            $statement->execute(['id' => $id]);
            $reservation = $statement->fetch();
            if ($reservation === false) {
                respond(404, ['message' => 'Reservation not found.']);
            }
            respond(200, ['data' => $reservation]);
        }
        $statement = $pdo->query('SELECT * FROM reservations ORDER BY reservation_date ASC, reservation_time ASC, created_at DESC');
        respond(200, ['data' => $statement->fetchAll()]);
    }

    if ($method === 'POST') {
        $reservation = $requestData;
        $statement = $pdo->prepare(
            'INSERT INTO reservations (customer_name, email, phone, reservation_date, reservation_time, party_size, notes, status)
             VALUES (:customer_name, :email, :phone, :reservation_date, :reservation_time, :party_size, :notes, :status)'
        );
        $statement->execute([
            'customer_name' => $reservation['customer_name'],
            'email' => $reservation['email'],
            'phone' => $reservation['phone'],
            'reservation_date' => $reservation['reservation_date'],
            'reservation_time' => $reservation['reservation_time'],
            'party_size' => $reservation['party_size'],
            'notes' => $reservation['notes'] ?? '',
            'status' => 'Pending',
        ]);
        $statement = $pdo->prepare('SELECT * FROM reservations WHERE id = :id');
        $statement->execute(['id' => $pdo->lastInsertId()]);
        respond(201, ['message' => 'Reservation request received. We will contact you to confirm.', 'data' => $statement->fetch()]);
    }

    if ($id === null) {
        respond(400, ['message' => 'A reservation ID is required.']);
    }

    $statement = $pdo->prepare('SELECT * FROM reservations WHERE id = :id');
    $statement->execute(['id' => $id]);
    $existing = $statement->fetch();
    if ($existing === false) {
        respond(404, ['message' => 'Reservation not found.']);
    }

    if ($method === 'PATCH') {
        $changes = $requestData;
        $assignments = [];
        foreach ($changes as $field => $value) {
            $assignments[] = $field . ' = :' . $field;
        }
        $assignments[] = 'updated_at = CURRENT_TIMESTAMP';
        $changes['id'] = $id;
        $statement = $pdo->prepare('UPDATE reservations SET ' . implode(', ', $assignments) . ' WHERE id = :id');
        $statement->execute($changes);
        $statement = $pdo->prepare('SELECT * FROM reservations WHERE id = :id');
        $statement->execute(['id' => $id]);
        respond(200, ['message' => 'Reservation updated.', 'data' => $statement->fetch()]);
    }

    if ($method === 'DELETE') {
        $statement = $pdo->prepare('DELETE FROM reservations WHERE id = :id');
        $statement->execute(['id' => $id]);
        respond(200, ['message' => 'Reservation deleted.']);
    }
} catch (PDOException $exception) {
    error_log('Restaurant reservation database error: ' . $exception->getMessage());
    respond(500, ['message' => 'The reservation service is temporarily unavailable. Please try again later.']);
} catch (Throwable $exception) {
    error_log('Restaurant reservation API error: ' . $exception->getMessage());
    respond(500, ['message' => 'The request could not be completed. Please try again later.']);
}
