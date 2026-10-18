<?php
/**
 * Formulario de contacto («Contacta a un experto»). Cada envío llega a Solicitudes y al correo de avisos.
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;

class FCC_Contacto extends FCC_Widget {

	public function get_name() { return 'fc-contacto'; }
	public function get_title() { return 'Formulario de contacto'; }
	public function get_icon() { return 'eicon-form-horizontal'; }
	public function get_keywords() { return array( 'falcon', 'formulario', 'contacto', 'lead' ); }

	protected function register_controls() {
		$this->abrir( 'sec', 'Texto' );
		$this->texto( 'kicker', 'Rótulo', 'Contacto' );
		$this->texto( 'titulo', 'Título', 'Contacta a un experto' );
		$this->texto( 'texto', 'Texto', 'Llena tus datos y nos comunicaremos contigo. La evaluación es gratuita y no compromete a tu empresa.', 'textarea' );
		$this->interruptor( 'con_req', 'Mostrar «Ten a la mano»' );
		$this->texto( 'req_t', 'Requisitos · título', 'Ten a la mano' );
		$this->texto( 'req', 'Requisitos (uno por línea)', "Ficha RUC\nDNI del representante\nVigencia de poderes\nReporte tributario", 'textarea', array( 'rows' => 4 ) );
		$this->texto( 'req_n', 'Requisitos · nota', 'La documentación adicional será evaluada según el tipo de empresa. Las tasas y líneas aprobadas se definen tras el análisis financiero.', 'textarea' );
		$this->interruptor( 'con_canales', 'Mostrar WhatsApp y correo' );
		$this->cerrar();

		$this->abrir( 'sec_form', 'Formulario' );
		$this->add_control( 'producto', array( 'label' => 'Solución elegida al abrir', 'type' => Controls_Manager::SELECT, 'default' => '',
			'options' => array( '' => 'Ninguna (la elige la persona)', 'factoring' => 'Factoring', 'confirming' => 'Confirming', 'capital' => 'Capital de Trabajo' ) ) );
		$this->texto( 'boton', 'Texto del botón', 'Solicita información' );
		$this->texto( 'seguro', 'Nota bajo el botón', 'La evaluación es gratuita y no compromete a tu empresa.' );
		$this->texto( 'ok_texto', 'Mensaje al enviar', 'Un ejecutivo de Falcon Capital te contactará en horario de atención.', 'textarea' );
		$this->nota( 'nota', 'Cada envío queda en <b>Solicitudes</b> y llega al correo configurado en <b>Ajustes → Falcon Capital</b>.' );
		$this->cerrar();
	}

	protected function render() {
		$s      = $this->get_settings_for_display();
		$prod   = $s['producto'] ?? '';
		$opts   = array( 'factoring' => 'Factoring', 'confirming' => 'Confirming', 'capital' => 'Capital de Trabajo' );
		$correo = function_exists( 'fc_dato' ) ? fc_dato( 'correo' ) : 'info@falconcapital.pe';
		$tel    = function_exists( 'fc_dato' ) ? fc_dato( 'telefono' ) : '955 447 475';
		$priv   = get_privacy_policy_url() ?: fcc_pag( 'politica-de-privacidad' );
		$chev   = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
		?>
<section class="b-sec b-contact" id="b-contacto" data-sec="contacto">
	<div class="b-wrap b-contact-grid">
		<div class="b-contact-side">
			<span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span>
			<h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2>
			<p data-r="up"><?php echo fcc_txt( $s['texto'] ); ?></p>
			<?php if ( $s['con_req'] === 'yes' && fcc_lineas( $s['req'] ) ) : ?><div class="b-req" data-r="up"><b><?php echo esc_html( $s['req_t'] ); ?></b><ul><?php foreach ( fcc_lineas( $s['req'] ) as $r ) : ?><li><?php echo fcc_icono( 'documento' ); ?><?php echo esc_html( $r ); ?></li><?php endforeach; ?></ul><?php if ( $s['req_n'] ) : ?><small><?php echo esc_html( $s['req_n'] ); ?></small><?php endif; ?></div><?php endif; ?>
			<?php if ( $s['con_canales'] === 'yes' ) : ?>
			<div class="b-contact-ch" data-r="up">
				<a href="<?php echo esc_url( fcc_resolver( 'whatsapp:' ) ); ?>" target="_blank" rel="noopener"><?php echo fcc_icono( 'whatsapp' ); ?><span><small>WhatsApp</small><?php echo esc_html( $tel ); ?></span></a>
				<a href="mailto:<?php echo esc_attr( $correo ); ?>"><?php echo fcc_icono( 'correo' ); ?><span><small>Correo</small><?php echo esc_html( $correo ); ?></span></a>
			</div>
			<?php endif; ?>
		</div>
		<div class="b-contact-card lead" data-r="up"><form class="lead-form b-form" novalidate data-contacto data-prod="<?php echo esc_attr( $prod ); ?>">
				<div class="lf-grid">
					<label class="lf"><span>Razón social</span><input name="razon" type="text" placeholder="Ej. Comercial Andina S.A.C." autocomplete="organization" required><em class="lf-err">Escribe la razón social.</em></label>
					<label class="lf"><span>RUC de tu empresa</span><input name="ruc" type="text" placeholder="20123456789" inputmode="numeric" maxlength="11" required data-digits><em class="lf-err">El RUC tiene 11 dígitos y empieza con 10 o 20.</em></label>
					<label class="lf"><span>Nombre y apellido</span><input name="nombre" type="text" placeholder="Ej. Ana Torres" autocomplete="name" required><em class="lf-err">Escribe tu nombre y apellido.</em></label>
					<label class="lf"><span>Correo</span><input name="email" type="email" placeholder="nombre@empresa.com" autocomplete="email" required><em class="lf-err">Revisa tu correo.</em></label>
					<label class="lf"><span>Celular</span><span class="lf-ph"><b>+51</b><input name="celular" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="11" required placeholder="912 345 678" data-phone></span><em class="lf-err">Revisa tu número de 9 dígitos.</em></label>
					<label class="lf"><span>Solución</span><span class="lf-sel"><select name="solucion" required><?php foreach ( $opts as $k => $n ) : ?><option value="<?php echo esc_attr( $k ); ?>"<?php selected( $prod, $k ); ?>><?php echo esc_html( $n ); ?></option><?php endforeach; ?></select><?php echo $chev; ?></span><em class="lf-err">Elige una solución.</em></label>
				</div>
				<label class="lf-ck"><input type="checkbox" name="acepto" required><span>Acepto la <a href="<?php echo esc_url( $priv ); ?>" target="_blank">Política de Privacidad</a> y que Falcon Capital me contacte.</span></label>
				<input type="text" name="web" value="" tabindex="-1" autocomplete="off" class="screen-reader-text" aria-hidden="true">
				<button class="lf-send" type="submit"><span><?php echo esc_html( $s['boton'] ); ?></span><?php echo fcc_icono( 'flecha' ); ?></button>
				<?php if ( $s['seguro'] ) : ?><p class="lf-safe"><?php echo fcc_icono( 'candado' ); ?> <?php echo esc_html( $s['seguro'] ); ?></p><?php endif; ?>
			</form>
			<div class="lead-ok" hidden tabindex="-1">
				<span class="lead-ok-ico"><?php echo fcc_icono( 'check' ); ?></span>
				<h3>¡Listo, <span data-ok-name>gracias</span>!</h3>
				<p>Recibimos tu solicitud de <b data-ok-prod>Factoring</b>. <?php echo esc_html( $s['ok_texto'] ); ?></p>
				<ol class="lead-steps">
					<li><b>Revisamos tu solicitud</b> y los datos de tu empresa.</li>
					<li><b>Te contactamos</b> por llamada o WhatsApp.</li>
					<li><b>Recibes tu propuesta formal</b> con la tasa final.</li>
				</ol>
				<div class="lead-ok-acts">
					<a class="lead-wa" data-wa href="<?php echo esc_url( fcc_resolver( 'whatsapp:' ) ); ?>" target="_blank" rel="noopener"><?php echo fcc_icono( 'whatsapp' ); ?> Continuar por WhatsApp</a>
					<a class="lead-acc" href="<?php echo esc_url( fcc_pag( 'registro' ) ); ?>">Crea tu cuenta <?php echo fcc_icono( 'flecha' ); ?></a>
				</div>
			</div></div>
	</div>
</section>
		<?php
	}
}
