<?php
/**
 * Seguridad y respaldo: texto regulatorio y sellos (SBS, CAVALI, APEFAC).
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

class FCC_Seguridad extends FCC_Widget {

	public function get_name() { return 'fc-seguridad'; }
	public function get_title() { return 'Seguridad y respaldo'; }
	public function get_icon() { return 'eicon-lock-user'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->texto( 'kicker', 'Rótulo', 'Seguridad y respaldo' );
		$this->texto( 'titulo', 'Título', 'Operamos con *respaldo* y *seguridad financiera* en Perú', 'textarea' );
		$this->texto( 'texto', 'Texto', 'En Falcon Capital garantizamos operaciones seguras y confiables, cumpliendo con todas las normativas financieras vigentes aplicables al factoring y descuento de facturas. Somos participantes oficiales en Cavali y estamos debidamente registrados ante la Superintendencia de Banca, Seguros y AFP (SBS), lo que respalda la transparencia y solidez de nuestras operaciones.', 'textarea', array( 'rows' => 6 ) );
		$r = new Repeater();
		$r->add_control( 'logo', array( 'label' => 'Logo', 'type' => Controls_Manager::MEDIA ) );
		$r->add_control( 'alt', array( 'label' => 'Nombre de la entidad', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$r->add_control( 'texto', array( 'label' => 'Texto bajo el sello', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$this->add_control( 'sellos', array( 'label' => 'Sellos', 'type' => Controls_Manager::REPEATER, 'fields' => $r->get_controls(), 'title_field' => '{{{ texto }}}',
			'default' => array(
				array( 'logo' => fcc_media_tema( 'logo-sbs.png' ), 'alt' => 'Superintendencia de Banca, Seguros y AFP', 'texto' => 'Registrados ante la SBS' ),
				array( 'logo' => fcc_media_tema( 'logo-cavali.png' ), 'alt' => 'CAVALI', 'texto' => 'Participantes en CAVALI' ),
				array( 'logo' => fcc_media_tema( 'logo-apefac.png' ), 'alt' => 'APEFAC', 'texto' => 'Miembros de APEFAC' ),
			) ) );
		$this->texto( 'enlace', 'Enlace', 'Ver constancia de registro' );
		$this->enlace( 'enlace_url', 'Destino del enlace', '/constancia-de-registro/' );
		$this->cerrar();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-sec b-seg" id="b-seguridad" data-sec="seguridad">
	<div class="b-seg-glow" aria-hidden="true"></div>
	<div class="b-wrap b-seg-in">
		<span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span>
		<h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2>
		<p data-r="up"><?php echo fcc_txt( $s['texto'] ); ?></p>
		<div class="b-seals" data-r="up"><?php foreach ( (array) $s['sellos'] as $x ) : ?><figure><span><img src="<?php echo esc_url( fcc_img( $x['logo'] ) ); ?>" alt="<?php echo esc_attr( $x['alt'] ); ?>" loading="lazy"></span><figcaption><?php echo esc_html( $x['texto'] ); ?></figcaption></figure><?php endforeach; ?></div>
		<?php if ( $s['enlace'] ) : ?><a class="b-link" <?php echo fcc_href( $s['enlace_url'] ); ?> data-r="up"><?php echo esc_html( $s['enlace'] ); ?> <?php echo fcc_icono( 'flecha' ); ?></a><?php endif; ?>
	</div>
</section>
		<?php
	}
}
