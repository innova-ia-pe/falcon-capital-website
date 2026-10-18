<?php
/**
 * Listado del Blog: todas las entradas publicadas con filtro por categoría. Las entradas se escriben en
 * Entradas → Añadir nueva (título, imagen destacada, categoría y contenido).
 */
defined( 'ABSPATH' ) || exit;

class FCC_Blog_Lista extends FCC_Widget {

	public function get_name() { return 'fc-blog-lista'; }
	public function get_title() { return 'Blog (todas las entradas)'; }
	public function get_icon() { return 'eicon-gallery-grid'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->interruptor( 'filtros', 'Mostrar filtros por categoría' );
		$this->texto( 'cats', 'Categorías del filtro (una por línea, como en Entradas → Categorías)', "Factoring\nConfirming\nCapital de Trabajo", 'textarea', array( 'rows' => 3 ) );
		$this->texto( 'vacio', 'Mensaje si una categoría no tiene artículos', 'Aún no hay artículos en esta categoría. Pronto publicaremos nuevos contenidos.', 'textarea' );
		$this->add_control( 'cantidad', array( 'label' => 'Máximo de entradas', 'type' => \Elementor\Controls_Manager::NUMBER, 'min' => 3, 'max' => 60, 'default' => 24 ) );
		$this->nota( 'nota', 'Las entradas se publican en <b>Entradas → Añadir nueva</b>. La imagen destacada es la foto de la tarjeta.' );
		$this->cerrar();
	}

	public static function tarjeta( WP_Post $p ): string {
		$cats = get_the_category( $p->ID );
		$cat  = $cats ? $cats[0]->name : '';
		$img  = get_the_post_thumbnail_url( $p, 'large' ) ?: fcc_img_tema( 'blog-1.jpg' );
		return '<a class="b-post" href="' . esc_url( get_permalink( $p ) ) . '" data-r="up" data-cat="' . esc_attr( $cat ) . '">'
			. '<img src="' . esc_url( $img ) . '" alt="" loading="lazy">'
			. '<div class="b-post-body">' . ( $cat ? '<span class="b-tag">' . esc_html( $cat ) . '</span>' : '' ) . '<h3>' . esc_html( get_the_title( $p ) ) . '</h3>'
			. '<span class="b-post-more">Leer artículo ' . fcc_icono( 'flecha' ) . '</span></div></a>';
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$posts = get_posts( array( 'numberposts' => max( 3, (int) $s['cantidad'] ), 'post_status' => 'publish' ) );
		$posts = array_filter( $posts, fn( $p ) => $p->post_name !== 'hello-world' );
		$cats  = fcc_lineas( $s['cats'] );
		?>
<section class="b-sec b-blog b-blogall" data-sec="articulos">
	<div class="b-wrap">
		<?php if ( $s['filtros'] === 'yes' && $cats ) : ?>
		<div class="b-filtros" role="group" aria-label="Categorías" data-filtros><button type="button" data-cat="*" aria-pressed="true">Todos</button><?php foreach ( $cats as $c ) : ?><button type="button" data-cat="<?php echo esc_attr( $c ); ?>" aria-pressed="false"><?php echo esc_html( $c ); ?></button><?php endforeach; ?></div>
		<?php endif; ?>
		<div class="b-blog-grid" data-posts><?php foreach ( $posts as $p ) { echo self::tarjeta( $p ); } ?></div>
		<p class="b-empty" data-empty<?php echo $posts ? ' hidden' : ''; ?>><?php echo esc_html( $s['vacio'] ); ?></p>
	</div>
</section>
		<?php
	}
}
