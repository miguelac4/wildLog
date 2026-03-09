<?php
require_once __DIR__ . '/../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../includes/api_error.php';
$requestId = api_request_id();

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
}

if (
    empty($_SESSION["is_login"]) ||
    $_SESSION["is_login"] !== true ||
    empty($_SESSION["user"]) ||
    !is_array($_SESSION["user"])
) {
    api_json_error(401, 'UNAUTHORIZED', 'Utilizador não autenticado.');
}

try {
    $user = $_SESSION["user"];

    echo json_encode([
        'user' => [
            'id'    => (int)($user['id'] ?? 0),
            'username'  => $user['username'] ?? '',
            'email' => $user['email'] ?? '',
            'role'  => $user['role'] ?? ''
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    api_log_exception($e, $requestId, [
        'endpoint' => '.../auth/me.php',
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}