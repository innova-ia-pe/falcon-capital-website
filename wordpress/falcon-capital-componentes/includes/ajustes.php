<?php
/**
 * Ajustes → Falcon Capital: tasa del simulador y correo que recibe los avisos de solicitudes.
 */
defined( 'ABSPATH' ) || exit;

add_action( 'admin_init', function () {
	register_setting( 'fcc_ajustes', 'fc_tasa_tem', array(
		'type'              => 'number',
		'default'           => 1.80,
		'sanitize_callback' => fn( $v ) => max( 0, min( 10, (float) str_replace( ',', '.', (string) $v ) ) ),
	) );
	register_setting( 'fcc_ajustes', 'fcc_correo_avisos', array( 'type' => 'string', 'sanitize_callback' => 'sanitize_email' ) );
} );

add_action( 'admin_menu', function () {
	add_options_page( 'Falcon Capital', 'Falcon Capital', 'manage_options', 'fcc-ajustes', function () {
		?>
		<div class="wrap">
			<h1>Falcon Capital</h1>
			<form method="post" action="options.php">
				<?php settings_fields( 'fcc_ajustes' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="fc_tasa_tem">Tasa referencial del simulador (TEM %)</label></th>
						<td><input name="fc_tasa_tem" id="fc_tasa_tem" type="number" step="0.01" min="0" max="10" value="<?php echo esc_attr( get_option( 'fc_tasa_tem', 1.80 ) ); ?>" class="small-text"> %
							<p class="description">Tasa efectiva mensual de pizarra para todos los plazos (minuta 006: 1.80 %). Comisión: 1 % más IGV.</p></td>
					</tr>
					<tr>
						<th scope="row"><label for="fcc_correo_avisos">Correo que recibe las solicitudes</label></th>
						<td><input name="fcc_correo_avisos" id="fcc_correo_avisos" type="email" value="<?php echo esc_attr( get_option( 'fcc_correo_avisos', get_option( 'admin_email' ) ) ); ?>" class="regular-text">
							<p class="description">Cada solicitud del simulador o de los formularios llega a este correo y queda en «Solicitudes».</p></td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>

			<h2>Páginas del sitio</h2>
			<?php if ( isset( $_GET['fcc_ok'] ) ) : $n = array_map( 'intval', explode( ',', sanitize_text_field( wp_unslash( $_GET['fcc_ok'] ) ) ) ); ?>
				<div class="notice notice-success"><p>Listo: <?php echo (int) ( $n[0] ?? 0 ); ?> páginas creadas, <?php echo (int) ( $n[1] ?? 0 ); ?> restablecidas, <?php echo (int) ( $n[2] ?? 0 ); ?> entradas del blog y <?php echo (int) ( $n[3] ?? 0 ); ?> temas del asistente. <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Ver el sitio</a></p></div>
			<?php endif; ?>
			<p>Crea las páginas con el diseño aprobado: Inicio, Factoring, Confirming, Capital de Trabajo, Simulador, Conócenos, Blog, Contáctanos, Preguntas frecuentes, Iniciar sesión, Crea tu cuenta, Libro de Reclamaciones, Gracias y las páginas legales; además, las entradas del blog y los temas iniciales del asistente virtual.</p>
			<p>Las páginas se editan con Elementor (secciones en la categoría «Falcon Capital»); las legales, con el editor de WordPress.</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
				<input type="hidden" name="action" value="fcc_instalar">
				<?php wp_nonce_field( 'fcc_instalar' ); ?>
				<?php submit_button( 'Crear lo que falta', 'primary', 'crear', false ); ?>
				<?php submit_button( 'Restablecer las páginas al diseño original', 'secondary', 'restablecer', false, array( 'onclick' => "return confirm('Las páginas armadas con Elementor vuelven a la versión del diseño y se pierden los cambios hechos en ellas. ¿Continuar?')" ) ); ?>
			</form>
		</div>
		<?php
	} );
} );
