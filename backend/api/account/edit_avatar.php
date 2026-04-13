<?php
require_once __DIR__ . '/../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../includes/api_error.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../includes/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    api_json_error(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
}

if (empty($_SESSION["is_login"]) || empty($_SESSION['user']['id'])) {
    api_json_error(401, 'UNAUTHORIZED', 'Sessão inválida. Faça login.');
}

$id = (int) $_SESSION['user']['id'];

if (!isset($_FILES['avatar'])) {
    api_json_error(400, 'BAD_REQUEST', 'Ficheiro de avatar obrigatório.');
}

$file = $_FILES['avatar'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    api_json_error(400, 'BAD_REQUEST', 'Erro no upload do ficheiro.');
}

if ($file['size'] > 5 * 1024 * 1024) {
    api_json_error(400, 'BAD_REQUEST', 'Ficheiro demasiado grande.');
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowed = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
];

if (!isset($allowed[$mime])) {
    api_json_error(400, 'BAD_REQUEST', 'Tipo de ficheiro não permitido. Use JPG, PNG ou WEBP.');
}

if (!is_uploaded_file($file['tmp_name'])) {
    api_json_error(400, 'BAD_REQUEST', 'Upload inválido.');
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmtExist = $pdo->prepare("
        SELECT avatar
        FROM users
        WHERE id = ?
        LIMIT 1
    ");
    $stmtExist->execute([$id]);
    $currentUser = $stmtExist->fetch(PDO::FETCH_ASSOC);

    if (!$currentUser) {
        api_json_error(404, 'NOT_FOUND', 'Conta não encontrada.');
    }

    $pdo->beginTransaction();

    $baseDir = __DIR__ . '/../../upload/user/avatar';
    $avatarDir = $baseDir . '/' . $id;

    if (!is_dir($avatarDir)) {
        if (!mkdir($avatarDir, 0755, true) && !is_dir($avatarDir)) {
            $pdo->rollBack();
            api_json_error(500, 'INTERNAL_ERROR', 'Falha ao criar diretoria de avatares.');
        }

        // Diretory with OTHER Premission
        @chmod($avatarDir, 0755);
    }

    $ext = $allowed[$mime];
    $filename = 'avatar.' . $ext;
    $destPath = $avatarDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        $pdo->rollBack();
        api_json_error(500, 'INTERNAL_ERROR', 'Falha ao guardar a imagem.');
    }

    $avatarPath = 'upload/user/avatar/' . $id . '/' . $filename;

    $upd = $pdo->prepare("
        UPDATE users
        SET avatar = ?
        WHERE id = ?
    ");
    $upd->execute([$avatarPath, $id]);

    $pdo->commit();

    // apagar avatar anterior, se existir e for diferente
    $oldAvatar = $currentUser['avatar'] ?? null;
    if ($oldAvatar && $oldAvatar !== $avatarPath) {
        $oldFile = __DIR__ . '/../../' . ltrim($oldAvatar, '/');
        if (is_file($oldFile)) {
            @unlink($oldFile);
        }
    }

    echo json_encode([
        'account' => [
            'id'     => $id,
            'avatar' => $avatarPath,
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '/account/edit_avatar.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}