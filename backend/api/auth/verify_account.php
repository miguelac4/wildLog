<?php
require_once __DIR__ . '/../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../includes/api_error.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../includes/db.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    api_json_error(405, 'METHOD NOT ALLOWED', 'Método não permitido.');
}

$token = trim($_GET['token'] ?? '');

if ($token === '') {
    api_json_error(400, 'BAD_REQUEST', 'Token é obrigatório.');
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $tokenHash = hash('sha256', $token);

    // Procurar token válido (não consumido e não expirado)
    $stmt = $pdo->prepare("
        SELECT id, user_id, expires_at, consumed_at
        FROM user_tokens
        WHERE token_hash = ?
          AND type = 'email'
        LIMIT 1
    ");
    $stmt->execute([$tokenHash]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        api_json_error(400, 'INVALID_TOKEN', 'O link de verificação é inválido.');
    }

    if (!empty($row['consumed_at'])) {
        // Já foi usado
        echo json_encode([
            'success' => true,
            'status'  => 'already_verified',
            'message' => 'Este link já foi utilizado. Se a sua conta já está verificada, pode fazer login.'
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if (strtotime($row['expires_at']) < time()) {
        api_json_error(400, 'EXPIRED_TOKEN', 'O link de verificação expirou. Peça um novo email de verificação.');
    }

    $pdo->beginTransaction();

    // Marcar utilizador como verificado
    $stmt = $pdo->prepare("UPDATE users SET email_verified_at = NOW() WHERE id = ? AND email_verified_at IS NULL");
    $stmt->execute([(int)$row['user_id']]);

    // Consumir token
    $stmt = $pdo->prepare("UPDATE user_tokens SET consumed_at = NOW() WHERE id = ? AND consumed_at IS NULL");
    $stmt->execute([(int)$row['id']]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'status'  => 'verified',
        'message' => 'Conta verificada com sucesso. Já pode fazer login.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../auth/verify_account.php',
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}