<?php
/**
 * Página de texto (legales y cualquier página que no se arme con Elementor): cabecera corta con el título y el
 * extracto, y el contenido del editor de WordPress en un documento claro.
 * Las páginas armadas con Elementor usan la plantilla «Elementor a ancho completo» y no pasan por aquí.
 */
defined( 'ABSPATH' ) || exit;

get_header();
while ( have_posts() ) :
	the_post();
	/* el rótulo (campo «fc_rotulo», p. ej. «Legal») también va en la ruta, como en el diseño */
	$rotulo = (string) get_post_meta( get_the_ID(), 'fc_rotulo', true );
	fc_cabecera_corta( $rotulo ?: get_the_title(), esc_html( get_the_title() ), has_excerpt() ? get_the_excerpt() : '', $rotulo );
	?>
<section class="b-sec b-art" data-sec="documento">
	<div class="b-wrap">
		<article class="b-art-body b-doc b-wp">
			<?php the_content(); ?>
			<div class="b-doc-acts"><a class="b-btn b-btn-dark" href="<?php echo esc_url( home_url( '/' ) ); ?>">Volver al inicio</a><a class="b-btn b-btn-line-d" href="<?php echo esc_url( fc_pagina( 'contactanos' ) ); ?>">Contáctanos</a></div>
		</article>
	</div>
</section>
	<?php
endwhile;
get_footer();
