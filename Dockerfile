FROM php:8.2-apache

# Instala extensiones necesarias
RUN apt-get update \
    && apt-get install -y libicu-dev zip unzip \
    && docker-php-ext-install intl pdo pdo_mysql mysqli \
    && docker-php-ext-enable intl mysqli

# Instala Composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && php -r "unlink('composer-setup.php');"

# Habilita mod_rewrite
RUN a2enmod rewrite

# Copia el código fuente
COPY . /var/www/html

# Establece el directorio de trabajo
WORKDIR /var/www/html

# Da permisos a la carpeta de escritura de CodeIgniter
RUN chown -R www-data:www-data /var/www/html/writable
