<?php
require_once __DIR__ . '/../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../includes/api_error.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../includes/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
}

if (empty($_SESSION["is_login"]) || empty($_SESSION['user']['id'])) {
    api_json_error(401, 'UNAUTHORIZED', 'Sessão inválida. Faça login.');
}

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    api_json_error(400, 'BAD_REQUEST', 'Body JSON inválido.');
}

$id = (int) $_SESSION['user']['id'];
$curr_password = trim($input['curr_password'] ?? '');
$new_password = trim($input['new_password'] ?? '');
$confirm_password = trim($input['confirm_password'] ?? '');

if ($curr_password === '' || $new_password === '' || $confirm_password === '') {
    api_json_error(400, 'BAD_REQUEST', 'Palavra-passe atual, nova palavra-passe e confirmação são obrigatórias.');
}

if ($new_password !== $confirm_password) {
    api_json_error(400, 'BAD_REQUEST', 'A confirmação da nova palavra-passe não coincide.');
}

if (mb_strlen($new_password) < 8) {
    api_json_error(400, 'BAD_REQUEST', 'A palavra-passe deve ter pelo menos 8 caracteres.');
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmtUser = $pdo->prepare("
        SELECT id, password
        FROM users
        WHERE id = ?
        LIMIT 1
    ");
    $stmtUser->execute([$id]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        api_json_error(404, 'NOT_FOUND', 'Conta não encontrada.');
    }

    if (!password_verify($curr_password, $user['password'])) {
        api_json_error(400, 'INVALID_PASSWORD', 'A palavra-passe atual está incorreta.');
    }

    if (password_verify($new_password, $user['password'])) {
        api_json_error(400, 'BAD_REQUEST', 'A nova palavra-passe deve ser diferente da atual.');
    }

    $newPasswordHash = password_hash($new_password, PASSWORD_DEFAULT);

    $upd = $pdo->prepare("
        UPDATE users
        SET password = ?
        WHERE id = ?
    ");
    $upd->execute([$newPasswordHash, $id]);

    echo json_encode([
        'message' => 'Palavra-passe alterada com sucesso.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    api_log_exception($e, $requestId, [
        'endpoint' => '/account/change_password.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}