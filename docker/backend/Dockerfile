FROM php:8.3-cli-alpine

RUN apk add --no-cache \
      icu-dev \
      libzip-dev \
      oniguruma-dev \
      libpng-dev \
      libjpeg-turbo-dev \
      libwebp-dev \
      freetype-dev \
    && docker-php-ext-configure gd \
        --with-jpeg \
        --with-webp \
        --with-freetype \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        intl \
        zip \
        gd

WORKDIR /var/www