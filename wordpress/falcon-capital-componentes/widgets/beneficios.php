<?php
/**
 * «Por qué Falcon Capital»: franja de beneficios bajo el banner.
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

class FCC_Beneficios extends FCC_Widget {

	const ICONOS = array( 'escudo' => 'Escudo', 'rayo' => 'Rayo', 'asesor' => 'Asesor (audífonos)', 'balanza' => 'Balanza', 'factoring' => 'Factura',
		'confirming' => 'Flechas', 'capital' => 'Gráfico', 'reloj' => 'Reloj', 'check' => 'Check' );

	public function get_name() { return 'fc-beneficios'; }
	public function get_title() { return 'Por qué Falcon Capital'; }
	public function get_icon() { return 'eicon-info-box'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->texto( 'titulo', 'Título', 'Por qué Falcon Capital' );
		$r = new Repeater();
		$r->add_control( 'icono', array( 'label' => 'Ícono', 'type' => Controls_Manager::SELECT, 'options' => self::ICONOS, 'default' => 'escudo' ) );
		$r->add_control( 'titulo', array( 'label' => 'Título', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$r->add_control( 'texto', array( 'label' => 'Texto', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$this->add_control( 'items', array( 'label' => 'Beneficios', 'type' => Controls_Manager::REPEATER, 'fields' => $r->get_controls(), 'title_field' => '{{{ titulo }}}',
			'default' => array(
				array( 'icono' => 'escudo', 'titulo' => 'Respaldo financiero', 'texto' => 'Solidez para seguir creciendo.' ),
				array( 'icono' => 'rayo', 'titulo' => 'Desembolsos rápidos', 'texto' => 'La liquidez que tu negocio necesita.' ),
				array( 'icono' => 'asesor', 'titulo' => 'Asesoría personalizada', 'texto' => 'Te acompañamos en cada paso.' ),
				array( 'icono' => 'balanza', 'titulo' => 'Experiencia y respaldo legal', 'texto' => 'Operaciones seguras y transparentes.' ),
			) ) );
		$this->cerrar();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-ben" data-sec="beneficios">
	<div class="b-wrap"><div class="b-ben-in"><p class="b-ben-k"><img src="<?php echo esc_url( fcc_img_tema( 'isotipo-falcon.png' ) ); ?>" alt="" width="28" height="28"><?php echo esc_html( $s['titulo'] ); ?></p><ul><?php foreach ( (array) $s['items'] as $it ) : ?><li data-r="up"><span class="b-ben-n"><?php echo fcc_icono( $it['icono'] ?: 'check', 'aria-hidden="true"' ); ?></span><b><?php echo esc_html( $it['titulo'] ); ?></b><span><?php echo esc_html( $it['texto'] ); ?></span></li><?php endforeach; ?></ul></div></div>
</section>
		<?php
	}
}
