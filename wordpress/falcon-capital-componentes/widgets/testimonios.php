<?php
/**
 * Testimonios de clientes: uno a la vez; con dos o más, rotan solos y se cambian con los puntos o con el dedo.
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
		$r->add_control( 'texto', array( 'label' => 'Testimonio', 'type' => Controls_Manager::TEXTAREA, 'rows' => 4, 'default' => '', 'description' => 'Sin comillas: se agregan solas.' ) );
		$r->add_control( 'nombre', array( 'label' => 'Nombre', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$r->add_control( 'cargo', array( 'label' => 'Cargo · Empresa', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$r->add_control( 'foto', array( 'label' => 'Foto (opcional)', 'type' => Controls_Manager::MEDIA ) );
		$ej = 'Nombre del cliente';
		$this->add_control( 'items', array( 'label' => 'Testimonios', 'type' => Controls_Manager::REPEATER, 'fields' => $r->get_controls(), 'title_field' => '{{{ nombre }}}',
			'default' => array(
				array( 'texto' => 'Aquí irá el testimonio de un cliente: qué necesitaba su empresa y cómo Falcon Capital le ayudó con su liquidez.', 'nombre' => $ej, 'cargo' => 'Cargo · Empresa' ),
				array( 'texto' => 'Aquí irá un segundo testimonio: cuánto tardó el desembolso y cómo fue el acompañamiento del equipo.', 'nombre' => $ej, 'cargo' => 'Cargo · Empresa' ),
				array( 'texto' => 'Aquí irá un tercer testimonio: qué cambió en el flujo de caja de su empresa después de trabajar con Falcon Capital.', 'nombre' => $ej, 'cargo' => 'Cargo · Empresa' ),
			) ) );
		$this->nota( 'items_nota', 'Con dos o más testimonios aparecen los puntos y rotan cada 8 segundos.' );
		$this->add_control( 'pendiente', array( 'label' => 'Mostrar aviso «formato de ejemplo»', 'type' => Controls_Manager::SWITCHER, 'default' => 'yes', 'description' => 'Apágalo cuando estén los testimonios reales.' ) );
		$this->cerrar();
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$items = array_values( array_filter( (array) $s['items'], fn( $t ) => trim( (string) ( $t['texto'] ?? '' ) ) !== '' ) );
		if ( ! $items ) {
			return;
		}
		$varios = count( $items ) > 1;
		?>
<section class="b-sec b-testis" data-sec="testimonios">
	<div class="b-wrap b-testi">
		<?php if ( $s['kicker'] ) : ?><span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span><?php endif; ?>
		<div class="b-testi-track" data-r="up"<?php echo $varios ? ' aria-live="polite"' : ''; ?>>
			<?php foreach ( $items as $i => $t ) : $foto = fcc_img( $t['foto'] ?? array() ); ?>
			<figure<?php echo $i === 0 ? ' class="is-on"' : ' aria-hidden="true"'; ?>>
				<blockquote>“<?php echo esc_html( trim( (string) $t['texto'], " \t\n\"“”" ) ); ?>”</blockquote>
				<figcaption><span class="b-testi-av"<?php echo $foto ? ' style="background:url(' . esc_url( $foto ) . ') center/cover"' : ''; ?>></span><span><b><?php echo esc_html( $t['nombre'] ); ?></b><small><?php echo esc_html( $t['cargo'] ); ?></small></span></figcaption>
			</figure>
			<?php endforeach; ?>
		</div>
		<?php if ( $varios ) : ?><div class="b-testi-nav"><?php foreach ( $items as $i => $t ) : ?><button type="button"<?php echo $i === 0 ? ' class="is-on" aria-current="true"' : ''; ?> aria-label="<?php echo esc_attr( sprintf( 'Testimonio %d', $i + 1 ) ); ?>"></button><?php endforeach; ?></div><?php endif; ?>
		<?php if ( $s['pendiente'] === 'yes' ) : ?><p class="b-pend">Formato de ejemplo · Falcon Capital debe entregar los testimonios</p><?php endif; ?>
	</div>
</section>
		<?php
	}
}
