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
$name = trim($input['name'] ?? '');
$description = isset($input['description']) ? trim($input['description']) : null;

$errors = [];

if ($name === '') {
    $errors[] = 'Nome é obrigatório.';
} elseif (mb_strlen($name) > 50) {
    $errors[] = 'Nome deve ter no máximo 50 caracteres.';
}

if ($description !== null && mb_strlen($description) > 255) {
    $errors[] = 'Descrição deve ter no máximo 255 caracteres.';
}

if (!empty($errors)) {
    api_json_error(400, 'BAD_REQUEST', implode(' ', $errors));
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmtExist = $pdo->prepare("
        SELECT id
        FROM users
        WHERE id = ?
        LIMIT 1
    ");
    $stmtExist->execute([$id]);

    if (!$stmtExist->fetchColumn()) {
        api_json_error(404, 'NOT_FOUND', 'Conta não encontrada.');
    }

    $upd = $pdo->prepare("
        UPDATE users
        SET name = ?, description = ?
        WHERE id = ?
    ");
    $upd->execute([$name, $description, $id]);

    // opcional: sincronizar a sessão
    $_SESSION['user']['name'] = $name;
    $_SESSION['user']['description'] = $description;

    echo json_encode([
        'account' => [
            'id' => $id,
            'name' => $name,
            'description' => $description,
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    api_log_exception($e, $requestId, [
        'endpoint' => '/account/edit_account_info.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}