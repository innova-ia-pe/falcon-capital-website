<?php
/**
 * Canales de atención: WhatsApp, correo y horario (abierto o cerrado según la hora de Lima).
 * El número y el correo salen de Apariencia → Personalizar → Falcon Capital.
 */
defined( 'ABSPATH' ) || exit;

class FCC_Canales extends FCC_Widget {

	public function get_name() { return 'fc-canales'; }
	public function get_title() { return 'Canales de atención'; }
	public function get_icon() { return 'eicon-headphones'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->texto( 'kicker', 'Rótulo', 'Canales de atención' );
		$this->texto( 'titulo', 'Título', 'Una respuesta ágil, cercana y especializada', 'textarea' );
		$this->texto( 'wa_t', 'WhatsApp · título', 'WhatsApp' );
		$this->texto( 'wa_d', 'WhatsApp · texto', 'Atención directa con un ejecutivo comercial, de lunes a viernes.' );
		$this->texto( 'co_t', 'Correo · título', 'Correo' );
		$this->texto( 'co_d', 'Correo · texto', 'Escríbenos con el detalle de tu consulta y te respondemos en el día.' );
		$this->texto( 'ho_t', 'Horario · título', 'Horario de atención' );
		$this->texto( 'ho_d', 'Horario · texto', 'Lunes a viernes, de 9:00 a. m. a 6:00 p. m.' );
		$this->nota( 'nota', 'El número de WhatsApp y el correo se cambian en <b>Apariencia → Personalizar → Falcon Capital · datos de contacto</b>.' );
		$this->cerrar();
	}

	protected function render() {
		$s      = $this->get_settings_for_display();
		$tel    = function_exists( 'fc_dato' ) ? fc_dato( 'telefono' ) : '955 447 475';
		$correo = function_exists( 'fc_dato' ) ? fc_dato( 'correo' ) : 'info@falconcapital.pe';
		$wa     = fcc_resolver( 'whatsapp:' );
		?>
<section class="b-sec b-can" id="b-canales" data-sec="canales">
	<div class="b-wrap">
		<div class="b-head b-head-c"><div><span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span><h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2></div></div>
		<div class="b-can-grid"><a class="b-ch" href="<?php echo esc_url( $wa ); ?>" target="_blank" rel="noopener" data-r="up">
				<span class="b-ch-i"><?php echo fcc_icono( 'whatsapp' ); ?></span><span class="b-ch-t"><b><?php echo esc_html( $s['wa_t'] ); ?></b><small><?php echo esc_html( $s['wa_d'] ); ?></small></span><span class="b-ch-v"><?php echo esc_html( $tel ); ?> <?php echo fcc_icono( 'externo' ); ?></span>
			</a><a class="b-ch" href="mailto:<?php echo esc_attr( $correo ); ?>" data-r="up">
				<span class="b-ch-i"><?php echo fcc_icono( 'correo' ); ?></span><span class="b-ch-t"><b><?php echo esc_html( $s['co_t'] ); ?></b><small><?php echo esc_html( $s['co_d'] ); ?></small></span><span class="b-ch-v"><?php echo esc_html( $correo ); ?> <?php echo fcc_icono( 'externo' ); ?></span>
			</a><div class="b-ch" data-r="up">
				<span class="b-ch-i"><?php echo fcc_icono( 'reloj' ); ?></span><span class="b-ch-t"><b><?php echo esc_html( $s['ho_t'] ); ?></b><small><?php echo esc_html( str_replace( array( ' a. m.', ' p. m.' ), array( "\u{00a0}a.\u{00a0}m.", "\u{00a0}p.\u{00a0}m." ), $s['ho_d'] ) ); ?></small></span><span class="b-ch-v b-open" data-open><i></i><span>Horario de Lima</span></span>
			</div></div>
	</div>
</section>
		<?php
	}
}
