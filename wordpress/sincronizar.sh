#!/usr/bin/env bash
# Copia el tema y el plugin al WordPress local (contenedor wordpress-wp-1) y deja los permisos de www-data.
set -e
export MSYS_NO_PATHCONV=1
cd "$(dirname "$0")"
C=$(docker compose ps -q wp)
for d in falcon-capital:themes falcon-capital-componentes:plugins; do
  n=${d%%:*}; t=${d##*:}
  docker exec "$C" rm -rf "/var/www/html/wp-content/$t/$n"
  docker cp "$n" "$C:/var/www/html/wp-content/$t/$n"
  docker exec "$C" chown -R www-data:www-data "/var/www/html/wp-content/$t/$n"
done
# fotos de hasta 64 MB en la biblioteca de medios (la imagen de WordPress trae 2 MB)
if docker exec "$C" sh -c '[ ! -f /usr/local/etc/php/conf.d/falcon-subidas.ini ]'; then
  docker exec "$C" sh -c 'printf "upload_max_filesize=64M\npost_max_size=64M\nmemory_limit=256M\n" > /usr/local/etc/php/conf.d/falcon-subidas.ini && apache2ctl -k graceful'
fi
echo "sincronizado"
