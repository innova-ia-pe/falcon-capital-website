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
echo "sincronizado"
