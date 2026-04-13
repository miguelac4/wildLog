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

if (empty($data)) {
    $raw = file_get_contents("php://input");
    $json = json_decode($raw, true);

    if (is_array($json)) {
        $data = $json;
    }
}

if (!is_array($data)) {
    api_json_error(400, 'BAD_REQUEST', 'Body inválido.');
}

$user_id = (int) $_SESSION['user']['id'];

$post_id = $data['post_id'] ?? null;

// Validation
$errors = [];

if (!$post_id || !is_numeric($post_id)) {
    $errors[] = 'Invalid post_id.';
}

if ($errors) {
    api_json_error(400, 'BAD_REQUEST', implode(' ', $errors));
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();

    // Check post n visibility
    $stmt = $pdo->prepare("SELECT user_id, visibility FROM posts WHERE id = ?");
    $stmt->execute([$post_id]);
    $post = $stmt->fetch();

    if (!$post || $post['visibility'] != "public") {
        $pdo->rollBack();
        api_json_error(404, 'NOT_FOUND', 'Public post not found.');
    }

    $stmt = $pdo->prepare("
    DELETE FROM post_bookmark 
    WHERE user_id = ? AND post_id = ?
");
    $stmt->execute([$user_id, $post_id]);

    if ($stmt->rowCount() === 0) {
        $pdo->rollBack();
        api_json_error(404, 'BOOKMARK_NOT_FOUND', 'Post is not bookmarked by the user.');
    }

    $pdo->commit();

    echo json_encode([
        'deleted' => true,
        'user_id' => $user_id,
        'post_id' => $post_id,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (PDOException $e) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/bookmark/unsave_post.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);

} catch (Throwable $e) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/bookmark/unsave_post.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}