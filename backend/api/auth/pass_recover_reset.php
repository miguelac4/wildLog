<?php
require_once __DIR__ . '/../../includes/api_error.php';
$requestId = api_request_id();

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Method not allowed.', $requestId);
}

require_once __DIR__ . '/../../includes/db.php';

$input = json_decode(file_get_contents('php://input'), true);

$token = trim((string)($input["token"] ?? ''));
$newPassword = (string)($input["new_password"] ?? '');
$confirmPassword = (string)($input["confirm_password"] ?? '');

if ($token === '') api_json_error(400, 'BAD_REQUEST', 'Token is required.', $requestId);
if ($newPassword === '') api_json_error(400, 'BAD_REQUEST', 'New password is required.', $requestId);
if ($confirmPassword === '') api_json_error(400, 'BAD_REQUEST', 'Confirm password is required.', $requestId);

if (!hash_equals($newPassword, $confirmPassword)) {
    api_json_error(400, 'BAD_REQUEST', 'Passwords do not match.', $requestId);
}

if (strlen($newPassword) < 8) {
    api_json_error(400, 'BAD_REQUEST', 'Password must be at least 8 characters long.', $requestId);
}

if (!preg_match('/^[A-Za-z0-9\-_]{20,200}$/', $token)) {
    api_json_error(401, 'INVALID_TOKEN', 'Invalid or expired token.', $requestId);
}

$tokenHash = hash('sha256', $token);

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        SELECT id, user_id, expires_at, consumed_at
        FROM user_tokens
        WHERE token_hash = ? AND type = 'resetPass'
        LIMIT 1
        FOR UPDATE
    ");
    $stmt->execute([$tokenHash]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || !empty($row["consumed_at"])) {
        $pdo->rollBack();
        api_json_error(401, 'INVALID_TOKEN', 'Invalid or expired token.', $requestId);
    }

    $expiresTs = strtotime((string)$row["expires_at"]);
    if ($expiresTs === false || $expiresTs < time()) {
        // consume expired token
        $stmt = $pdo->prepare("UPDATE user_tokens SET consumed_at = NOW() WHERE id = ?");
        $stmt->execute([(int)$row["id"]]);

        $pdo->commit();
        api_json_error(401, 'INVALID_TOKEN', 'Invalid or expired token.', $requestId);
    }

    $userId = (int)$row["user_id"];

    $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
    $passwordHash = password_hash($newPassword, $algo);

    if ($passwordHash === false) {
        $pdo->rollBack();
        api_json_error(500, 'INTERNAL_ERROR', 'Could not hash password.', $requestId);
    }

    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ? LIMIT 1");
    $stmt->execute([$passwordHash, $userId]);

    if ($stmt->rowCount() < 1) {
        $pdo->rollBack();
        api_json_error(500, 'INTERNAL_ERROR', 'Could not update password.', $requestId);
    }

    $stmt = $pdo->prepare("UPDATE user_tokens SET consumed_at = NOW() WHERE id = ? AND consumed_at IS NULL");
    $stmt->execute([(int)$row["id"]]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../auth/pass_recover_reset.php',
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Unexpected error occurred.', $requestId);
}