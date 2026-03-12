<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

/*
|--------------------------------------------------------------------------
| CARREGAR .ENV
|--------------------------------------------------------------------------
*/

$loaded = false;

// Docker (volume montado em /var/www/private_wildlog)
if (is_dir('/var/www/private_wildlog') && file_exists('/var/www/private_wildlog/.env.local')) {
    Dotenv::createImmutable('/var/www/private_wildlog', '.env.local')->load();
    $loaded = true;
}

// Servidor cPanel (fora do public_html)
if (!$loaded) {
    $privateDir = '/home/' . get_current_user() . '/private_wildlog';

    if (is_dir($privateDir) && file_exists($privateDir . '/.env')) {
        Dotenv::createImmutable($privateDir, '.env')->load();
        $loaded = true;
    }
}

// Se nenhum ficheiro for encontrado
if (!$loaded) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');

    $user_get_current = get_current_user();
    $user_env_user    = getenv('USER') ?: '(vazio)';
    $uid              = function_exists('posix_geteuid') ? posix_geteuid() : '(sem posix)';
    $pwd              = getcwd();

    $tryDockerDir   = '/var/www/private_wildlog';
    $tryDockerFile  = $tryDockerDir . '/.env.local';

    $tryCpanelDir   = '/home/' . $user_get_current . '/private_wildlog';
    $tryCpanelFile  = $tryCpanelDir . '/.env';

    // Caminho "provável" do cPanel (ajusta se o teu user for wildlog)
    $tryLikelyDir   = '/home/wildlog/private_wildlog';
    $tryLikelyFile  = $tryLikelyDir . '/.env';

    echo "Ficheiro .env não encontrado.\n\n";
    echo "Debug paths:\n";
    echo "- __DIR__: " . __DIR__ . "\n";
    echo "- getcwd(): " . $pwd . "\n";
    echo "- get_current_user(): " . $user_get_current . "\n";
    echo "- getenv('USER'): " . $user_env_user . "\n";
    echo "- posix_geteuid(): " . $uid . "\n\n";

    echo "Tentativas:\n";
    echo "1) Docker dir:  $tryDockerDir  | is_dir=" . (is_dir($tryDockerDir) ? 'yes' : 'no') .
        " | file: $tryDockerFile | exists=" . (file_exists($tryDockerFile) ? 'yes' : 'no') . "\n";

    echo "2) cPanel dir:  $tryCpanelDir  | is_dir=" . (is_dir($tryCpanelDir) ? 'yes' : 'no') .
        " | file: $tryCpanelFile | exists=" . (file_exists($tryCpanelFile) ? 'yes' : 'no') . "\n";

    echo "3) provável:   $tryLikelyDir  | is_dir=" . (is_dir($tryLikelyDir) ? 'yes' : 'no') .
        " | file: $tryLikelyFile | exists=" . (file_exists($tryLikelyFile) ? 'yes' : 'no') . "\n";

    exit;
}

/*
|--------------------------------------------------------------------------
| FUNÇÃO DE LIGAÇÃO À BASE DE DADOS
|--------------------------------------------------------------------------
*/

function db_connect(): PDO
{
    $host    = $_ENV['DB_HOST'] ?? null;
    $dbname  = $_ENV['DB_NAME'] ?? null;
    $user    = $_ENV['DB_USER'] ?? null;
    $pass    = $_ENV['DB_PASS'] ?? null;
    $charset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';

    if (!$host || !$dbname || !$user) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Variáveis DB_* em falta.'
        ]);
        exit;
    }

    $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";

    try {
        return new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'success'    => false,
            'message'    => 'Erro ao ligar à base de dados.',
            'erro_debug' => $e->getMessage(), // podes remover em produção
        ]);
        exit;
    }
}