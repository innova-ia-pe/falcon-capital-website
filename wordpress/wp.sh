#!/usr/bin/env bash
# WP-CLI del WordPress local: ./wp.sh plugin list
# (filtra el aviso de deprecación que Elementor imprime al terminar en PHP 8.4)
export MSYS_NO_PATHCONV=1
cd "$(dirname "$0")"
docker compose run --rm -T cli "$@" 2>/dev/null | grep -v "^ Container " | sed '/^PHP: .*Implicitly marking/,/^)\]$/d'
