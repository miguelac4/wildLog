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

$post_id  = $data['post_id']  ?? null;
$image_id = $data['image_id'] ?? null;

// Validation
$errors = [];

if (!$post_id || !is_numeric($post_id)) {
    $errors[] = 'Invalid post_id.';
}

if (!$image_id || !is_numeric($image_id)) {
    $errors[] = 'Invalid image_id.';
}

if ($errors) {
    api_json_error(400, 'BAD_REQUEST', implode(' ', $errors));
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();

    // Check post ownership
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

    // Get image info (lock row)
    $stmt = $pdo->prepare("
        SELECT id, image_url, position 
        FROM post_images 
        WHERE id = ? AND post_id = ?
        FOR UPDATE
    ");
    $stmt->execute([$image_id, $post_id]);
    $image = $stmt->fetch();

    if (!$image) {
        $pdo->rollBack();
        api_json_error(404, 'NOT_FOUND', 'Image not found.');
    }

    $basePath = realpath(__DIR__ . "/../../../"); // backend root

    $relativePath = $image['image_url'] ?? '';

    // remover /backend apenas se existir
    if (strpos($relativePath, '/backend') === 0) {
        $relativePath = substr($relativePath, strlen('/backend'));
    }

    // normalizar slashes
    $relativePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);

    // garantir separador inicial
    if ($relativePath && $relativePath[0] !== DIRECTORY_SEPARATOR) {
        $relativePath = DIRECTORY_SEPARATOR . $relativePath;
    }

    $imagePath = $basePath . $relativePath;

    $deletedPosition = (int)$image['position'];

    // Delete from DB
    $stmt = $pdo->prepare("DELETE FROM post_images WHERE id = ?");
    $stmt->execute([$image_id]);

    // Reorder positions
    $stmt = $pdo->prepare("
        UPDATE post_images
        SET position = position - 1
        WHERE post_id = ? AND position > ?
    ");
    $stmt->execute([$post_id, $deletedPosition]);

    // Delete file from disk
    if (file_exists($imagePath)) {
        unlink($imagePath);
    }

    $pdo->commit();

    echo json_encode([
        'deleted'   => true,
        'post_id'   => $post_id,
        'image_id'  => $image_id,
        'deleted_image' => [
            'id' => (int)$image['id'],
            'url' => $image['image_url'],
            'position' => $deletedPosition
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (PDOException $e) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/delete_post_image.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);

} catch (Throwable $e) {

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/delete_post_image.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}