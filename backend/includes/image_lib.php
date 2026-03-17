<?php

function image_convert_to_webp(
    string $srcTmp,
    string $destPath,
    string $mime,
    int $maxDim = 2000,
    int $quality = 85
) {

    switch ($mime) {
        case 'image/jpeg':
            $img = imagecreatefromjpeg($srcTmp);
            break;

        case 'image/png':
            $img = imagecreatefrompng($srcTmp);
            break;

        case 'image/webp':
            $img = imagecreatefromwebp($srcTmp);
            break;

        default:
            return false;
    }

    if (!$img) {
        return false;
    }

    $width = imagesx($img);
    $height = imagesy($img);

    // calcular resize
    if ($width > $maxDim || $height > $maxDim) {

        if ($width > $height) {
            $newWidth = $maxDim;
            $newHeight = intval($height * ($maxDim / $width));
        } else {
            $newHeight = $maxDim;
            $newWidth = intval($width * ($maxDim / $height));
        }

        $resized = imagecreatetruecolor($newWidth, $newHeight);

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

    imagedestroy($img);

    return $result;
}