<?php
/**
 * Solicitudes del simulador, de los formularios de contacto y del boletín.
 *
 * Se guardan como entradas privadas («Solicitudes» en el escritorio), se avisa por correo y se dispara la acción
 * «fcc_solicitud_creada» para conectar luego el CRM (Faast). Endpoint: POST /wp-json/falcon/v1/solicitudes.
 */
defined( 'ABSPATH' ) || exit;

const FCC_CAMPOS = array(
	'tipo'     => 'Tipo',
	'producto' => 'Solución',
	'nombre'   => 'Nombre',
	'ruc'      => 'RUC',
	'celular'  => 'Celular',
	'email'    => 'Correo',
	'monto'    => 'Monto',
	'moneda'   => 'Moneda',
	'dias'     => 'Plazo (días)',
	'neto'     => 'Recibiría (referencial)',
	'mensaje'  => 'Mensaje',
	'pagina'   => 'Página',
);

add_action( 'init', function () {
	register_post_type( 'fc_solicitud', array(
		'labels'          => array(
			'name'          => 'Solicitudes',
			'singular_name' => 'Solicitud',
			'menu_name'     => 'Solicitudes',
			'all_items'     => 'Todas las solicitudes',
			'edit_item'     => 'Solicitud',
			'search_items'  => 'Buscar solicitudes',
			'not_found'     => 'Aún no hay solicitudes.',
		),
		'public'          => false,
		'show_ui'         => true,
		'show_in_menu'    => true,
		'menu_position'   => 26,
		'menu_icon'       => 'dashicons-email-alt',
		'supports'        => array( 'title' ),
		'capability_type' => 'post',
		'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
		'map_meta_cap'    => true,
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'falcon/v1', '/solicitudes', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => 'fcc_recibir_solicitud',
	) );
} );

function fcc_recibir_solicitud( WP_REST_Request $req ) {
	$d = (array) $req->get_json_params();

	/* trampa para robots: el campo «web» nunca lo ve una persona */
	if ( ! empty( $d['web'] ) ) {
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}
	/* límite simple por IP: 12 solicitudes por hora */
	$ip    = sanitize_text_field( $_SERVER['REMOTE_ADDR'] ?? '' );
	$clave = 'fcc_lim_' . md5( $ip );
	$n     = (int) get_transient( $clave );
	if ( $n >= 12 ) {
		return new WP_Error( 'fcc_limite', 'Demasiadas solicitudes. Inténtalo más tarde.', array( 'status' => 429 ) );
	}
	set_transient( $clave, $n + 1, HOUR_IN_SECONDS );

	$tipo = in_array( $d['tipo'] ?? '', array( 'simulador', 'contacto', 'boletin' ), true ) ? $d['tipo'] : 'contacto';
	$v    = array(
		'tipo'     => $tipo,
		'producto' => sanitize_key( $d['producto'] ?? '' ),
		'nombre'   => sanitize_text_field( $d['nombre'] ?? '' ),
		'ruc'      => preg_replace( '/\D/', '', (string) ( $d['ruc'] ?? '' ) ),
		'celular'  => preg_replace( '/[^\d+]/', '', (string) ( $d['celular'] ?? '' ) ),
		'email'    => sanitize_email( $d['email'] ?? '' ),
		'monto'    => isset( $d['monto'] ) && is_numeric( $d['monto'] ) ? (float) $d['monto'] : '',
		'moneda'   => in_array( $d['moneda'] ?? '', array( 'PEN', 'USD' ), true ) ? $d['moneda'] : '',
		'dias'     => isset( $d['dias'] ) && is_numeric( $d['dias'] ) ? (int) $d['dias'] : '',
		'neto'     => isset( $d['neto'] ) && is_numeric( $d['neto'] ) ? (float) $d['neto'] : '',
		'mensaje'  => sanitize_textarea_field( $d['mensaje'] ?? '' ),
		'pagina'   => esc_url_raw( home_url( (string) ( $d['pagina'] ?? '/' ) ) ),
	);

	if ( ! is_email( $v['email'] ) ) {
		return new WP_Error( 'fcc_correo', 'Revisa el correo.', array( 'status' => 400 ) );
	}
	if ( $tipo !== 'boletin' && ( $v['nombre'] === '' || strlen( $v['ruc'] ) !== 11 ) ) {
		return new WP_Error( 'fcc_datos', 'Faltan datos de la empresa.', array( 'status' => 400 ) );
	}

	$titulo = $tipo === 'boletin' ? 'Boletín · ' . $v['email'] : ucfirst( $tipo ) . ' · ' . $v['nombre'] . ' · RUC ' . $v['ruc'];
	$id     = wp_insert_post( array(
		'post_type'   => 'fc_solicitud',
		'post_status' => 'private',
		'post_title'  => $titulo,
		'meta_input'  => array_combine( array_map( fn( $k ) => '_fcc_' . $k, array_keys( $v ) ), array_values( $v ) ),
	), true );
	if ( is_wp_error( $id ) ) {
		return new WP_Error( 'fcc_guardar', 'No se pudo guardar la solicitud.', array( 'status' => 500 ) );
	}

	fcc_avisar( $id, $v );
	do_action( 'fcc_solicitud_creada', $id, $v );
	return new WP_REST_Response( array( 'ok' => true, 'id' => $id ), 201 );
}

function fcc_avisar( int $id, array $v ): void {
	$para = get_option( 'fcc_correo_avisos', get_option( 'admin_email' ) );
	if ( ! $para || $v['tipo'] === 'boletin' ) {
		return;
	}
	$lineas = array();
	foreach ( FCC_CAMPOS as $k => $etq ) {
		if ( $v[ $k ] !== '' && $v[ $k ] !== null ) {
			$lineas[] = $etq . ': ' . $v[ $k ];
		}
	}
	$lineas[] = '';
	$lineas[] = 'Ver en el sitio: ' . admin_url( 'post.php?post=' . $id . '&action=edit' );
	wp_mail( $para, 'Nueva solicitud web · ' . $v['nombre'], implode( "\n", $lineas ) );
}

/* listado en el escritorio */
add_filter( 'manage_fc_solicitud_posts_columns', function () {
	return array( 'cb' => '<input type="checkbox">', 'title' => 'Solicitud', 'fcc_producto' => 'Solución', 'fcc_celular' => 'Celular',
		'fcc_email' => 'Correo', 'fcc_monto' => 'Monto', 'date' => 'Fecha' );
} );
add_action( 'manage_fc_solicitud_posts_custom_column', function ( $col, $id ) {
	$k = substr( $col, 4 );
	$v = get_post_meta( $id, '_fcc_' . $k, true );
	if ( $k === 'monto' && $v !== '' ) {
		$v = ( get_post_meta( $id, '_fcc_moneda', true ) === 'USD' ? 'US$ ' : 'S/ ' ) . number_format( (float) $v, 2 ) . ' · ' . get_post_meta( $id, '_fcc_dias', true ) . ' días';
	}
	echo esc_html( (string) $v );
}, 10, 2 );

/* detalle de una solicitud (solo lectura) */
add_action( 'add_meta_boxes_fc_solicitud', function () {
	add_meta_box( 'fcc_detalle', 'Datos de la solicitud', function ( $post ) {
		echo '<table class="widefat striped"><tbody>';
		foreach ( FCC_CAMPOS as $k => $etq ) {
			$v = get_post_meta( $post->ID, '_fcc_' . $k, true );
			if ( $v !== '' ) {
				echo '<tr><th style="width:200px">' . esc_html( $etq ) . '</th><td>' . esc_html( (string) $v ) . '</td></tr>';
			}
		}
		echo '</tbody></table>';
	}, 'fc_solicitud', 'normal', 'high' );
} );
