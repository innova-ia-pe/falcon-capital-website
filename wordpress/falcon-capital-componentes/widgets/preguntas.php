<?php
/**
 * Preguntas frecuentes: acordeón editable y un recuadro para escribir por WhatsApp.
 */
defined( 'ABSPATH' ) || exit;

class FCC_Preguntas extends FCC_Widget {

	public function get_name() { return 'fc-preguntas'; }
	public function get_title() { return 'Preguntas frecuentes'; }
	public function get_icon() { return 'eicon-accordion'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Preguntas' );
		$this->lista( 'items', 'Preguntas', array(
			'pregunta'  => array( 'text', 'Pregunta', '' ),
			'respuesta' => array( 'textarea', 'Respuesta', '' ),
		), array(
			array( 'pregunta' => '¿Qué es el factoring?', 'respuesta' => 'Es una solución financiera ágil en la que tu empresa cede facturas por cobrar a Falcon Capital para obtener liquidez.' ),
		), '{{{ pregunta }}}' );
		$this->interruptor( 'abierta', 'La primera pregunta se muestra abierta' );
		$this->texto( 'pendiente', 'Aviso de contenido pendiente (vacío para quitarlo)', '', 'textarea' );
		$this->cerrar();

		$this->abrir( 'sec_cta', 'Recuadro final' );
		$this->texto( 'cta_t', 'Texto', '¿No encuentras tu respuesta?' );
		$this->texto( 'cta_b', 'Botón', 'Escríbenos por WhatsApp' );
		$this->enlace( 'cta_url', 'Destino del botón', 'whatsapp:' );
		$this->cerrar();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-sec b-art" data-sec="preguntas">
	<div class="b-wrap b-faq-wrap">
		<div class="b-faq" data-r="up"><?php foreach ( (array) $s['items'] as $i => $it ) : ?><details<?php echo ( $i === 0 && $s['abierta'] === 'yes' ) ? ' open' : ''; ?>><summary><?php echo esc_html( $it['pregunta'] ); ?><i aria-hidden="true"></i></summary><p><?php echo fcc_txt( nl2br( $it['respuesta'], false ) ); ?></p></details><?php endforeach; ?></div>
		<?php if ( $s['pendiente'] ) : ?><div class="b-pending"><?php echo fcc_txt( $s['pendiente'] ); ?></div><?php endif; ?>
		<?php if ( $s['cta_t'] ) : ?><div class="b-art-cta"><b><?php echo esc_html( $s['cta_t'] ); ?></b><?php if ( $s['cta_b'] ) : ?><a class="b-btn b-btn-em" <?php echo fcc_href( $s['cta_url'] ); ?>><?php echo esc_html( $s['cta_b'] ); ?> <?php echo fcc_icono( 'flecha' ); ?></a><?php endif; ?></div><?php endif; ?>
	</div>
</section>
		<?php
	}
}
