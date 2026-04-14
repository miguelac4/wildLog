<?php
require_once __DIR__ . '/../../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../../includes/api_error.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../../includes/db.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
}

if (empty($_SESSION["is_login"]) || empty($_SESSION['user']['id'])) {
    api_json_error(401, 'UNAUTHORIZED', 'Sessão inválida. Faça login.');
}

header('Content-Type: application/json');

$id = (int) $_SESSION['user']['id'];
$post_id = $_GET['post_id'] ?? null;

if (!$post_id) {
    api_json_error(400, 'BAD_REQUEST', 'ID do post é obrigatório.');
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $del = $pdo->prepare("
DELETE FROM posts
WHERE id = ?
AND user_id = ?
");
    $del->execute([$post_id, $id]);

    if ($del->rowCount() === 0) {
        api_json_error(404, 'NOT_FOUND', 'Post não encontrado.');
    }

    echo json_encode(['deleted' => true, 'id' => $post_id], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (PDOException $e) {
    $sqlState = $e->getCode();
    $errInfo = $e->errorInfo ?? null;
    $mysqlErr = is_array($errInfo) ? ($errInfo[1] ?? null) : null;

    // integridade referencial (MySQL 1451)
    if ($sqlState === '23000' || $mysqlErr === 1451) {
        api_json_error(409, 'CONFLICT', 'Não é possível apagar o post porque existem registos associados.');
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/delete.php',
        'userId'   => $_SESSION['user']['id'] ?? null,
        'id_post'     => $post_id,
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);

} catch (Throwable $e) {
    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/delete.php',
        'userId'   => $_SESSION['user']['id'] ?? null,
        'id_post'     => $post_id,
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}
