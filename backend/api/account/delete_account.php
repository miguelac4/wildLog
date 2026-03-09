<?php
require_once __DIR__ . '/../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../includes/api_error.php';
$requestId = api_request_id();

require_once __DIR__ . '/../../includes/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] !== "DELETE") {
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
$password = trim($input['password'] ?? '');
$confirmText = trim($input['confirm_text'] ?? '');

if ($password === '' || $confirmText === '') {
    api_json_error(400, 'BAD_REQUEST', 'Palavra-passe e DELETE obrigatórios.');
}

if ($confirmText !== "DELETE") {
    api_json_error(400, 'BAD_REQUEST', 'A confirmação DELETE não coincide.');
}

function deleteDirectoryRecursive(string $dir): bool
{
    if (!is_dir($dir)) {
        return true;
    }

    $items = scandir($dir);
    if ($items === false) {
        return false;
    }

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }

        $path = $dir . DIRECTORY_SEPARATOR . $item;

        if (is_dir($path)) {
            if (!deleteDirectoryRecursive($path)) {
                return false;
            }
        } else {
            if (!unlink($path)) {
                return false;
            }
        }
    }

    return rmdir($dir);
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmtUser = $pdo->prepare("
        SELECT id, password, avatar
        FROM users
        WHERE id = ?
        LIMIT 1
    ");
    $stmtUser->execute([$id]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        api_json_error(404, 'NOT_FOUND', 'Conta não encontrada.');
    }

    if (!password_verify($password, $user['password'])) {
        api_json_error(400, 'INVALID_PASSWORD', 'A palavra-passe atual está incorreta.');
    }

    $pdo->beginTransaction();

    $dlt = $pdo->prepare("
        DELETE FROM users
        WHERE id = ?
    ");
    $dlt->execute([$id]);

    $pdo->commit();

    // apagar diretoria de uploads do utilizador, se existir
    $userUploadDir = __DIR__ . '/../../upload/user/avatar/' . $id;

    if (is_dir($userUploadDir)) {
        deleteDirectoryRecursive($userUploadDir);
    }

    // destruir sessão
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }

    session_destroy();

    echo json_encode([
        'message' => 'Conta eliminada com sucesso.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '/account/delete_account.php',
        'userId'   => $_SESSION['user']['id'] ?? null
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}