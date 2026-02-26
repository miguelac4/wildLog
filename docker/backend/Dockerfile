FROM php:8.3-cli-alpine

RUN apk add --no-cache \
      icu-dev \
      libzip-dev \
      oniguruma-dev \
    && docker-php-ext-install -j$(nproc) pdo_mysql intl zip

WORKDIR /var/www