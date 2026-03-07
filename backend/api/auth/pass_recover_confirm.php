<?php
require_once __DIR__ . '/../../includes/cors.php';
ini_set('display_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/../../includes/api_error.php';
$requestId = api_request_id();

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    header('Content-Type: application/json');
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Method not allowed.', $requestId);
}

require_once __DIR__ . '/../../includes/db.php';

$token = trim((string)($_GET["token"] ?? ''));

// TODO Ajustar URLs de redirecionamento para o frontend WildLog
$frontendBase = "https://wild-log.com";
$okRedirect   = $frontendBase . "/reset-password?token=" . urlencode($token);
$errRedirect  = $frontendBase . "/login?error=invalid_reset_link";

if ($token === '' || !preg_match('/^[A-Za-z0-9\-_]{20,200}$/', $token)) {
    header("Location: $errRedirect", true, 302);
    exit;
}

$tokenHash = hash('sha256', $token);

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("
        SELECT expires_at, consumed_at
        FROM user_tokens
        WHERE token_hash = ? AND type = 'resetPass'
        LIMIT 1
    ");
    $stmt->execute([$tokenHash]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        header("Location: $errRedirect", true, 302);
        exit;
    }

    // Se já consumido
    if (!empty($row["consumed_at"])) {
        header("Location: $errRedirect", true, 302);
        exit;
    }

    // Se expirado
    $expiresTs = strtotime((string)$row["expires_at"]);
    if ($expiresTs === false || $expiresTs < time()) {
        header("Location: $errRedirect", true, 302);
        exit;
    }

    header("Location: $okRedirect", true, 302);
    exit;

} catch (Throwable $e) {
    api_log_exception($e, $requestId, [
        'endpoint' => '.../auth/pass_recover_confirm.php',
    ]);

    header("Location: $frontendBase/reset-password?error=server_error", true, 302);
    exit;
}