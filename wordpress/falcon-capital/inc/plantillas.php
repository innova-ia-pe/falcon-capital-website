<?php
/**
 * Piezas de las plantillas del tema (artículo, archivo del blog, páginas de texto y 404).
 */
defined( 'ABSPATH' ) || exit;

/** Tarjeta de una entrada del blog (mismo marcado que el diseño). */
function fc_tarjeta_post( WP_Post $p ): string {
	$cats = get_the_category( $p->ID );
	$cat  = $cats ? $cats[0]->name : '';
	$img  = get_the_post_thumbnail_url( $p, 'large' ) ?: fc_img( 'blog-1.jpg' );
	return '<a class="b-post" href="' . esc_url( get_permalink( $p ) ) . '" data-r="up" data-cat="' . esc_attr( $cat ) . '">'
		. '<img src="' . esc_url( $img ) . '" alt="" loading="lazy">'
		. '<div class="b-post-body">' . ( $cat ? '<span class="b-tag">' . esc_html( $cat ) . '</span>' : '' ) . '<h3>' . esc_html( get_the_title( $p ) ) . '</h3>'
		. '<span class="b-post-more">Leer artículo ' . fc_icono( 'flecha' ) . '</span></div></a>';
}

/** Cabecera corta de las páginas de texto, el archivo del blog y la 404. */
function fc_cabecera_corta( string $miga, string $titulo, string $bajada = '', string $kicker = '', string $acciones = '' ): void {
	?>
<section class="b-phero b-phero-s" data-sec="hero">
	<div class="b-wrap b-phero-in">
		<nav class="b-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inicio</a><span>/</span><b><?php echo esc_html( $miga ); ?></b></nav>
		<?php if ( $kicker ) : ?><span class="b-kicker" data-r="up"><?php echo esc_html( $kicker ); ?></span><?php endif; ?>
		<h1 class="b-h1" data-r="up"><?php echo wp_kses( $titulo, array( 'em' => array() ) ); ?></h1>
		<?php if ( $bajada ) : ?><p class="b-phero-sub" data-r="up"><?php echo esc_html( $bajada ); ?></p><?php endif; ?>
		<?php if ( $acciones ) : ?><div class="b-phero-acts" data-r="up"><?php echo $acciones; ?></div><?php endif; ?>
	</div>
</section>
	<?php
}

/** Llamada final («¿Preparado para obtener la liquidez…?»). */
function fc_cta(): void {
	?>
<section class="b-cta" data-sec="cta">
	<img class="b-cta-bg" src="<?php echo esc_url( fc_img( 'hero-evaluacion.jpg' ) ); ?>" alt="" loading="lazy" data-scrub="cta">
	<div class="b-wrap b-cta-in">
		<h2 data-r="up">¿Preparado para obtener la liquidez que tu empresa necesita?</h2>
		<p data-r="up">Descubre cómo las soluciones financieras de Falcon Capital pueden impulsar la liquidez y el crecimiento de tu empresa, de forma ágil, segura y sin afectar tu flujo de caja.</p>
		<div class="b-cta-acts" data-r="up">
			<a class="b-btn b-btn-em b-btn-lg" href="<?php echo esc_url( fc_pagina( 'simulador' ) ); ?>">Simula tu crédito <?php echo fc_icono( 'flecha' ); ?></a>
			<a class="b-btn b-btn-ghost b-btn-lg" href="<?php echo esc_url( fc_pagina( 'contactanos' ) ); ?>">Contáctanos</a>
		</div>
	</div>
</section>
	<?php
}

/** Minutos de lectura (≈ 200 palabras por minuto). */
function fc_lectura( WP_Post $p ): int {
	return max( 1, (int) round( str_word_count( wp_strip_all_tags( $p->post_content ) ) / 200 ) );
}

/**
 * Índice del artículo: da un ancla a cada título h2 del contenido y junta debajo sus subtítulos h3.
 * Devuelve [contenido, títulos], cada título con 'id', 'texto' y 'sub' (textos de sus h3).
 */
function fc_indice( string $html ): array {
	$items = array();
	$html  = preg_replace_callback( '/<h([23])([^>]*)>(.*?)<\/h\1>/is', function ( $m ) use ( &$items ) {
		$texto = trim( wp_strip_all_tags( $m[3] ) );
		if ( $m[1] === '3' ) {
			if ( $items && $texto !== '' ) {
				$items[ count( $items ) - 1 ]['sub'][] = $texto;
			}
			return $m[0];
		}
		$id      = 'b-art-' . count( $items );
		$items[] = array( 'id' => $id, 'texto' => $texto, 'sub' => array() );
		$attrs   = preg_replace( '/\sid="[^"]*"/', '', $m[2] );
		return '<h2' . $attrs . ' id="' . $id . '">' . $m[3] . '</h2>';
	}, $html );
	return array( $html, $items );
}

/** Autor visible de un artículo: su nombre público; si el usuario nunca lo cambió (sigue su usuario), el equipo. */
function fc_autor(): string {
	$u = get_userdata( (int) get_the_author_meta( 'ID' ) );
	if ( ! $u || $u->display_name === '' || $u->display_name === $u->user_login ) {
		return 'Equipo Falcon Capital';
	}
	return $u->display_name;
}
