<?php
require_once __DIR__ . '/../../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../../includes/api_error.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../../includes/db.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "DELETE") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
}

if (empty($_SESSION["is_login"]) || empty($_SESSION['user']['id'])) {
    api_json_error(401, 'UNAUTHORIZED', 'Sessão inválida. Faça login.');
}

// Data
parse_str(file_get_contents("php://input"), $data);

if (!is_array($data)) {
    api_json_error(400, 'BAD_REQUEST', 'Body inválido.');
}

$user_id = (int) $_SESSION['user']['id'];
$comment_id = trim($data['comment_id'] ?? '');

// Validation
$errors = [];

if (!$comment_id || !is_numeric($comment_id)) {
    $errors[] = 'Invalid comment_id.';
}

if ($errors) {
    api_json_error(400, 'BAD_REQUEST', implode(' ', $errors));
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check ownership
    $stmt = $pdo->prepare("SELECT user_id, post_id FROM post_comments WHERE id = ?");
    $stmt->execute([$comment_id]);
    $comment = $stmt->fetch();

    if (!$comment) {
        api_json_error(404, 'NOT_FOUND', 'Comment not found.');
    }

    $post_id = $comment['post_id'];

    if ((int)$comment['user_id'] !== $user_id) {
        api_json_error(403, 'FORBIDDEN', 'No permission.');
    }

    // Delete comment
    $stmt = $pdo->prepare("
        DELETE FROM post_comments
        WHERE id = ?
    ");
    $stmt->execute([$comment_id]);


    echo json_encode([
        'deleted' => true,
        'comment_id' => $comment_id,
        'post_id' => $post_id
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (PDOException $e) {

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/delete_comment.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);

} catch (Throwable $e) {

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/delete_comment.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}