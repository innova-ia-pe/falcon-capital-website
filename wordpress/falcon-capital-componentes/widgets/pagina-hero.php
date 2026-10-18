<?php
/**
 * Cabecera de página con foto (soluciones, Conócenos, Contáctanos, Blog). En el Blog puede mostrar el artículo
 * destacado (el último marcado como «fijo» o, si no hay, el más reciente).
 */
defined( 'ABSPATH' ) || exit;

class FCC_Pagina_Hero extends FCC_Widget {

	public function get_name() { return 'fc-pagina-hero'; }
	public function get_title() { return 'Cabecera de página'; }
	public function get_icon() { return 'eicon-header'; }
	public function get_keywords() { return array( 'falcon', 'cabecera', 'hero', 'portada' ); }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->imagen( 'foto', 'Foto de fondo', 'b-factoring.jpg' );
		$this->texto( 'foto_pos', 'Recorte de la foto (posición)', '55% 30%', 'text', array( 'description' => 'Horizontal y vertical, por ejemplo «55% 30%».' ) );
		$this->texto( 'miga_medio', 'Ruta: sección intermedia', '', 'text', array( 'description' => 'Por ejemplo «Soluciones». Vacío si la página cuelga del Inicio.' ) );
		$this->texto( 'miga', 'Ruta: nombre de la página', '', 'text', array( 'description' => 'Vacío: el título de la página.' ) );
		$this->texto( 'titulo', 'Título', 'Convierte tus facturas en *liquidez inmediata*', 'textarea', array( 'rows' => 2, 'description' => '*Entre asteriscos* se resalta en verde.' ) );
		$this->texto( 'bajada', 'Bajada', '', 'textarea' );
		$this->controles_botones();
		$this->lista( 'datos', 'Datos destacados', array(
			'icono' => array( 'icono', 'Ícono', 'check' ),
			'texto' => array( 'text', 'Texto', '' ),
		), array(), '{{{ texto }}}' );
		$this->cerrar();

		$this->abrir( 'sec_blog', 'Artículo destacado (Blog)' );
		$this->interruptor( 'destacado', 'Mostrar el artículo destacado', false, 'El último artículo marcado como «fijo» en Entradas o, si no hay ninguno, el más reciente.' );
		$this->cerrar();
	}

	protected function render() {
		$s    = $this->get_settings_for_display();
		$blog = ( $s['destacado'] ?? '' ) === 'yes';
		$foto = fcc_img( $s['foto'] ?? array(), 'b-factoring.jpg' );
		?>
<section class="b-phero<?php echo $blog ? ' b-bloghero' : ''; ?>" data-sec="hero">
	<div class="b-phero-bg" aria-hidden="true"><img src="<?php echo esc_url( $foto ); ?>" alt="" fetchpriority="high" style="object-position:<?php echo esc_attr( $s['foto_pos'] ?: '50% 40%' ); ?>"></div>
	<div class="b-wrap b-phero-in">
		<?php echo $this->migas( (string) $s['miga_medio'], (string) $s['miga'] ); ?>
		<h1 class="b-h1" data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h1>
		<?php if ( $s['bajada'] ) : ?><p class="b-phero-sub" data-r="up"><?php echo fcc_txt( $s['bajada'] ); ?></p><?php endif; ?>
		<?php echo $this->botones( 'b-phero-acts', $s, ' data-r="up"' ); ?>
		<?php echo $this->render_datos_cortos( (array) ( $s['datos'] ?? array() ) ); ?>
		<?php if ( $blog ) { $this->destacado(); } ?>
	</div>
</section>
		<?php
	}

	private function destacado(): void {
		$fijos = get_option( 'sticky_posts' );
		$q     = array( 'numberposts' => 1, 'post_status' => 'publish' );
		$p     = $fijos ? get_posts( $q + array( 'post__in' => $fijos ) ) : array();
		$p     = $p ?: get_posts( $q );
		if ( ! $p ) {
			return;
		}
		$p    = $p[0];
		$cats = get_the_category( $p->ID );
		$img  = get_the_post_thumbnail_url( $p, 'large' ) ?: fcc_img_tema( 'blog-4.jpg' );
		?>
		<a class="b-feat" href="<?php echo esc_url( get_permalink( $p ) ); ?>" data-r="up"><img src="<?php echo esc_url( $img ); ?>" alt="" loading="lazy"><span><span class="b-tag">Destacado<?php echo $cats ? ' · ' . esc_html( $cats[0]->name ) : ''; ?></span><b><?php echo esc_html( get_the_title( $p ) ); ?></b><em>Leer artículo <?php echo fcc_icono( 'flecha' ); ?></em></span></a>
		<?php
	}
}
