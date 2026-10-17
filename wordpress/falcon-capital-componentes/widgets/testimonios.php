<?php
/**
 * Testimonios de clientes (uno a la vez).
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

class FCC_Testimonios extends FCC_Widget {

	public function get_name() { return 'fc-testimonios'; }
	public function get_title() { return 'Testimonios'; }
	public function get_icon() { return 'eicon-testimonial'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->texto( 'kicker', 'Rótulo', 'Testimonios' );
		$r = new Repeater();
		$r->add_control( 'texto', array( 'label' => 'Testimonio', 'type' => Controls_Manager::TEXTAREA, 'rows' => 4, 'default' => '' ) );
		$r->add_control( 'nombre', array( 'label' => 'Nombre', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$r->add_control( 'cargo', array( 'label' => 'Cargo · Empresa', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$r->add_control( 'foto', array( 'label' => 'Foto (opcional)', 'type' => Controls_Manager::MEDIA ) );
		$this->add_control( 'items', array( 'label' => 'Testimonios', 'type' => Controls_Manager::REPEATER, 'fields' => $r->get_controls(), 'title_field' => '{{{ nombre }}}',
			'default' => array(
				array( 'texto' => 'Aquí irá el testimonio de un cliente: qué necesitaba su empresa y cómo Falcon Capital le ayudó con su liquidez.', 'nombre' => 'Nombre del cliente', 'cargo' => 'Cargo · Empresa' ),
			) ) );
		$this->add_control( 'pendiente', array( 'label' => 'Mostrar aviso «formato de ejemplo»', 'type' => Controls_Manager::SWITCHER, 'default' => 'yes' ) );
		$this->cerrar();
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$items = (array) $s['items'];
		$t     = $items[0] ?? array( 'texto' => '', 'nombre' => '', 'cargo' => '' );
		$foto  = fcc_img( $t['foto'] ?? array() );
		?>
<section class="b-sec b-testis" data-sec="testimonios">
	<div class="b-wrap b-testi">
		<span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span>
		<figure data-r="up">
			<blockquote>“<?php echo esc_html( trim( (string) $t['texto'], " \t\n\"“”" ) ); ?>”</blockquote>
			<figcaption><span class="b-testi-av"<?php echo $foto ? ' style="background:url(' . esc_url( $foto ) . ') center/cover"' : ''; ?>></span><span><b><?php echo esc_html( $t['nombre'] ); ?></b><small><?php echo esc_html( $t['cargo'] ); ?></small></span></figcaption>
		</figure>
		<?php if ( count( $items ) > 1 ) : ?><div class="b-testi-nav"><?php foreach ( $items as $i => $x ) : ?><span<?php echo $i === 0 ? ' class="is-on"' : ''; ?>></span><?php endforeach; ?></div><?php endif; ?>
		<?php if ( $s['pendiente'] === 'yes' ) : ?><p class="b-pend">Formato de ejemplo · Falcon Capital debe entregar los testimonios</p><?php endif; ?>
	</div>
</section>
		<?php
	}
}
