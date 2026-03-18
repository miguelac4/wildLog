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
$files = $_FILES['images'] ?? null;

if (!is_array($data)) {
    api_json_error(400, 'BAD_REQUEST', 'Body inválido. Envie JSON.');
}

// Helpers to normalize string inputs
$trim_str = function ($v) {
    return is_string($v) ? trim($v) : '';
};

$user_id = (int) $_SESSION['user']['id'];
$status = 'draft';

// data from form
$title = $trim_str($data['title'] ?? '');
$description         = $trim_str($data['description'] ?? null);
$lat       = $trim_str($data['lat'] ?? '');
$lng    = $trim_str($data['lng'] ?? '');
$visibility     = $trim_str($data['visibility'] ?? '');
$tagsIn  = $data['tags'] ?? []; // array de tags
$post_images  = $data['post_images'] ?? []; // array de images

// public posts require environmental/ethical review
if ($visibility === 'public') {
    $status = 'pending_review';
}

// Basic validation
$errors = [];

$maxFileSize = 5 * 1024 * 1024; // 5MB

// Clean tags: remove duplicates, trim and lowercase
$tagsIn = array_unique(array_map(function($t){
    return strtolower(trim($t));
}, $tagsIn));


if ($title === '' || mb_strlen($title) > 100) $errors[] = 'title is mandatory (max 100).';
if (!is_numeric($lat) || !is_numeric($lng)) {
    $errors[] = 'Latitude and Longitude must be numeric.';
}

if ($lat < -90 || $lat > 90) {
    $errors[] = 'Latitude out of range.';
}

if ($lng < -180 || $lng > 180) {
    $errors[] = 'Longitude out of range.';
}

if (!in_array($visibility, ['private', 'public'], true)) {
    $errors[] = 'visibility must be private or public.';
}

if (count($tagsIn) > 5) {
    $errors[] = 'Maximum 5 tags allowed.';
}

$images = $_FILES['images'] ?? null;
if (!$images || !is_array($images['name'])) {
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

if ($errors) {
    api_json_error(400, 'BAD_REQUEST', implode(' ', $errors));
}

$imagePaths = [];

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();

    // Insert post
    $insPost = $pdo->prepare("
        INSERT INTO posts (user_id, title, description, lat, lng, visibility, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $insPost->execute([$user_id, $title, $description, $lat, $lng, $visibility, $status]);

    $idPost = (int)$pdo->lastInsertId();

    // Create post directory for images
    $postDir = __DIR__ . "/../../../upload/user/post/{$idPost}";

    if (!is_dir($postDir) && !mkdir($postDir, 0755, true)) {
        $pdo->rollBack();
        api_json_error(500, 'UPLOAD_ERROR', 'Could not create post directory.');
    }

    $insImg = $pdo->prepare("
    INSERT INTO post_images (post_id, image_url, position)
    VALUES (?, ?, ?)
");

    // Convert uploaded images to WEBP and store them
    foreach ($images['tmp_name'] as $i => $tmpPath) {

        $mime = $finfo->file($tmpPath);

        $filename = "{$idPost}_" . uniqid('', true) . ".webp";
        $dest = $postDir . "/" . $filename;

        if (!image_convert_to_webp($tmpPath, $dest, $mime)) {

            // On failure rollback transaction and cleanup files
            $pdo->rollBack();

            $files = glob("$postDir/*");
            if ($files) {
                foreach ($files as $f) {
                    unlink($f);
                }
            }
            rmdir($postDir);

            api_json_error(500, 'UPLOAD_ERROR', "Failed converting image {$i}");
        }

        $relativePath = "/backend/upload/user/post/{$idPost}/{$filename}";

        $imagePaths[] = $relativePath;

        $insImg->execute([$idPost, $relativePath, $i]);
    }

    // Insert post tags
    $createdTags = [];

    if (count($tagsIn) > 0) {
        $tagStmt = $pdo->prepare("SELECT id FROM post_tags WHERE name = ?");
        $insertTag = $pdo->prepare("INSERT INTO post_tags (name) VALUES (?)");
        $relTag = $pdo->prepare("INSERT INTO post_tag_rel (post_id, tag_id) VALUES (?, ?)");

        foreach ($tagsIn as $name) {

            $name = $trim_str($name);

            $tagStmt->execute([$name]);
            $tag = $tagStmt->fetch(PDO::FETCH_ASSOC);

            if ($tag) {
                $tagId = $tag['id'];
            } else {
                $insertTag->execute([$name]);
                $tagId = $pdo->lastInsertId();
            }

            $relTag->execute([$idPost, $tagId]);
            $createdTags[] = $name;
        }
    }

    // Commit transaction
    $pdo->commit();

    echo json_encode([
        'created' => true,
        'post' => [
            'id'     => $idPost,
            'title' => $title,
            'description'           => $description,
            'lat'        => $lat,
            'lng'     => $lng,
            'visibility'      => $visibility,
        ],
        'tags' => $createdTags,
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

    // NIF UNIQUE
    if ($sqlState === '23000' && $mysqlErr === 1062) {
        api_json_error(409, 'CONFLICT', 'MySQL error = duplicate entry.');
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/create.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);

} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../post/user/create.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}
