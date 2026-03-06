<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;

function sendVerificationForEmail(PDO $pdo, string $email): array
{
    // Buscar utilizador pelo mail
    $stmt = $pdo->prepare("SELECT id, name, email, email_verified_at FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Resposta neutra para não “confirmar” se existe ou não o email, e se já está verificado ou não
    // (não diferenciar para reduzir informação para o cliente malicioso)
    if (!$user || !empty($user["email_verified_at"])) {
        return [
            'success' => true,
            'message' => 'If the email exists, we sent a verification link.'
        ];
    }

    // Rate limit
    $stmt = $pdo->prepare("
        SELECT created_at
        FROM user_tokens
        WHERE user_id = ? AND type = 'email'
        ORDER BY created_at DESC
        LIMIT 1
    ");
    $stmt->execute([(int)$user["id"]]);
    $last = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($last) {
        $lastTs = strtotime($last["created_at"]);
        if ($lastTs !== false && (time() - $lastTs) < 60) {
            return [
                'success' => false,
                'code'    => 429,
                'message' => 'Please wait before requesting another email.'
            ];
        }
    }

    // Invalidar tokens anteriores (deixar só 1 link válido)
    $stmt = $pdo->prepare("
        UPDATE user_tokens
        SET consumed_at = NOW()
        WHERE user_id = ? AND type = 'email' AND consumed_at IS NULL
    ");
    $stmt->execute([(int)$user["id"]]);

    // Gerar token e guardar HASH no DB
    $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    $tokenHash = hash('sha256', $token);
    $expiresAt = (new DateTimeImmutable('+24 hours'))->format('Y-m-d H:i:s');

    // Inserir token
    $stmt = $pdo->prepare("
        INSERT INTO user_tokens (user_id, token_hash, expires_at, consumed_at, created_at, type)
        VALUES (?, ?, ?, NULL, NOW(), 'email')
    ");
    $stmt->execute([(int)$user["id"], $tokenHash, $expiresAt]);
    $tokenId = (int)$pdo->lastInsertId();

    // URL verificação (GET)
    $verifyUrl = "https://wild-log.com/verify-email?token=" . $token;

    // HTML do email (usa o teu template atual)
    $name = $user["name"] ?? '';
    $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $safeVerifyUrl = htmlspecialchars($verifyUrl, ENT_QUOTES, 'UTF-8');

    $logoUrl = "https://wild-log.com/backend/assets/email/logoTextWM.png";

    $emailTemplate = "
<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Verify your email - WildLog</title>
</head>
<body style='margin:0;padding:0;background:#f4f4f4;font-family:Arial, sans-serif;color:#333;'>
  <div style='max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);'>
    <div style='background:linear-gradient(135deg,#000000 0%,#1a1a1a 100%);padding:40px 30px;text-align:center;border-bottom:4px solid #c0a16b;'>
      <img src='".htmlspecialchars($logoUrl, ENT_QUOTES, 'UTF-8')."' alt='WildLog' style='max-width:170px;height:auto;display:block;margin:0 auto 12px auto;' />
      <div style='color:#ffffff;font-size:13px;letter-spacing:1px;text-transform:uppercase;opacity:0.95;'>
        Respect the wild.
      </div>
    </div>

    <div style='padding:48px 30px;background:#ffffff;'>
      <h1 style='margin:0 0 18px 0;font-size:34px;font-weight:700;letter-spacing:-0.5px;text-align:center;color:#000000;font-family:-apple-system, BlinkMacSystemFont, \\'Segoe UI\\', Roboto, Helvetica, Arial, sans-serif;'>
        Welcome, <span style='color:#c0a16b;'>".$safeName."</span>!
      </h1>

      <p style='margin:0 0 16px 0;font-size:16px;line-height:1.8;text-align:center;color:#555555;'>
        Thanks for joining <strong>WildLog</strong> — a social platform for campers to share trips, photos, spots, and stories.
      </p>

      <p style='margin:0 0 26px 0;font-size:16px;line-height:1.8;text-align:center;color:#555555;'>
        Please verify your email to activate your account:
      </p>

      <div style='text-align:center;margin:34px 0;'>
        <a href='".$safeVerifyUrl."' style='display:inline-block;background:linear-gradient(135deg,#c0a16b 0%,#d4b876 100%);color:#ffffff !important;text-decoration:none;padding:16px 38px;border-radius:50px;font-weight:700;font-size:15px;letter-spacing:1px;text-transform:uppercase;box-shadow:0 4px 15px rgba(192,161,107,0.30);'>
          Verify Email
        </a>
      </div>

      <div style='background:#f9f9f9;border-left:4px solid #c0a16b;padding:18px;border-radius:0 8px 8px 0;'>
        <p style='margin:0;font-size:14px;line-height:1.6;color:#666666;'>
          <strong>Security note:</strong> This verification link is valid for 24 hours. If you didn’t create a WildLog account, you can safely ignore this email.
        </p>
      </div>

      <p style='margin:22px 0 0 0;font-size:13px;line-height:1.6;text-align:center;color:#777777;'>
        See you around the campfire,<br/>
        <span style='color:#c0a16b;font-weight:700;'>WildLog</span>
      </p>
    </div>

    <div style='background:#f8f8f8;padding:26px 30px;text-align:center;border-top:1px solid #eeeeee;'>
      <p style='margin:0;font-size:12px;color:#999999;line-height:1.5;'>
        © ".date('Y')." <span style='color:#c0a16b;font-weight:700;'>WildLog</span>
      </p>
    </div>
  </div>
</body>
</html>
";

    // Enviar email
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host     = $_ENV['SMTP_HOST'] ?? '';
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['SMTP_USER'] ?? '';
    $mail->Password = $_ENV['SMTP_PASS'] ?? '';

    $secure = strtolower((string)($_ENV['SMTP_SECURE'] ?? 'ssl'));
    $mail->SMTPSecure = ($secure === 'ssl' || $secure === 'smtps')
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;

    $mail->Port = (int)($_ENV['SMTP_PORT'] ?? 465);

    if ($mail->Host === '' || $mail->Username === '' || $mail->Password === '') {
        // cleanup token porque não vamos conseguir enviar
        $stmt = $pdo->prepare("DELETE FROM user_tokens WHERE id = ?");
        $stmt->execute([$tokenId]);

        return [
            'success' => false,
            'code'    => 500,
            'message' => 'SMTP not configured.'
        ];
    }

    $fromEmail = $_ENV['SMTP_FROM'] ?? $mail->Username;
    $fromName  = $_ENV['SMTP_FROM_NAME'] ?? 'WildLog';

    if (!filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
        $stmt = $pdo->prepare("DELETE FROM user_tokens WHERE id = ?");
        $stmt->execute([$tokenId]);

        return [
            'success' => false,
            'code'    => 500,
            'message' => 'SMTP_FROM invalid.'
        ];
    }

    $mail->setFrom($fromEmail, $fromName);
    $mail->addAddress($user["email"], $name);
    $mail->isHTML(true);
    $mail->Subject = 'Verify your email - WildLog';
    $mail->Body    = $emailTemplate;
    $mail->AltBody  = "Welcome, $name!\n\nVerify your email:\n$verifyUrl\n\nIf you didn't create an account, ignore this email.";

    try {
        $mail->send();
    } catch (Throwable $sendErr) {
        // cleanup token se falhar envio
        $stmt = $pdo->prepare("DELETE FROM user_tokens WHERE id = ?");
        $stmt->execute([$tokenId]);

        throw $sendErr;
    }

    return [
        'success' => true,
        'message' => 'If the email exists, we sent a verification link.'
    ];
}

// endpoint execution (só quando chamado diretamente)
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {

    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    require_once __DIR__ . '/../../includes/api_error.php';
    $requestId = api_request_id();

    header('Content-Type: application/json');

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        api_json_error(405, 'METHOD NOT ALLOWED', 'Método não permitido.');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $email = trim($input["email"] ?? '');

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        api_json_error(400, 'BAD_REQUEST', 'Email inválido.');
    }

    try {
        $pdo = db_connect();
        $result = sendVerificationForEmail($pdo, $email);

        if (empty($result['success']) && isset($result['code'])) {
            api_json_error((int)$result['code'], 'ERROR', (string)$result['message']);
        }

        echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;

    } catch (Throwable $e) {
        api_log_exception($e, $requestId, [
            'endpoint' => '.../auth/verification_mail.php',
        ]);
        api_json_error(500, 'INTERNAL_ERROR', 'Unexpected error.', $requestId);
    }
}