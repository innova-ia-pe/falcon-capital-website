<?php
/**
 * Cómo funciona el confirming: las tres partes, lo que gana cada lado y las ventajas.
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

class FCC_Confirming_Partes extends FCC_Widget {

	public function get_name() { return 'fc-confirming-partes'; }
	public function get_title() { return 'Partes y ventajas (confirming)'; }
	public function get_icon() { return 'eicon-flow'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Partes' );
		$this->texto( 'kicker', 'Rótulo', 'Cómo funciona el confirming' );
		$this->texto( 'titulo', 'Título', 'Tres partes, un mismo objetivo: *que nadie se quede sin liquidez*', 'textarea', array( 'rows' => 2 ) );
		$r = new Repeater();
		$r->add_control( 'marca', array( 'label' => 'Marca', 'type' => Controls_Manager::SELECT, 'default' => 'icono', 'options' => array( 'icono' => 'Ícono', 'falcon' => 'Isotipo de Falcon Capital' ) ) );
		$r->add_control( 'icono', array( 'label' => 'Ícono', 'type' => Controls_Manager::SELECT, 'options' => fcc_iconos(), 'default' => 'fabrica', 'condition' => array( 'marca' => 'icono' ) ) );
		$r->add_control( 'titulo', array( 'label' => 'Título', 'type' => Controls_Manager::TEXT, 'default' => 'Título' ) );
		$r->add_control( 'texto', array( 'label' => 'Texto', 'type' => Controls_Manager::TEXTAREA, 'default' => 'Descripción.' ) );
		$this->add_control( 'partes', array( 'label' => 'Partes', 'type' => Controls_Manager::REPEATER, 'fields' => $r->get_controls(), 'title_field' => '{{{ titulo }}}', 'default' => array() ) );
		$this->cerrar();

		$this->abrir( 'sec_gana', 'Lo que gana cada parte' );
		$this->texto( 'gana1_t', 'Columna 1 · título', 'Lo que gana tu empresa' );
		$this->texto( 'gana1', 'Columna 1 · puntos (uno por línea)', '', 'textarea', array( 'rows' => 4 ) );
		$this->texto( 'gana2_t', 'Columna 2 · título', 'Lo que ganan tus proveedores' );
		$this->texto( 'gana2', 'Columna 2 · puntos (uno por línea)', '', 'textarea', array( 'rows' => 4 ) );
		$this->cerrar();

		$this->abrir( 'sec_ven', 'Ventajas' );
		$this->texto( 'ven_tag', 'Etiqueta', 'Ideal para empresas con alta rotación de proveedores' );
		$this->texto( 'ven_t', 'Título', '5 ventajas del confirming' );
		$this->lista( 'ventajas', 'Ventajas', array(
			'icono'  => array( 'icono', 'Ícono', 'billetera' ),
			'titulo' => array( 'text', 'Texto', '' ),
		), array(), '{{{ titulo }}}' );
		$this->cerrar();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		$col = function ( $t, $txt, $alt ) {
			if ( ! fcc_lineas( $txt ) ) {
				return;
			}
			echo '<div class="b-gana-col' . ( $alt ? ' b-gana-alt' : '' ) . '" data-r="up"><h3>' . esc_html( $t ) . '</h3><ul>';
			foreach ( fcc_lineas( $txt ) as $l ) {
				echo '<li>' . fcc_icono( 'check' ) . esc_html( $l ) . '</li>';
			}
			echo '</ul></div>';
		};
		?>
<section class="b-sec b-conf" data-sec="confirming-detalle">
	<div class="b-wrap">
		<div class="b-head"><div><span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span><h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2></div></div>
		<?php if ( ! empty( $s['partes'] ) ) : ?><ul class="b-partes" data-partes><?php foreach ( $s['partes'] as $p ) : ?><li data-r="up"><span class="b-parte-i"><?php echo ( $p['marca'] ?? '' ) === 'falcon' ? '<img class="lg" src="' . esc_url( fcc_img_tema( 'isotipo-falcon.png' ) ) . '" alt="Falcon Capital" width="40" height="40">' : fcc_icono( $p['icono'] ?: 'check' ); ?></span><b><?php echo esc_html( $p['titulo'] ); ?></b><span><?php echo esc_html( $p['texto'] ); ?></span></li><?php endforeach; ?></ul><?php endif; ?>
		<div class="b-gana"><?php $col( $s['gana1_t'], $s['gana1'], false ); $col( $s['gana2_t'], $s['gana2'], true ); ?></div>
		<?php if ( ! empty( $s['ventajas'] ) ) : ?><div class="b-ven"><div class="b-ven-h" data-r="up"><?php if ( $s['ven_tag'] ) : ?><span class="b-tag"><?php echo esc_html( $s['ven_tag'] ); ?></span><?php endif; ?><h3><?php echo esc_html( $s['ven_t'] ); ?></h3></div><ol><?php foreach ( $s['ventajas'] as $v ) : ?><li data-r="up"><span><?php echo fcc_icono( $v['icono'] ?: 'check', 'aria-hidden="true"' ); ?></span><b><?php echo esc_html( $v['titulo'] ); ?></b></li><?php endforeach; ?></ol></div><?php endif; ?>
	</div>
</section>
		<?php
	}
}
