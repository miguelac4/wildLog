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

$lat = $_GET['lat'] ?? null;
$lng = $_GET['lng'] ?? null;

if (!is_numeric($lat) || !is_numeric($lng)) {
    api_json_error(400, 'BAD_REQUEST', 'Latitude e longitude são obrigatórias.');
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("
SELECT
    p.id,
    u.username AS author,
    p.title,
    p.created_at,

    GROUP_CONCAT(DISTINCT t.name) AS tags,
    COUNT(DISTINCT l.user_id) AS likes,
    COUNT(DISTINCT c.id) AS comments,

    (
        6371 * acos(
            cos(radians(?))
            * cos(radians(p.lat))
            * cos(radians(p.lng) - radians(?))
            + sin(radians(?))
            * sin(radians(p.lat))
        )
    ) AS distance

FROM posts p

JOIN users u
    ON u.id = p.user_id

LEFT JOIN post_tag_rel rel
    ON rel.post_id = p.id

LEFT JOIN post_tags t
    ON t.id = rel.tag_id

LEFT JOIN post_likes l
    ON l.post_id = p.id

LEFT JOIN post_comments c
    ON c.post_id = p.id

WHERE p.visibility = 'public'
AND p.status = 'approved'

GROUP BY p.id

ORDER BY distance ASC

LIMIT 5
");

    $stmt->execute([$lat, $lng, $lat]);

    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($posts as &$post) {
        $post['tags'] = $post['tags']
            ? explode(',', $post['tags'])
            : [];
    }

    echo json_encode([
        'posts' => $posts
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;

} catch (Throwable $e) {

    api_log_exception($e, $requestId, [
        'endpoint' => '.../explore/get_nearby_posts.php',
        'userId'   => $_SESSION['user']['id'] ?? null,
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}