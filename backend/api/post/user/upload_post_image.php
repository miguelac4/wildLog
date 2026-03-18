<?php
require_once __DIR__ . '/../../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../../includes/api_error.php';
require_once __DIR__ . '/../../../includes/image_lib.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../../includes/db.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
}

if (empty($_SESSION["is_login"]) || empty($_SESSION['user']['id'])) {
    api_json_error(401, 'UNAUTHORIZED', 'Sessão inválida. Faça login.');
}

// Data sent via multipart/form-data
$data = $_POST;

if (!is_array($data)) {
    api_json_error(400, 'BAD_REQUEST', 'Body inválido. Envie JSON.');
}

$user_id = (int) $_SESSION['user']['id'];

// data from form
$post_id = $data['post_id'];

// Basic validation
$errors = [];

$maxFileSize = 5 * 1024 * 1024; // 5MB

$images = $_FILES['images'] ?? null;

if ($images && !is_array($images['name'])) {
    $images = [
        'name' => [$images['name']],
        'type' => [$images['type']],
        'tmp_name' => [$images['tmp_name']],
        'error' => [$images['error']],
        'size' => [$images['size']],
    ];
}

if (!$images || empty($images['name'])) {
    $errors[] = 'Images are required.';
}

$imageCount = is_array($images['name']) ? count($images['name']) : 1;
if ($imageCount > 5) {
    $errors[] = 'Maximum 5 images allowed.';
}

/**
 * Validate MIME type using finfo
 * Prevents malicious file uploads disguised as images
 */
$finfo = new finfo(FILEINFO_MIME_TYPE);

if (!isset($images['tmp_name'])) {
    api_json_error(400, 'BAD_REQUEST', 'Invalid images structure.');
}

foreach ($images['tmp_name'] as $i => $tmpPath) {

    if ($images['error'][$i] !== UPLOAD_ERR_OK) {
        $errors[] = "Image {$i} upload error.";
        continue;
    }

    if ($images['size'][$i] > $maxFileSize) {
        $errors[] = "Image {$i} exceeds 5MB.";
        continue;
    }

    $mime = $finfo->file($tmpPath);

    if (strpos($mime, 'image/') !== 0) {
        $errors[] = "Image {$i} is not a valid image.";
    }

    if (!in_array($mime, ['image/jpeg','image/png','image/webp'], true)) {
        $errors[] = "Image {$i} type not allowed.";
    }
}

if (!$post_id || !is_numeric($post_id)) {
    $errors[] = 'Invalid post_id.';
}

if ($errors) {
    api_json_error(400, 'BAD_REQUEST', implode(' ', $errors));
}

$imagePaths = [];
$createdFiles = [];

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();

    # Verificar se o user é dono do post
    $stmt = $pdo->prepare("SELECT user_id FROM posts WHERE id = ?");
    $stmt->execute([$post_id]);
    $post = $stmt->fetch();

    if (!$post) {
        $pdo->rollBack();
        api_json_error(404, 'NOT_FOUND', 'Post not found.');
    }

    if ((int)$post['user_id'] !== $user_id) {
        $pdo->rollBack();
        api_json_error(403, 'FORBIDDEN', 'No permission to modify this post.');
    }

    // Create post directory for images
    $postDir = __DIR__ . "/../../../upload/user/post/{$post_id}";

    if (!is_dir($postDir) && !mkdir($postDir, 0755, true)) {
        $pdo->rollBack();
        api_json_error(500, 'UPLOAD_ERROR', 'Could not create post directory.');
    }

    # Verificar se o número total de imagens do post não excede 5
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM post_images WHERE post_id = ? FOR UPDATE");
    $stmt->execute([$post_id]);
    $currentCount = (int)$stmt->fetchColumn();

    if ($currentCount + $imageCount > 5) {
        $pdo->rollBack();
        api_json_error(400, 'BAD_REQUEST', 'Maximum 5 images per post.');
    }
    $insImg = $pdo->prepare("
    INSERT INTO post_images (post_id, image_url, position)
    VALUES (?, ?, ?)
");

    $position = $currentCount;

    // Convert uploaded images to WEBP and store them
    foreach ($images['tmp_name'] as $i => $tmpPath) {

        $mime = $finfo->file($tmpPath);

        $filename = "{$post_id}_" . uniqid('', true) . ".webp";
        $dest = $postDir . "/" . $filename;

        if (!image_convert_to_webp($tmpPath, $dest, $mime)) {

            // On failure rollback transaction and cleanup files
            $pdo->rollBack();

            foreach ($createdFiles as $f) {
                if (file_exists($f)) unlink($f);
            }

            api_json_error(500, 'UPLOAD_ERROR', "Failed converting image {$i}");
        }

        $relativePath = "/backend/upload/user/post/{$post_id}/{$filename}";

        $imagePaths[] = $relativePath;
        $createdFiles[] = $dest;

        $insImg->execute([$post_id, $relativePath, $position++]);
    }
    // Commit transaction
    $pdo->commit();

    echo json_encode([
        'created' => true,
        'user_id' => $user_id,
        'post_id' => $post_id,
        'images' => $imagePaths,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    $sqlState = $e->getCode();
    $errInfo = $e->errorInfo ?? null;
    $mysqlErr = is_array($errInfo) ? ($errInfo[1] ?? null) : null;

    if ($sqlState === '23000' && $mysqlErr === 1062) {
        api_json_error(409, 'CONFLICT', 'MySQL error = duplicate entry.');
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/upload_post_image.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);

} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/upload_post_image.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}
