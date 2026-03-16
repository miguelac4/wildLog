<?php
require_once __DIR__ . '/../../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../../includes/api_error.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../../includes/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] !== "PATCH") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
}

if (empty($_SESSION["is_login"]) || empty($_SESSION['user']['id'])) {
    api_json_error(401, 'UNAUTHORIZED', 'Sessão inválida. Faça login.');
}

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    api_json_error(400, 'BAD_REQUEST', 'Body JSON inválido.');
}

$id = (int) $_SESSION['user']['id'];
$post_id = isset($input['post_id']) ? (int)$input['post_id'] : 0;

if ($post_id <= 0) {
    api_json_error(400, 'BAD_REQUEST', 'post_id é obrigatório.');
}

$fields = [];
$params = [];
$errors = [];

/* TITLE */
if (array_key_exists('title', $input)) {
    $title = trim($input['title']);

    if (mb_strlen($title) > 100) {
        $errors[] = 'Title deve ter no máximo 100 caracteres.';
    }

    $fields[] = "title = ?";
    $params[] = $title;
}

/* DESCRIPTION */
if (array_key_exists('description', $input)) {
    $description = trim($input['description']);

    if (mb_strlen($description) > 500) {
        $errors[] = 'Descrição deve ter no máximo 500 caracteres.';
    }

    $fields[] = "description = ?";
    $params[] = $description;
}

/* VISIBILITY */
if (array_key_exists('visibility', $input)) {
    $visibility = trim($input['visibility']);

    if (!in_array($visibility, ['private', 'public'], true)) {
        $errors[] = 'visibility must be private or public.';
    }

    $fields[] = "visibility = ?";
    $params[] = $visibility;
}

if (!empty($errors)) {
    api_json_error(400, 'BAD_REQUEST', implode(' ', $errors));
}

if (empty($fields)) {
    api_json_error(400, 'BAD_REQUEST', 'Nenhum campo para atualizar.');
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "
        UPDATE posts
        SET " . implode(', ', $fields) . "
        WHERE id = ? AND user_id = ?
    ";

    $params[] = $post_id;
    $params[] = $id;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0) {
        api_json_error(404, 'NOT_FOUND', 'Post não encontrado.');
    }

    $sel = $pdo->prepare("
    SELECT id, title, description, visibility
    FROM posts
    WHERE id = ? AND user_id = ?
    LIMIT 1
");

    $sel->execute([$post_id, $id]);
    $post = $sel->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'updated' => true,
        'post' => $post
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;

} catch (Throwable $e) {
    api_log_exception($e, $requestId, [
        'endpoint' => '/post/explore/edit.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}