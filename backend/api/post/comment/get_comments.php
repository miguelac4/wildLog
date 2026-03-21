<?php
require_once __DIR__ . '/../../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../../includes/api_error.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../../includes/db.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
}

if (empty($_SESSION["is_login"]) || empty($_SESSION['user']['id'])) {
    api_json_error(401, 'UNAUTHORIZED', 'Sessão inválida. Faça login.');
}

$post_id = (int)($_GET['post_id'] ?? 0);

if (!$post_id) {
    api_json_error(400, 'BAD_REQUEST', 'Invalid post_id.');
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check ownership
    $stmt = $pdo->prepare("
        SELECT 
            c.id,
            c.comment,
            c.created_at,
            u.username
        FROM post_comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at DESC
    ");

    $stmt->execute([$post_id]);
    $post_comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'post_id' => $post_id,
        'comments' => $post_comments
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (PDOException $e) {

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/comment/get_comments.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);

} catch (Throwable $e) {

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/comment/get_comments.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}