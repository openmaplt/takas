# PHP-FPM runtime for takas.openmap.lt
#
# The application code is deliberately NOT baked into this image. It is
# bind-mounted read-only from /var/www/takas/php on the host, at the same
# path inside the container, so nginx keeps sending the SCRIPT_FILENAME it
# always has and deployment stays a plain scp. See ../docker-compose.yaml.

FROM php:8.4-fpm-bookworm

# pgsql is the only extension takas needs that the base image lacks.
# session, openssl, mbstring and filter (login, PHPMailer) are built in.
# libpq5 arrives as a dependency of libpq-dev and must survive the purge,
# because the compiled pgsql.so links against it at runtime.
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends libpq-dev; \
    docker-php-ext-install -j"$(nproc)" pgsql; \
    apt-mark manual libpq5; \
    apt-get purge -y --auto-remove libpq-dev; \
    rm -rf /var/lib/apt/lists/*

# Sessions go on a named volume so that redeploying does not log everyone out.
RUN mkdir -p /var/lib/php/sessions \
    && chown www-data:www-data /var/lib/php/sessions

COPY takas.ini /usr/local/etc/php/conf.d/zz-takas.ini

WORKDIR /var/www/takas/php
