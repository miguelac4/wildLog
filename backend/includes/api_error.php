<?php
declare(strict_types=1);

function api_request_id(): string {
    $rid = $_SERVER['HTTP_X_REQUEST_ID'] ?? '';
    if (is_string($rid) && $rid !== '') return $rid;
    return bin2hex(random_bytes(8));
}

function api_log(string $level, string $message, string $requestId, array $context = []): void {
    $payload = [
        'ts' => gmdate('c'),
        'level' => $level,
        'request_id' => $requestId,
        'message' => $message,
        'context' => $context,
    ];
    error_log(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function api_log_exception(Throwable $e, string $requestId, array $context = []): void {
    $payload = [
        'request_id' => $requestId,
        'message' => $e->getMessage(),
        'type' => get_class($e),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString(),
        'context' => $context,
    ];
    error_log(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function api_json_error(
    int $httpStatus,
    string $code,
    string $message,
    ?string $requestId = null,
    ?array $details = null
): void {
    http_response_code($httpStatus);

    $out = [
        'code' => $code,
        'message' => $message,
    ];

    // details = informação segura e útil (ex.: field, hint)
    if ($details !== null) {
        $out['details'] = $details;
    }

    if ($requestId !== null) {
        $out['request_id'] = $requestId;
    }

    echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
