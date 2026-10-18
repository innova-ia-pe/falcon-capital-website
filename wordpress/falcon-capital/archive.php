<?php
/**
 * Archivo del blog (categoría, autor, fecha o búsqueda): cabecera corta y tarjetas con paginación.
 */
defined( 'ABSPATH' ) || exit;

get_header();
if ( is_search() ) {
	$titulo = 'Resultados para «' . esc_html( get_search_query() ) . '»';
	$miga   = 'Búsqueda';
} elseif ( is_category() || is_tag() ) {
	$titulo = esc_html( single_term_title( '', false ) );
	$miga   = 'Blog';
} else {
	$titulo = esc_html( wp_strip_all_tags( get_the_archive_title() ) );
	$miga   = 'Blog';
}
fc_cabecera_corta( $miga, $titulo, wp_strip_all_tags( get_the_archive_description() ), 'Blog' );
?>
<section class="b-sec b-blog b-blogall" data-sec="articulos">
	<div class="b-wrap">
		<?php if ( have_posts() ) : ?>
			<div class="b-blog-grid"><?php while ( have_posts() ) { the_post(); echo fc_tarjeta_post( get_post() ); } ?></div>
			<nav class="b-pag" aria-label="Más artículos"><?php echo paginate_links( array( 'prev_text' => fc_icono( 'flecha-izq' ), 'next_text' => fc_icono( 'flecha' ) ) ); ?></nav>
		<?php else : ?>
			<p class="b-empty">Aún no hay artículos aquí. <a href="<?php echo esc_url( fc_pagina( 'blog' ) ); ?>">Ver todo el blog</a>.</p>
		<?php endif; ?>
	</div>
</section>
<?php
fc_cta();
get_footer();
