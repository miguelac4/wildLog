<?php
require_once __DIR__ . '/../../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../../includes/api_error.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../../includes/db.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
}

if (empty($_SESSION["is_login"]) || empty($_SESSION['user']['id'])) {
    api_json_error(401, 'UNAUTHORIZED', 'Sessão inválida. Faça login.');
}

$id = (int) $_SESSION['user']['id'];

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "
SELECT
    p.id,
    p.title,
    p.description,
    p.visibility,
    p.created_at,
    MAX(img.image_url) AS image_url,
    GROUP_CONCAT(DISTINCT t.name) AS tags,
    COUNT(DISTINCT l.user_id) AS likes,
    COUNT(DISTINCT c.id) AS comments

FROM posts p

LEFT JOIN post_images img
    ON img.post_id = p.id AND img.position = 0

LEFT JOIN post_tag_rel rel
    ON rel.post_id = p.id

LEFT JOIN post_tags t
    ON t.id = rel.tag_id

LEFT JOIN post_likes l
    ON l.post_id = p.id

LEFT JOIN post_comments c
    ON c.post_id = p.id

WHERE p.user_id = ?

GROUP BY p.id

ORDER BY p.created_at DESC
";



    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);

    $user_posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($user_posts as &$post) {
        $post['tags'] = $post['tags']
            ? explode(',', $post['tags'])
            : [];
    }


    echo json_encode([
        'posts' => $user_posts,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/get_user_post.php',
        'userId'   => $_SESSION['user']['id'] ?? null,
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}