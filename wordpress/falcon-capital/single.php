<?php
/**
 * Artículo del blog: cabecera con la imagen destacada, índice, contenido, artículos relacionados y llamada final.
 * Todo sale de la entrada (título, extracto, imagen destacada, categoría, autor y contenido).
 */
defined( 'ABSPATH' ) || exit;

get_header();
while ( have_posts() ) :
	the_post();
	$p    = get_post();
	$cats = get_the_category();
	$cat  = $cats ? $cats[0] : null;
	$img  = get_the_post_thumbnail_url( $p, 'full' ) ?: fc_img( 'blog-4.jpg' );
	list( $html, $indice ) = fc_indice( apply_filters( 'the_content', get_the_content() ) );
	$enlace    = rawurlencode( get_permalink() );
	$compartir = array(
		'facebook' => array( 'Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' . $enlace ),
		'linkedin' => array( 'LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' . $enlace ),
		'whatsapp' => array( 'WhatsApp', 'https://wa.me/?text=' . rawurlencode( get_the_title() . ' ' ) . $enlace ),
	);
	?>
<section class="b-phero b-arthero" data-sec="hero">
	<div class="b-phero-bg" aria-hidden="true"><img src="<?php echo esc_url( $img ); ?>" alt="" fetchpriority="high"></div>
	<div class="b-wrap b-phero-in">
		<nav class="b-crumbs" aria-label="Ruta"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Inicio</a><span>/</span><a href="<?php echo esc_url( fc_pagina( 'blog' ) ); ?>">Blog</a><?php if ( $cat ) : ?><span>/</span><b><?php echo esc_html( $cat->name ); ?></b><?php endif; ?></nav>
		<?php if ( $cat ) : ?><span class="b-tag"><?php echo esc_html( $cat->name ); ?></span><?php endif; ?>
		<h1 class="b-h1" data-r="up"><?php the_title(); ?></h1>
		<?php if ( has_excerpt() ) : ?><p class="b-phero-sub" data-r="up"><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?>
		<div class="b-meta"><span><small>Publicado</small><?php echo esc_html( get_the_date( 'j \\d\\e F \\d\\e Y' ) ); ?></span><span><small>Escrito por</small><?php echo esc_html( fc_autor() ); ?></span><span><small>Lectura</small><?php echo (int) fc_lectura( $p ); ?> min</span></div>
	</div>
</section>
<section class="b-sec b-art" data-sec="articulo">
	<div class="b-wrap b-art-grid">
		<aside class="b-toc"><?php if ( $indice ) : ?><b>Contenido</b><ol><?php foreach ( $indice as $it ) : ?><li><a href="#<?php echo esc_attr( $it['id'] ); ?>"><?php echo esc_html( $it['texto'] ); ?></a><?php if ( $it['sub'] ) : ?><ul><?php foreach ( $it['sub'] as $sub ) : ?><li><?php echo esc_html( $sub ); ?></li><?php endforeach; ?></ul><?php endif; ?></li><?php endforeach; ?></ol><?php endif; ?>
			<div class="b-share"><small>Comparte</small><div class="b-social"><?php foreach ( $compartir as $k => $c ) : ?><a href="<?php echo esc_url( $c[1] ); ?>" target="_blank" rel="noopener" aria-label="<?php echo esc_attr( 'Compartir en ' . $c[0] ); ?>"><?php echo fc_icono( $k ); ?></a><?php endforeach; ?></div></div>
		</aside>
		<article class="b-art-body b-wp">
			<?php echo $html; // phpcs:ignore WordPress.Security.EscapeOutput -- contenido de la entrada ?>
			<div class="b-art-cta"><b>¿Quieres saber cuánto recibirías por tus facturas?</b><a class="b-btn b-btn-em" href="<?php echo esc_url( fc_pagina( 'simulador' ) ); ?>">Simula tu crédito <?php echo fc_icono( 'flecha' ); ?></a></div>
		</article>
	</div>
</section>
	<?php
	$rel = get_posts( array( 'numberposts' => 3, 'post__not_in' => array( $p->ID ), 'category__in' => $cat ? array( $cat->term_id ) : array(), 'post_status' => 'publish' ) );
	if ( count( $rel ) < 3 ) {
		$rel = array_merge( $rel, get_posts( array( 'numberposts' => 3 - count( $rel ), 'post__not_in' => array_merge( array( $p->ID ), wp_list_pluck( $rel, 'ID' ) ), 'post_status' => 'publish' ) ) );
	}
	$rel = array_filter( $rel, fn( $x ) => $x->post_name !== 'hello-world' );
	if ( $rel ) :
		?>
<section class="b-sec b-blog" data-sec="relacionados">
	<div class="b-wrap"><div class="b-head b-head-row"><div><span class="b-kicker" data-r="up">Sigue leyendo</span><h2 data-r="up">Artículos relacionados</h2></div><a class="b-btn b-btn-dark" href="<?php echo esc_url( fc_pagina( 'blog' ) ); ?>">Ver el blog <?php echo fc_icono( 'flecha' ); ?></a></div><div class="b-blog-grid"><?php foreach ( $rel as $r ) { echo fc_tarjeta_post( $r ); } ?></div></div>
</section>
		<?php
	endif;
	fc_cta();
endwhile;
get_footer();
