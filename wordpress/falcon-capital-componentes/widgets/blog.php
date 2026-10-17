<?php
/**
 * Blog: las últimas entradas publicadas (con su imagen destacada y categoría). Mientras no haya entradas,
 * muestra las tres tarjetas de ejemplo del diseño.
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;

class FCC_Blog extends FCC_Widget {

	public function get_name() { return 'fc-blog'; }
	public function get_title() { return 'Blog (últimas entradas)'; }
	public function get_icon() { return 'eicon-posts-grid'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->texto( 'kicker', 'Rótulo', 'Blog' );
		$this->texto( 'titulo', 'Título', 'Entiende tus finanzas. Impulsa tu negocio', 'textarea' );
		$this->texto( 'boton', 'Botón', 'Ver el blog' );
		$this->enlace( 'boton_url', 'Destino del botón', '/blog/' );
		$this->add_control( 'cantidad', array( 'label' => 'Entradas', 'type' => Controls_Manager::NUMBER, 'min' => 1, 'max' => 6, 'default' => 3 ) );
		$this->nota( 'nota', 'Muestra las últimas entradas publicadas en <b>Entradas</b>. Si aún no hay, se ven tarjetas de ejemplo.' );
		$this->cerrar();
	}

	private function tarjeta( string $url, string $img, string $cat, string $tit ): void {
		?>
		<a class="b-post" href="<?php echo esc_url( $url ); ?>" data-r="up" data-cat="<?php echo esc_attr( $cat ); ?>">
			<img src="<?php echo esc_url( $img ); ?>" alt="" loading="lazy">
			<div class="b-post-body"><?php if ( $cat ) : ?><span class="b-tag"><?php echo esc_html( $cat ); ?></span><?php endif; ?><h3><?php echo esc_html( $tit ); ?></h3><span class="b-post-more">Leer artículo <?php echo fcc_icono( 'flecha' ); ?></span></div>
		</a>
		<?php
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$posts = get_posts( array( 'numberposts' => max( 1, (int) $s['cantidad'] ), 'post_status' => 'publish', 'ignore_sticky_posts' => true ) );
		$posts = array_filter( $posts, fn( $p ) => $p->post_name !== 'hello-world' );
		?>
<section class="b-sec b-blog" id="b-blog" data-sec="blog">
	<div class="b-wrap">
		<div class="b-head b-head-row"><div><span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span><h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2></div><?php if ( $s['boton'] ) : ?><a class="b-btn b-btn-dark" <?php echo fcc_href( $s['boton_url'] ); ?>><?php echo esc_html( $s['boton'] ); ?> <?php echo fcc_icono( 'flecha' ); ?></a><?php endif; ?></div>
		<div class="b-blog-grid">
		<?php
		if ( $posts ) {
			foreach ( $posts as $p ) {
				$cats = get_the_category( $p->ID );
				$img  = get_the_post_thumbnail_url( $p, 'large' ) ?: fcc_img_tema( 'blog-1.jpg' );
				$this->tarjeta( get_permalink( $p ), $img, $cats ? $cats[0]->name : '', get_the_title( $p ) );
			}
		} else {
			$url = fcc_resolver( $s['boton_url']['url'] ?? '/blog/' );
			$this->tarjeta( $url, fcc_img_tema( 'blog-1.jpg' ), 'Factoring', 'Cómo mejorar la liquidez de tu empresa sin afectar su estructura financiera' );
			$this->tarjeta( $url, fcc_img_tema( 'blog-2.jpg' ), 'Factoring', '5 señales de que tu empresa necesita mejorar su flujo de caja' );
			$this->tarjeta( $url, fcc_img_tema( 'blog-5.jpg' ), 'Confirming', 'Confirming: la solución para optimizar el pago a tus proveedores' );
		}
		?>
		</div>
	</div>
</section>
		<?php
	}
}
