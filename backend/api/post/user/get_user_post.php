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
    COUNT(DISTINCT l.user_id) AS likes,
    COUNT(DISTINCT c.id) AS comments

FROM posts p

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

    // IMAGES
    $stmtImages = $pdo->prepare("
    SELECT img.id, img.post_id, img.image_url
    FROM post_images img
    INNER JOIN posts p ON p.id = img.post_id
    WHERE p.user_id = ?
    ORDER BY img.position ASC
");
    $stmtImages->execute([$id]);
    $images = $stmtImages->fetchAll(PDO::FETCH_ASSOC);


    // TAGS
    $stmtTags = $pdo->prepare("
    SELECT rel.post_id, t.id, t.name
    FROM post_tag_rel rel
    INNER JOIN post_tags t ON t.id = rel.tag_id
    INNER JOIN posts p ON p.id = rel.post_id
    WHERE p.user_id = ?
");
    $stmtTags->execute([$id]);
    $tags = $stmtTags->fetchAll(PDO::FETCH_ASSOC);

    $postTagsMap = [];

    foreach ($tags as $tag) {
        $postTagsMap[$tag['post_id']][] = [
            'id' => (int)$tag['id'],
            'name' => $tag['name']
        ];
    }

    $postImagesMap = [];

    foreach ($images as $img) {
        $postId = (int) $img['post_id'];
        $postImagesMap[$postId][] = [
            'id' => (int) $img['id'],
            'image_url' => $img['image_url']
        ];
    }

    foreach ($user_posts as &$post) {
        $post['id'] = (int) $post['id'];
        $post['likes'] = (int) $post['likes'];
        $post['comments'] = (int) $post['comments'];
        $post['tags'] = $postTagsMap[$post['id']] ?? [];
        $post['images'] = $postImagesMap[$post['id']] ?? [];
    }
    unset($post);


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