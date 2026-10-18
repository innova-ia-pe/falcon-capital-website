<?php
/**
 * Libro de Reclamaciones: formulario de queja o reclamo. Cada envío queda en Solicitudes (tipo «Reclamo») y
 * llega al correo de avisos.
 */
defined( 'ABSPATH' ) || exit;

class FCC_Reclamaciones extends FCC_Widget {

	public function get_name() { return 'fc-reclamaciones'; }
	public function get_title() { return 'Libro de Reclamaciones'; }
	public function get_icon() { return 'eicon-form-vertical'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->lista( 'categorias', 'Categorías de la solicitud', array(
			'titulo' => array( 'text', 'Categoría', '' ),
			'texto'  => array( 'text', 'Descripción', '' ),
		), array(
			array( 'titulo' => 'Productos y servicios', 'texto' => 'Características, funcionamiento u oferta.' ),
			array( 'titulo' => 'Infraestructura / Plataforma', 'texto' => 'Acceso, disponibilidad o desempeño.' ),
			array( 'titulo' => 'Información y comunicación', 'texto' => 'Claridad, oportunidad o contenido.' ),
			array( 'titulo' => 'Atención del personal', 'texto' => 'Trato, asesoría o seguimiento.' ),
			array( 'titulo' => 'Facturación y pagos', 'texto' => 'Cargos, cobros o procesos de pago.' ),
			array( 'titulo' => 'Seguridad y confidencialidad', 'texto' => 'Protección de datos e información.' ),
			array( 'titulo' => 'Procesos administrativos', 'texto' => 'Contratos, documentación o procedimientos.' ),
			array( 'titulo' => 'Otro', 'texto' => 'Especifica en el detalle.' ),
		), '{{{ titulo }}}' );
		$this->interruptor( 'adjuntos', 'Permitir adjuntar documentación', true, 'PDF, JPG o PNG de hasta 5 MB. Se guarda en una carpeta privada y se descarga desde Solicitudes.' );
		$this->texto( 'ok', 'Mensaje al enviar', 'Registramos tu solicitud. Te enviaremos la constancia y la respuesta dentro del plazo que establece el Código de Protección y Defensa del Consumidor.', 'textarea' );
		$this->texto( 'pendiente', 'Aviso (vacío para quitarlo)', '<b>Por confirmar con Falcon Capital.</b> Destino del registro, almacenamiento de adjuntos, constancia que recibe el consumidor y plazo de respuesta que exige el Código de Protección y Defensa del Consumidor.', 'textarea' );
		$this->cerrar();
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$campo = function ( $n, $etq, $tipo = 'text', $full = false, $extra = '' ) {
			return '<label class="lf' . ( $full ? ' lf-full' : '' ) . '"><span>' . esc_html( $etq ) . '</span><input name="' . esc_attr( $n ) . '" type="' . esc_attr( $tipo ) . '" required' . $extra . '><em class="lf-err">Completa este dato.</em></label>';
		};
		$opt = function ( $nombre, $t, $d = '' ) {
			return '<label class="b-opt"><input type="radio" name="' . esc_attr( $nombre ) . '" value="' . esc_attr( $t ) . '" required><span><b>' . esc_html( $t ) . '</b>' . ( $d ? '<small>' . esc_html( $d ) . '</small>' : '' ) . '</span></label>';
		};
		?>
<section class="b-sec b-contact" data-sec="reclamo">
	<div class="b-wrap b-claim-wrap">
		<div class="b-contact-card lead" data-r="up"><form class="lead-form b-form b-claim" novalidate data-reclamo>
			<fieldset><legend><i>1</i>Identificación del consumidor reclamante</legend>
				<div class="lf-grid"><?php echo $campo( 'nombre', 'Nombre / Razón social' ) . $campo( 'email', 'Correo electrónico', 'email' ) . $campo( 'telefono', 'Teléfono', 'tel' ) . $campo( 'direccion', 'Dirección' ) . $campo( 'documento', 'DNI / CE / RUC' ); ?></div>
			</fieldset>
			<fieldset><legend><i>2</i>Identificación del bien contratado</legend>
				<div class="lf-grid"><?php echo $campo( 'monto', 'Monto reclamado', 'text', true, ' inputmode="decimal"' ); ?><label class="lf lf-full"><span>Descripción</span><textarea name="descripcion" rows="3"></textarea></label></div>
			</fieldset>
			<fieldset><legend><i>3</i>Detalle de la reclamación</legend>
				<p class="b-claim-lbl">Tipo de solicitud</p>
				<div class="b-opts b-opts-2"><?php echo $opt( 'tipo_solicitud', 'Queja', 'Malestar o descontento respecto a algún aspecto de la experiencia en Falcon Capital.' ) . $opt( 'tipo_solicitud', 'Reclamo', 'Disconformidad relacionada a productos o servicios brindados por Falcon Capital.' ); ?></div>
				<p class="b-claim-lbl">Categoría de la solicitud <small>Selecciona el tema que mejor describa tu solicitud.</small></p>
				<div class="b-opts"><?php foreach ( (array) $s['categorias'] as $c ) { echo $opt( 'categoria', $c['titulo'], $c['texto'] ); } ?></div>
				<div class="lf-grid b-claim-det"><label class="lf lf-full"><span>Detalle de la solicitud</span><textarea name="detalle" rows="5" placeholder="Cuéntanos más sobre tu solicitud…" required></textarea><em class="lf-err">Cuéntanos el detalle.</em></label>
					<?php if ( $s['adjuntos'] === 'yes' ) : ?><label class="lf lf-full"><span>Adjuntar documentación (opcional)</span><input name="adjunto" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"><em class="lf-err">Solo PDF, JPG o PNG de hasta 5 MB.</em></label><?php endif; ?></div>
			</fieldset>
			<fieldset><legend><i>4</i>Medio por el que deseas ser contactado</legend>
				<div class="b-opts b-segs"><?php foreach ( array( 'Correo electrónico', 'Llamada telefónica', 'SMS', 'WhatsApp' ) as $m ) { echo $opt( 'medio', $m ); } ?></div>
			</fieldset>
			<input type="text" name="web" value="" tabindex="-1" autocomplete="off" class="screen-reader-text" aria-hidden="true">
			<button class="lf-send" type="submit"><span>Enviar reclamo</span><?php echo fcc_icono( 'flecha' ); ?></button>
			<p class="b-demo-ok" data-reclamo-ok tabindex="-1" hidden><?php echo esc_html( $s['ok'] ); ?></p>
		</form></div>
		<?php if ( $s['pendiente'] ) : ?><div class="b-pending" data-r="up"><?php echo fcc_txt( $s['pendiente'] ); ?></div><?php endif; ?>
	</div>
</section>
		<?php
	}
}
