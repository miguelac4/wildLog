<?php
session_start();

require_once __DIR__ . '/../../includes/api_error.php';
$requestId = api_request_id();

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    api_json_error(405, 'METHOD NOT ALLOWED', 'Método não permitido.');
}

require_once __DIR__ . '/../../includes/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input["email"] ?? '';
$password = $input["password"] ?? '';

if ($email === '' || $password === '') {
    api_json_error(401, 'UNAUTHORIZED', 'Email e palavra-passe são obrigatórios.');
}

try {
    $pdo = db_connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Buscar utilizador
    $stmt = $pdo->prepare("SELECT id, name, email, password, role, email_verified_at FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user["password"])) {
        api_json_error(401, 'UNAUTHORIZED', 'Email ou palavra-passe incorretos.');
    }

    if (empty($user["email_verified_at"])) {
        api_json_error(403, 'FORBIDDEN', 'A sua conta ainda não foi verificada. Verifique o seu email.');
    }

    // Guardar sessão (sem role, sem redirect)
    $_SESSION["is_login"] = true;
    $_SESSION["user"] = [
        "id"           => (int)$user["id"],
        "name"         => $user["name"],
        "email"        => $user["email"],
        "role"         => $user["role"],
    ];

    echo json_encode([
        'user' => [
            'id'           => (int)$user['id'],
            'name'         => $user['name'],
            'email'        => $user['email'],
            'role'         => $user['role']
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    api_log_exception($e, $requestId, [
        'endpoint' => '.../auth/login.php',
    ]);

    api_json_error(500, 'INTERNAL_ERROR', 'Ocorreu um erro inesperado.', $requestId);
}
