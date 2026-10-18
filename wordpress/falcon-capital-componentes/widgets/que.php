<?php
/**
 * «¿Qué es…?»: explicación de la solución con beneficios y la línea de pasos «Así funciona».
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

class FCC_Que extends FCC_Widget {

	public function get_name() { return 'fc-que'; }
	public function get_title() { return '¿Qué es? y cómo funciona'; }
	public function get_icon() { return 'eicon-time-line'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Explicación' );
		$this->texto( 'kicker', 'Rótulo', '¿Qué es el factoring en Falcon Capital?' );
		$this->texto( 'titulo', 'Título', 'Liquidez ágil para impulsar el crecimiento de tu negocio', 'textarea', array( 'rows' => 2 ) );
		$this->texto( 'texto', 'Texto (separa los párrafos con una línea en blanco)', '', 'textarea', array( 'rows' => 6 ) );
		$this->lista( 'beneficios', 'Beneficios', array(
			'icono'  => array( 'icono', 'Ícono', 'rayo' ),
			'titulo' => array( 'text', 'Título', '' ),
			'texto'  => array( 'textarea', 'Texto', '' ),
		), array(), '{{{ titulo }}}' );
		$this->cerrar();

		$this->abrir( 'sec_pasos', 'Así funciona' );
		$this->texto( 'pasos_t', 'Título de los pasos', 'Así funciona' );
		$r = new Repeater();
		$r->add_control( 'marca', array( 'label' => 'Marca del paso', 'type' => Controls_Manager::SELECT, 'default' => 'icono',
			'options' => array( 'icono' => 'Ícono', 'falcon' => 'Isotipo de Falcon Capital', 'logo' => 'Logo (imagen)' ) ) );
		$r->add_control( 'icono', array( 'label' => 'Ícono', 'type' => Controls_Manager::SELECT, 'options' => fcc_iconos(), 'default' => 'subir', 'condition' => array( 'marca' => 'icono' ) ) );
		$r->add_control( 'logo', array( 'label' => 'Logo', 'type' => Controls_Manager::MEDIA, 'condition' => array( 'marca' => 'logo' ) ) );
		$r->add_control( 'titulo', array( 'label' => 'Título', 'type' => Controls_Manager::TEXT, 'default' => '', 'label_block' => true ) );
		$r->add_control( 'texto', array( 'label' => 'Texto', 'type' => Controls_Manager::TEXT, 'default' => '', 'label_block' => true ) );
		$this->add_control( 'pasos', array( 'label' => 'Pasos', 'type' => Controls_Manager::REPEATER, 'fields' => $r->get_controls(), 'title_field' => '{{{ titulo }}}', 'default' => array() ) );
		$this->cerrar();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-sec b-que" id="b-que" data-sec="que">
	<div class="b-wrap b-que-grid">
		<div class="b-que-side">
			<span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span>
			<h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2>
			<?php echo fcc_parrafos( $s['texto'] ); ?>
			<?php if ( ! empty( $s['beneficios'] ) ) : ?>
			<ul class="b-que-ben" data-r="up"><?php foreach ( $s['beneficios'] as $b ) : ?><li><span><?php echo fcc_icono( $b['icono'] ?: 'check' ); ?></span><div><b><?php echo esc_html( $b['titulo'] ); ?></b><small><?php echo esc_html( $b['texto'] ); ?></small></div></li><?php endforeach; ?></ul>
			<?php endif; ?>
		</div>
		<?php if ( ! empty( $s['pasos'] ) ) : ?>
		<div class="b-tl" data-flow>
			<p class="b-tl-k" data-r="up"><?php echo esc_html( $s['pasos_t'] ); ?></p>
			<ol><span class="b-tl-line" aria-hidden="true"><i data-flow-bar></i></span><?php foreach ( $s['pasos'] as $i => $p ) : ?><li class="b-tl-i"><span class="b-tl-dot"><?php
				if ( ( $p['marca'] ?? 'icono' ) === 'falcon' ) {
					echo '<img class="lg" src="' . esc_url( fcc_img_tema( 'isotipo-falcon.png' ) ) . '" alt="Falcon Capital" width="40" height="40">';
				} elseif ( ( $p['marca'] ?? '' ) === 'logo' ) {
					echo '<img class="lg lg-w" src="' . esc_url( fcc_img( $p['logo'] ?? array() ) ) . '" alt="" width="96" height="25">';
				} else {
					echo fcc_icono( $p['icono'] ?: 'check' );
				}
			?></span><div><span class="b-tl-n">Paso <?php echo esc_html( str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span><b><?php echo esc_html( $p['titulo'] ); ?></b><p><?php echo esc_html( $p['texto'] ); ?></p></div></li><?php endforeach; ?></ol>
		</div>
		<?php endif; ?>
	</div>
</section>
		<?php
	}
}
