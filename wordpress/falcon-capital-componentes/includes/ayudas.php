<?php
/**
 * Ayudas para los widgets: textos con resaltado, imágenes, enlaces e íconos.
 */
defined( 'ABSPATH' ) || exit;

/**
 * Texto de un campo: permite negritas y saltos de línea; *palabras entre asteriscos* se resaltan en verde
 * (el <em> del diseño).
 */
function fcc_txt( $s ): string {
	$s = (string) $s;
	$s = preg_replace( '/\*([^*\n]+)\*/u', '<em>$1</em>', $s );
	return wp_kses( $s, array( 'em' => array(), 'b' => array(), 'strong' => array(), 'br' => array(), 'small' => array() ) );
}

/** URL de una imagen elegida en un control MEDIA; si está vacía, la del tema con ese nombre de archivo. */
function fcc_img( $media, string $archivo = '' ): string {
	if ( is_array( $media ) && ! empty( $media['url'] ) ) {
		return $media['url'];
	}
	return $archivo ? fcc_img_tema( $archivo ) : '';
}

function fcc_img_tema( string $archivo ): string {
	return function_exists( 'fc_img' ) ? fc_img( $archivo ) : get_stylesheet_directory_uri() . '/assets/img/' . $archivo;
}

/** URL de una imagen incluida en el tema, para valores por defecto de los controles MEDIA. */
function fcc_media_tema( string $archivo ): array {
	return array( 'url' => fcc_img_tema( $archivo ), 'id' => '' );
}

function fcc_icono( string $n, string $extra = '' ): string {
	return function_exists( 'fc_icono' ) ? fc_icono( $n, $extra ) : '';
}

/** Atributos href/target/rel de un control URL de Elementor. */
function fcc_href( $url, string $porDefecto = '#' ): string {
	$u = is_array( $url ) ? ( $url['url'] ?? '' ) : (string) $url;
	$u = $u !== '' ? $u : $porDefecto;
	$a = 'href="' . esc_url( fcc_resolver( $u ) ) . '"';
	/* WhatsApp y enlaces marcados como externos se abren en otra pestaña */
	$externo = ( is_array( $url ) && ! empty( $url['is_external'] ) ) || str_starts_with( $u, 'whatsapp:' ) || str_contains( $u, 'wa.me/' );
	if ( $externo ) {
		$a .= ' target="_blank"';
	}
	if ( $externo || ( is_array( $url ) && ! empty( $url['nofollow'] ) ) ) {
		$a .= ' rel="noopener' . ( is_array( $url ) && ! empty( $url['nofollow'] ) ? ' nofollow' : '' ) . '"';
	}
	return $a;
}

/**
 * Los valores por defecto usan rutas cortas del sitio («/factoring/», «/contactanos/#b-contacto»,
 * «whatsapp:») que aquí se convierten en enlaces completos.
 */
function fcc_resolver( string $u ): string {
	if ( str_starts_with( $u, 'whatsapp:' ) ) {
		return function_exists( 'fc_wa' ) ? fc_wa( substr( $u, 9 ) ) : 'https://wa.me/51955447475';
	}
	if ( str_starts_with( $u, '/' ) && ! str_starts_with( $u, '//' ) ) {
		return home_url( $u );
	}
	return $u;
}

/** Valor por defecto de un control URL. */
function fcc_url( string $u ): array {
	return array( 'url' => $u, 'is_external' => '', 'nofollow' => '' );
}

/** Enlace a una página del sitio por su ruta. */
function fcc_pag( string $ruta ): string {
	return function_exists( 'fc_pagina' ) ? fc_pagina( $ruta ) : home_url( '/' . $ruta . '/' );
}

/** Opciones del selector de ícono en los widgets. */
function fcc_iconos(): array {
	return function_exists( 'fc_iconos_opciones' ) ? fc_iconos_opciones() : array( 'check' => 'Check' );
}

/** Líneas no vacías de un campo de texto (una por renglón). */
function fcc_lineas( $s ): array {
	return array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) $s ) ), 'strlen' ) );
}

/** Párrafos separados por una línea en blanco, cada uno con la animación de entrada del diseño. */
function fcc_parrafos( $s, string $clase_primero = '' ): string {
	$out = '';
	$i   = 0;
	foreach ( preg_split( '/\n\s*\n/', trim( (string) $s ) ) as $p ) {
		$p = trim( $p );
		if ( $p === '' ) {
			continue;
		}
		$c    = ( $i === 0 && $clase_primero ) ? ' class="' . esc_attr( $clase_primero ) . '"' : '';
		$out .= '<p' . $c . ' data-r="up">' . fcc_txt( nl2br( $p, false ) ) . '</p>';
		$i++;
	}
	return $out;
}
