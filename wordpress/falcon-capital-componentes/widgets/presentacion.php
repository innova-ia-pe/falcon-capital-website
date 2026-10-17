<?php
/**
 * «Quiénes somos»: presentación con video institucional, cifras con contador y el grupo económico.
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

class FCC_Presentacion extends FCC_Widget {

	public function get_name() { return 'fc-presentacion'; }
	public function get_title() { return 'Quiénes somos y cifras'; }
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

		$this->abrir( 'sec_cifras', 'Cifras' );
		$r = new Repeater();
		$r->add_control( 'antes', array( 'label' => 'Antes del número', 'type' => Controls_Manager::TEXT, 'default' => '+' ) );
		$r->add_control( 'numero', array( 'label' => 'Número', 'type' => Controls_Manager::NUMBER, 'default' => 100 ) );
		$r->add_control( 'despues', array( 'label' => 'Después del número', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$r->add_control( 'texto', array( 'label' => 'Descripción', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$this->add_control( 'cifras', array( 'label' => 'Cifras', 'type' => Controls_Manager::REPEATER, 'fields' => $r->get_controls(),
			'title_field' => '{{{ antes }}}{{{ numero }}} {{{ despues }}}',
			'default' => array(
				array( 'antes' => '+ S/', 'numero' => 300, 'despues' => 'M', 'texto' => 'en desembolsos de facturas' ),
				array( 'antes' => '+', 'numero' => 150, 'despues' => '', 'texto' => 'mypes atendidas en todo el país' ),
				array( 'antes' => '+', 'numero' => 3, 'despues' => 'años', 'texto' => 'de operaciones en el mercado peruano' ),
			) ) );
		$this->nota( 'nota_cifras', 'Las cifras deben estar validadas por Falcon Capital antes de publicar.' );
		$this->cerrar();

		$this->abrir( 'sec_grupo', 'Respaldo' );
		$g = new Repeater();
		$g->add_control( 'logo', array( 'label' => 'Logo', 'type' => Controls_Manager::MEDIA ) );
		$g->add_control( 'titulo', array( 'label' => 'Título', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$g->add_control( 'texto', array( 'label' => 'Texto', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$g->add_control( 'clase', array( 'label' => 'Tamaño del logo', 'type' => Controls_Manager::SELECT, 'default' => 'lg-on',
			'options' => array( 'lg-on' => 'Ancho (como ON Empresas)', 'lg-apefac' => 'Compacto (como APEFAC)' ) ) );
		$this->add_control( 'grupo', array( 'label' => 'Respaldo', 'type' => Controls_Manager::REPEATER, 'fields' => $g->get_controls(), 'title_field' => '{{{ titulo }}}',
			'default' => array(
				array( 'logo' => fcc_media_tema( 'on-empresas-dark.png' ), 'titulo' => 'Grupo ON Empresas', 'texto' => 'Falcon Capital es parte del grupo económico ON Empresas.', 'clase' => 'lg-on' ),
				array( 'logo' => fcc_media_tema( 'logo-apefac.png' ), 'titulo' => 'Miembros de APEFAC', 'texto' => 'Asociación Peruana de Empresas de Factoring.', 'clase' => 'lg-apefac' ),
			) ) );
		$this->cerrar();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-sec b-intro" id="b-presentacion" data-sec="presentacion">
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
	<div class="b-wrap" data-sec="datos"><ul class="b-stats"><?php foreach ( (array) $s['cifras'] as $c ) : ?><li data-r="up"><b><?php if ( $c['antes'] !== '' ) : ?><small><?php echo esc_html( $c['antes'] ); ?></small><?php endif; ?><span data-count="<?php echo esc_attr( (int) $c['numero'] ); ?>"><?php echo esc_html( (int) $c['numero'] ); ?></span><?php if ( $c['despues'] !== '' ) : ?><small><?php echo esc_html( $c['despues'] ); ?></small><?php endif; ?></b><span><?php echo esc_html( $c['texto'] ); ?></span></li><?php endforeach; ?></ul>
		<div class="b-group"><?php foreach ( (array) $s['grupo'] as $g ) : ?><div class="b-group-i" data-r="up"><span class="b-plate"><img class="<?php echo esc_attr( $g['clase'] ); ?>" src="<?php echo esc_url( fcc_img( $g['logo'] ) ); ?>" alt="<?php echo esc_attr( $g['titulo'] ); ?>" loading="lazy"></span><p><b><?php echo esc_html( $g['titulo'] ); ?></b><span><?php echo esc_html( $g['texto'] ); ?></span></p></div><?php endforeach; ?></div></div>
</section>
		<?php
	}
}
