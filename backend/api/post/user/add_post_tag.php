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
$new_tag = trim(strtolower($data['new_tag'] ?? ''));

// Validation
$errors = [];

if (!$post_id || !is_numeric($post_id)) {
    $errors[] = 'Invalid post_id.';
}

if ($new_tag === '' || mb_strlen($new_tag) > 50) {
    $errors[] = 'Invalid tag.';
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

    // Count current tags
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM post_tag_rel 
        WHERE post_id = ?
        FOR UPDATE
    ");
    $stmt->execute([$post_id]);
    $count = (int)$stmt->fetchColumn();

    if ($count >= 5) {
        $pdo->rollBack();
        api_json_error(400, 'BAD_REQUEST', 'Maximum 5 tags per post.');
    }

    // Check if tag exists
    $stmt = $pdo->prepare("SELECT id FROM post_tags WHERE name = ?");
    $stmt->execute([$new_tag]);
    $tag = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($tag) {
        $tagId = (int)$tag['id'];
    } else {
        $stmt = $pdo->prepare("INSERT INTO post_tags (name) VALUES (?)");
        $stmt->execute([$new_tag]);
        $tagId = (int)$pdo->lastInsertId();
    }

    // Prevent duplicate relation
    $stmt = $pdo->prepare("
        SELECT 1 FROM post_tag_rel 
        WHERE post_id = ? AND tag_id = ?
    ");
    $stmt->execute([$post_id, $tagId]);

    if ($stmt->fetch()) {
        $pdo->rollBack();
        api_json_error(409, 'CONFLICT', 'Tag already exists on this post.');
    }

    // Insert relation
    $stmt = $pdo->prepare("
        INSERT INTO post_tag_rel (post_id, tag_id)
        VALUES (?, ?)
    ");
    $stmt->execute([$post_id, $tagId]);

    $pdo->commit();

    echo json_encode([
        'created' => true,
        'post_id' => (int) $post_id,
        'tag' => [
            'id' => (int) $tagId,
            'name' => $new_tag
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (PDOException $e) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/add_post_tag.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);

} catch (Throwable $e) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/add_post_tag.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}