<?php
/**
 * Presentación con video institucional y, opcionalmente, cifras con contador y el grupo económico (Inicio y Conócenos).
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

class FCC_Presentacion extends FCC_Widget {

	public function get_name() { return 'fc-presentacion'; }
	public function get_title() { return 'Presentación con video'; }
	public function get_icon() { return 'eicon-counter'; }

	protected function register_controls() {
		$this->abrir( 'sec_txt', 'Presentación' );
		$this->texto( 'kicker', 'Rótulo', 'Quiénes somos' );
		$this->texto( 'titulo', 'Título', 'Accede a la *liquidez* que impulsa el crecimiento de tu empresa', 'textarea', array( 'description' => '*Entre asteriscos* se resalta en verde.' ) );
		$this->texto( 'lead', 'Texto destacado', 'En Falcon Capital brindamos una alternativa de financiamiento diseñada para impulsar el crecimiento empresarial.', 'textarea' );
		$this->texto( 'texto', 'Texto', 'Somos una empresa de soluciones financieras perteneciente al grupo económico <b>ON Empresas</b>, que ofrece una propuesta moderna, ágil y transparente para brindar liquidez inmediata a las empresas peruanas.', 'textarea' );
		$this->texto( 'enlace', 'Enlace', 'Conoce Falcon Capital' );
		$this->enlace( 'enlace_url', 'Destino del enlace', '/conocenos/' );
		$this->cerrar();

		$this->abrir( 'sec_video', 'Video institucional' );
		$this->imagen( 'video_img', 'Imagen de portada', 'home-about.jpg' );
		$this->texto( 'video_tit', 'Título sobre la imagen', 'Video institucional' );
		$this->texto( 'video_sub', 'Subtítulo', 'Conoce cómo trabajamos' );
		$this->texto( 'video_url', 'Enlace del video (YouTube o Vimeo)', '', 'text', array( 'description' => 'Si está vacío, al tocar se muestra el aviso «el video se agregará pronto».' ) );
		$this->cerrar();

		$this->controles_datos();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-sec b-intro"<?php echo ( $s['con_cifras'] ?? 'yes' ) === 'yes' ? ' id="b-presentacion"' : ''; ?> data-sec="<?php echo ( $s['con_cifras'] ?? 'yes' ) === 'yes' ? 'presentacion' : 'video'; ?>">
	<div class="b-wrap"><div class="b-intro-head"><span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span><h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2></div></div>
	<div class="b-wrap b-intro-grid">
		<div class="b-intro-txt">
			<?php if ( $s['lead'] ) : ?><p class="b-lead" data-r="up"><?php echo fcc_txt( $s['lead'] ); ?></p><?php endif; ?>
			<?php if ( $s['texto'] ) : ?><p data-r="up"><?php echo fcc_txt( $s['texto'] ); ?></p><?php endif; ?>
			<?php if ( $s['enlace'] ) : ?><a class="b-link" <?php echo fcc_href( $s['enlace_url'] ); ?> data-r="up"><?php echo esc_html( $s['enlace'] ); ?> <?php echo fcc_icono( 'flecha' ); ?></a><?php endif; ?>
		</div>
		<div class="b-video-wrap" data-scrub="video">
			<button class="b-video" type="button" data-video<?php echo $s['video_url'] ? ' data-video-url="' . esc_attr( $s['video_url'] ) . '"' : ''; ?> aria-label="Reproducir el video institucional">
				<img src="<?php echo esc_url( fcc_img( $s['video_img'], 'home-about.jpg' ) ); ?>" alt="" loading="lazy">
				<span class="b-play"><?php echo fcc_icono( 'play' ); ?></span>
				<span class="b-video-cap"><b><?php echo esc_html( $s['video_tit'] ); ?></b><small><?php echo esc_html( $s['video_sub'] ); ?></small></span>
			</button>
		</div>
	</div>
	<?php $this->render_datos( $s ); ?>
</section>
		<?php
	}
}
