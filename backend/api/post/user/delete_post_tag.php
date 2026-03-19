<?php
require_once __DIR__ . '/../../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../../includes/api_error.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../../includes/db.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
}

if (empty($_SESSION["is_login"]) || empty($_SESSION['user']['id'])) {
    api_json_error(401, 'UNAUTHORIZED', 'Sessão inválida. Faça login.');
}

// Data
$data = $_POST;

if (!is_array($data)) {
    api_json_error(400, 'BAD_REQUEST', 'Body inválido.');
}

$user_id = (int) $_SESSION['user']['id'];

$post_id = $data['post_id'] ?? null;
$tag_id  = $data['tag_id'] ?? null;

// Validation
$errors = [];

if (!$post_id || !is_numeric($post_id)) {
    $errors[] = 'Invalid post_id.';
}

if (!$tag_id || !is_numeric($tag_id)) {
    $errors[] = 'Invalid tag_id.';
}

if ($errors) {
    api_json_error(400, 'BAD_REQUEST', implode(' ', $errors));
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();

    // Check ownership
    $stmt = $pdo->prepare("SELECT user_id FROM posts WHERE id = ?");
    $stmt->execute([$post_id]);
    $post = $stmt->fetch();

    if (!$post) {
        $pdo->rollBack();
        api_json_error(404, 'NOT_FOUND', 'Post not found.');
    }

    if ((int)$post['user_id'] !== $user_id) {
        $pdo->rollBack();
        api_json_error(403, 'FORBIDDEN', 'No permission.');
    }

    // Check if relation exists (lock)
    $stmt = $pdo->prepare("
        SELECT 1 
        FROM post_tag_rel 
        WHERE post_id = ? AND tag_id = ?
        FOR UPDATE
    ");
    $stmt->execute([$post_id, $tag_id]);

    if (!$stmt->fetch()) {
        $pdo->rollBack();
        api_json_error(404, 'NOT_FOUND', 'Tag not found on this post.');
    }

    // Delete relation
    $stmt = $pdo->prepare("
        DELETE FROM post_tag_rel 
        WHERE post_id = ? AND tag_id = ?
    ");
    $stmt->execute([$post_id, $tag_id]);

    $pdo->commit();

    echo json_encode([
        'deleted' => true,
        'post_id' => $post_id,
        'tag_id'  => $tag_id
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (PDOException $e) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/delete_post_tag.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);

} catch (Throwable $e) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/delete_post_tag.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}