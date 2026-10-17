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

			<h2>Páginas</h2>
			<?php if ( isset( $_GET['fcc_ok'] ) ) : ?>
				<div class="notice notice-success"><p>Listo: la página <b>Inicio</b> quedó creada como portada. <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Verla</a></p></div>
			<?php endif; ?>
			<p>Crea la página <b>Inicio</b> con las secciones del diseño aprobado (banner con simulador, soluciones, cifras, noticias…) y la deja como portada. Si ya existe, reemplaza su contenido de Elementor por el original.</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="fcc_crear_inicio">
				<?php wp_nonce_field( 'fcc_crear_inicio' ); ?>
				<?php submit_button( 'Crear la página Inicio', 'secondary', 'submit', false ); ?>
			</form>
		</div>
		<?php
	} );
} );

/** Crea (o restablece) la página Inicio con la plantilla de Elementor incluida en el plugin. */
add_action( 'admin_post_fcc_crear_inicio', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Sin permiso.' );
	}
	check_admin_referer( 'fcc_crear_inicio' );
	$datos = file_get_contents( FCC_DIR . 'plantillas/inicio.json' );
	$p     = get_page_by_path( 'inicio' );
	$id    = $p ? $p->ID : wp_insert_post( array( 'post_type' => 'page', 'post_title' => 'Inicio', 'post_name' => 'inicio', 'post_status' => 'publish' ) );
	if ( ! $id || is_wp_error( $id ) ) {
		wp_die( 'No se pudo crear la página.' );
	}
	update_post_meta( $id, '_elementor_edit_mode', 'builder' );
	update_post_meta( $id, '_elementor_template_type', 'wp-page' );
	update_post_meta( $id, '_elementor_version', defined( 'ELEMENTOR_VERSION' ) ? ELEMENTOR_VERSION : '4.3.5' );
	update_post_meta( $id, '_wp_page_template', 'elementor_header_footer' );
	update_post_meta( $id, '_elementor_data', wp_slash( $datos ) );
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $id );
	/* sin las fuentes y colores por defecto de Elementor: el diseño usa Manrope y sus propios colores */
	update_option( 'elementor_google_font', '0' );
	update_option( 'elementor_disable_color_schemes', 'yes' );
	update_option( 'elementor_disable_typography_schemes', 'yes' );
	if ( class_exists( '\Elementor\Plugin' ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	wp_safe_redirect( admin_url( 'options-general.php?page=fcc-ajustes&fcc_ok=1' ) );
	exit;
} );
