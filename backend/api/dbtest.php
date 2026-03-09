<?php
require_once __DIR__ . '/../includes/cors.php';
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../includes/db.php';

try {
    $pdo = db_connect();
    echo json_encode(['success'=>true,'message'=>'Ligacao OK']);
} catch (Throwable $e) {
    echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
