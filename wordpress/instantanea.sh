#!/usr/bin/env bash
# Instantánea del WordPress local: base de datos, fotos, Elementor, Elementor Pro y Hello Elementor, para que todo el
# equipo tenga el mismo WordPress (páginas, entradas, medios, solicitudes, asistente y ajustes) sin armarlo a mano.
#
#   ./instantanea.sh restaurar [--si]   levanta Docker y deja http://localhost:8088 igual que la instantánea
#                                       (reemplaza la base y wp-content locales; --si no pregunta)
#   ./instantanea.sh guardar            actualiza instantanea/ desde tu WordPress local (tu base no se toca)
#
# Lo único que no viaja es la licencia de Elementor Pro (y su conexión con la cuenta de Elementor): el repositorio
# es público. Para actualizar Elementor Pro, cada uno la activa en Elementor → Licencia.
# Otro puerto: FALCON_PUERTO=8090 ./instantanea.sh restaurar
set -euo pipefail
export MSYS_NO_PATHCONV=1
cd "$(dirname "$0")"
DIR=instantanea
PUERTO=${FALCON_PUERTO:-8088}
ORIGEN=http://localhost:8088   # URL con la que se guarda la instantánea
export FALCON_PUERTO=$PUERTO
CONTENIDO="uploads plugins/elementor plugins/elementor-pro themes/hello-elementor"

sql() { docker compose exec -T db sh -c 'exec mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" "$@"' sh "$@"; }
volcar() { docker compose exec -T db sh -c 'exec mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction --skip-dump-date --default-character-set=utf8mb4 "$1"' sh "$1"; }
# WP-CLI sin el aviso de deprecación que Elementor imprime al terminar en PHP 8.4 (a veces pegado a la salida);
# BASE elige otra base de datos
sin_aviso() { awk '{ if (s) { if ($0 ~ /^\)\]$/) s = 0; next } i = index($0, "PHP: "); if (i && $0 ~ /Implicitly marking/) { if (i > 1) print substr($0, 1, i - 1); s = 1; next } print }'; }
wp() { docker compose run --rm -T -e WORDPRESS_DB_NAME="${BASE:-falcon}" cli "$@" 2>/dev/null | sin_aviso; }
esperar() {
	docker compose up -d db wp >/dev/null 2>&1
	until sql -e 'SELECT 1' >/dev/null 2>&1; do sleep 2; done
	until docker compose exec -T wp test -f /var/www/html/wp-config.php 2>/dev/null; do sleep 2; done
}
base_nueva() { sql -e "DROP DATABASE IF EXISTS $1; CREATE DATABASE $1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci; GRANT ALL ON $1.* TO 'falcon'@'%';"; }

guardar() {
	esperar
	mkdir -p "$DIR"
	echo "Copiando la base de datos (sin la licencia de Elementor Pro)…"
	base_nueva falcon_tmp
	volcar falcon | sql falcon_tmp
	sql falcon_tmp -e "DELETE FROM wp_options WHERE option_name LIKE 'elementor\_pro\_license%' OR option_name LIKE '\_elementor\_pro\_license%' OR option_name LIKE 'elementor\_connect%';
		DELETE FROM wp_usermeta WHERE meta_key LIKE 'elementor\_connect%';"
	volcar falcon_tmp | gzip -9n > "$DIR/falcon.sql.gz"
	sql -e 'DROP DATABASE falcon_tmp'
	echo "Copiando fotos, Elementor, Elementor Pro y Hello Elementor…"
	docker compose exec -T wp tar -C /var/www/html/wp-content -cf - $CONTENIDO | gzip -9n > "$DIR/wp-content.tar.gz"
	rm -f "$DIR/uploads.tar.gz"
	ls -lh "$DIR"
	echo "Instantánea guardada en wordpress/$DIR/ (súbela con un commit)."
}

restaurar() {
	esperar
	if [ "${1:-}" != "--si" ] && wp core is-installed >/dev/null 2>&1; then
		read -r -p "Esto reemplaza el WordPress local de este equipo (base de datos y wp-content). ¿Seguir? (s/N) " r
		[ "$r" = s ] || [ "$r" = S ] || exit 1
	fi
	echo "Cargando la base de datos…"
	base_nueva falcon
	gunzip -c "$DIR/falcon.sql.gz" | sql falcon
	echo "Cargando fotos, Elementor, Elementor Pro y Hello Elementor…"
	docker compose exec -T wp sh -c "cd /var/www/html/wp-content && rm -rf $CONTENIDO && tar -xzf - && chown -R www-data:www-data $CONTENIDO" < "$DIR/wp-content.tar.gz"
	./sincronizar.sh
	if [ "$PUERTO" != 8088 ]; then
		wp search-replace "$ORIGEN" "http://localhost:$PUERTO" --all-tables --skip-columns=guid >/dev/null
	fi
	wp elementor flush-css >/dev/null
	wp rewrite flush >/dev/null
	echo "Listo: http://localhost:$PUERTO  (admin / admin-local-123, solo local)"
}

case "${1:-}" in
	guardar) guardar ;;
	restaurar) shift; restaurar "${1:-}" ;;
	*) sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
