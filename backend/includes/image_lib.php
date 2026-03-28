<?php

define('DEBUG', false);

function image_convert_to_webp(
    string $srcTmp,
    string $destPath,
    string $mime,
    int $maxDim = 2000,
    int $quality = 85
) {
    if (DEBUG) {
        error_log("---- IMAGE DEBUG START ----");
        error_log("MIME recebido: " . $mime);
        error_log("Ficheiro tmp: " . $srcTmp);
        error_log("Destino: " . $destPath);
    }

    $info = @getimagesize($srcTmp);

    if (!$info) {
        if (DEBUG) {
            error_log("ERRO: getimagesize falhou");
        }
        return false;
    }

    list($width, $height) = $info;
    if (DEBUG) {
        error_log("Dimensões: {$width}x{$height}");
    }

    if (!$width || !$height) {
        return false;
    }

    // proteção contra imagens gigantes
    if ($width * $height > 40_000_000) { // ~40MP
        if (DEBUG) {
            error_log("Dimensões: {$width}x{$height}");
        }
        return false;
    }

    if (DEBUG) {
        error_log("A tentar criar imagem GD...");
    }

    switch ($mime) {
        case 'image/jpeg':
            $img = @imagecreatefromjpeg($srcTmp);
            break;

        case 'image/png':
            $img = @imagecreatefrompng($srcTmp);
            break;

        case 'image/webp':
            $img = @imagecreatefromwebp($srcTmp);
            break;

        default:
            if (DEBUG) {
                error_log("ERRO: MIME não suportado no switch");
            }
            return false;
    }

    if (!$img) {
        if (DEBUG) {
            error_log("ERRO: imagecreatefrom falhou ({$mime})");
        }

        // fallback poderoso
        if (DEBUG) {
            error_log("A tentar fallback com imagecreatefromstring...");
        }
        $data = @file_get_contents($srcTmp);
        $img = @imagecreatefromstring($data);

        if (!$img) {
            if (DEBUG) {
                error_log("ERRO: fallback imagecreatefromstring também falhou");
            }
            return false;
        }
    }

    // calcular resize
    if ($width > $maxDim || $height > $maxDim) {

        if ($width > $height) {
            $newWidth = $maxDim;
            $newHeight = intval($height * ($maxDim / $width));
        } else {
            $newHeight = $maxDim;
            $newWidth = intval($width * ($maxDim / $height));
        }

        if (DEBUG) {
            error_log("Novo tamanho: {$newWidth}x{$newHeight}");
        }
        $resized = imagecreatetruecolor($newWidth, $newHeight);

        if (!$resized) {
            if (DEBUG) {
                error_log("ERRO: imagecreatetruecolor falhou");
            }
            imagedestroy($img);
            return false;
        }

        imagecopyresampled(
            $resized,
            $img,
            0,
            0,
            0,
            0,
            $newWidth,
            $newHeight,
            $width,
            $height
        );

        imagedestroy($img);
        $img = $resized;
    }

    // salvar em webp
    $result = imagewebp($img, $destPath, $quality);

    if (DEBUG) {
        if (!$result) {
            error_log("ERRO: imagewebp falhou");
        } else {
            error_log("WEBP guardado com sucesso");
        }
    }

    imagedestroy($img);

    return $result;
}