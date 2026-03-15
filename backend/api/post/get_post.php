<?php
require_once __DIR__ . '/../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../includes/api_error.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../includes/db.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
}

if (empty($_SESSION["is_login"]) || empty($_SESSION['user']['id'])) {
    api_json_error(401, 'UNAUTHORIZED', 'Sessão inválida. Faça login.');
}

$post_id = $_GET['post_id'] ?? null;

if (empty($post_id)) {
    api_json_error(400, 'BAD_REQUEST', 'Post id required.');
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("
        SELECT
            p.id,
            p.title,
            p.description,
            p.created_at,
            u.username AS author,

            GROUP_CONCAT(DISTINCT t.name) AS tags,

            COUNT(DISTINCT l.user_id) AS likes

        FROM posts p

        JOIN users u
            ON u.id = p.user_id

        LEFT JOIN post_tag_rel rel
            ON rel.post_id = p.id

        LEFT JOIN post_tags t
            ON t.id = rel.tag_id

        LEFT JOIN post_likes l
            ON l.post_id = p.id

        WHERE p.id = ?

        GROUP BY p.id
        LIMIT 1
    ");
    $stmt->execute([$post_id]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$post) {
        api_json_error(404, 'NOT_FOUND', 'Post not founded.');
    }

    $stmt = $pdo->prepare("
        SELECT
            image_url,
            position
        FROM post_images
        WHERE post_id = ?
        ORDER BY position ASC
    ");

    $stmt->execute([$post_id]);
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("
        SELECT
            c.id,
            c.comment,
            c.created_at,
            u.username AS author
        FROM post_comments c
        JOIN users u
            ON u.id = c.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    ");

    $stmt->execute([$post_id]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $post['images'] = $images;
    $post['comments'] = $comments;

    echo json_encode([
        'post' => $post
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;

} catch (Throwable $e) {
    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/get_feed.php',
        'userId'   => $_SESSION['user']['id'] ?? null,
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}