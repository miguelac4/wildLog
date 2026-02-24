<?php
require __DIR__ . '/../includes/db.php';

header('Content-Type: application/json');

try {
    $pdo = db();
    $version = $pdo->query("SELECT VERSION() AS v")->fetch();
    echo json_encode([
        "ok" => true,
        "mysql_version" => $version["v"] ?? null
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "error" => $e->getMessage()
    ]);
}