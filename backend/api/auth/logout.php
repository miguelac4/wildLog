<?php
require_once __DIR__ . '/../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../includes/api_error.php';
$requestId = api_request_id();

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    api_json_error(405, 'METHOD NOT ALLOWED', 'Método não permitido.');
}

try {
    // Limpar variáveis da sessão
    $_SESSION = [];

    // Apagar cookie da sessão
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
    }

    session_destroy();

    echo json_encode([
        'success' => true,
        'message' => 'Logout efetuado com sucesso.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    api_log_exception($e, $requestId, [
        'endpoint' => '.../auth/logout.php',
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}