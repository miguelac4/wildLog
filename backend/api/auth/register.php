<?php
require_once __DIR__ . '/../../includes/cors.php';
session_start();

require_once __DIR__ . '/../../includes/api_error.php';
$requestId = api_request_id();

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    api_json_error(405, 'METHOD NOT ALLOWED', 'Método não permitido.');
}

require_once __DIR__ . '/../../includes/db.php';

// enviar email
require_once __DIR__ . '/verification_mail.php';

$input = json_decode(file_get_contents('php://input'), true);

$username     = trim($input["username"] ?? '');
$email    = trim($input["email"] ?? '');
$password = (string)($input["password"] ?? '');

if ($username === '' || $email === '' || $password === '') {
    api_json_error(400, 'BAD_REQUEST', 'Username, email e palavra-passe são obrigatórios.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    api_json_error(400, 'BAD_REQUEST', 'Email inválido.');
}

if (mb_strlen($username) < 2 || mb_strlen($username) > 80) {
    api_json_error(400, 'BAD_REQUEST', 'Nome inválido.');
}

if (!preg_match('/^[a-z0-9]+$/', $username)) {
    api_json_error(400, 'BAD_REQUEST', 'Username só pode conter letras minúsculas e números.');
}

if (mb_strlen($password) < 8) {
    api_json_error(400, 'BAD_REQUEST', 'A palavra-passe deve ter pelo menos 8 caracteres.');
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Garantir que não existe email
    $stmt = $pdo->prepare("SELECT id, email_verified_at FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        api_json_error(409, 'CONFLICT', 'Este email já está registado.');
    }

    // verificar se username já existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);

    if ($stmt->fetch()) {
        api_json_error(409, 'USERNAME_TAKEN', 'Este username já está em uso.');
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    if ($passwordHash === false) {
        api_json_error(500, 'INTERNAL_ERROR', 'Não foi possível processar a palavra-passe.', $requestId);
    }

    $pdo->beginTransaction();

    // Inserir user
    $stmt = $pdo->prepare("
        INSERT INTO users (username, name, email, password, role, description, avatar, email_verified_at, created_at)
        VALUES (?, NULL, ?, ?, 'base', NULL, NULL, NULL, NOW())
    ");
    $stmt->execute([$username, $email, $passwordHash]);

    $userId = (int)$pdo->lastInsertId();

    $pdo->commit();

    // Enviar email de verificação
    $sendResult = sendVerificationForEmail($pdo, $email);

    if (empty($sendResult['success'])) {
        // conta criada mas envio falhou
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'role' => 'base',
            ],
            'message' => 'Account created, but we could not send the verification email right now.'
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $userId,
            'username' => $username,
            'email' => $email,
            'role' => 'base',
        ],
        'message' => 'Conta criada. Enviámos um email de verificação.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    api_log_exception($e, $requestId, [
        'endpoint' => '.../auth/register.php',
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}