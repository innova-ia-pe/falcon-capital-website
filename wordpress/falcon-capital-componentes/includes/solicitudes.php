<?php
/**
 * Solicitudes del simulador, de los formularios de contacto y del boletín.
 *
 * Se guardan como entradas privadas («Solicitudes» en el escritorio), se avisa por correo y se dispara la acción
 * «fcc_solicitud_creada» para conectar luego el CRM (Faast). Endpoint: POST /wp-json/falcon/v1/solicitudes
 * (JSON, o multipart cuando el Libro de Reclamaciones trae un adjunto).
 *
 * Adjuntos: solo PDF, JPG o PNG de hasta 5 MB. Se guardan con nombre aleatorio en uploads/falcon-privado/ (con
 * .htaccess que niega el acceso directo) y se descargan desde la solicitud, solo con permiso para editarla.
 */
defined( 'ABSPATH' ) || exit;

const FCC_CAMPOS = array(
	'tipo'      => 'Tipo',
	'producto'  => 'Solución',
	'razon'     => 'Razón social',
	'nombre'    => 'Nombre',
	'ruc'       => 'RUC',
	'documento' => 'DNI / CE / RUC',
	'telefono'  => 'Teléfono',
	'direccion' => 'Dirección',
	'celular'  => 'Celular',
	'email'    => 'Correo',
	'monto'    => 'Monto',
	'moneda'   => 'Moneda',
	'dias'     => 'Plazo (días)',
	'neto'     => 'Recibiría (referencial)',
	'mensaje'  => 'Mensaje',
	'tipo_solicitud' => 'Queja o reclamo',
	'categoria'      => 'Categoría',
	'descripcion'    => 'Bien contratado',
	'detalle'        => 'Detalle',
	'medio'          => 'Medio de contacto',
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
	$d = (array) ( $req->get_json_params() ?: $req->get_body_params() );

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

	$tipo = in_array( $d['tipo'] ?? '', array( 'simulador', 'contacto', 'boletin', 'reclamo' ), true ) ? $d['tipo'] : 'contacto';
	$v    = array(
		'tipo'      => $tipo,
		'producto'  => sanitize_key( $d['producto'] ?? '' ),
		'razon'     => sanitize_text_field( $d['razon'] ?? '' ),
		'nombre'    => sanitize_text_field( $d['nombre'] ?? '' ),
		'documento' => sanitize_text_field( $d['documento'] ?? '' ),
		'telefono'  => preg_replace( '/[^\d+ ]/', '', (string) ( $d['telefono'] ?? '' ) ),
		'direccion' => sanitize_text_field( $d['direccion'] ?? '' ),
		'ruc'      => preg_replace( '/\D/', '', (string) ( $d['ruc'] ?? '' ) ),
		'celular'  => preg_replace( '/[^\d+]/', '', (string) ( $d['celular'] ?? '' ) ),
		'email'    => sanitize_email( $d['email'] ?? '' ),
		'monto'    => isset( $d['monto'] ) && is_numeric( $d['monto'] ) ? (float) $d['monto'] : '',
		'moneda'   => in_array( $d['moneda'] ?? '', array( 'PEN', 'USD' ), true ) ? $d['moneda'] : '',
		'dias'     => isset( $d['dias'] ) && is_numeric( $d['dias'] ) ? (int) $d['dias'] : '',
		'neto'     => isset( $d['neto'] ) && is_numeric( $d['neto'] ) ? (float) $d['neto'] : '',
		'mensaje'  => sanitize_textarea_field( $d['mensaje'] ?? '' ),
		'tipo_solicitud' => sanitize_text_field( $d['tipo_solicitud'] ?? '' ),
		'categoria'      => sanitize_text_field( $d['categoria'] ?? '' ),
		'descripcion'    => sanitize_textarea_field( $d['descripcion'] ?? '' ),
		'detalle'        => sanitize_textarea_field( $d['detalle'] ?? '' ),
		'medio'          => sanitize_text_field( $d['medio'] ?? '' ),
		'pagina'   => esc_url_raw( home_url( (string) ( $d['pagina'] ?? '/' ) ) ),
	);

	if ( ! is_email( $v['email'] ) ) {
		return new WP_Error( 'fcc_correo', 'Revisa el correo.', array( 'status' => 400 ) );
	}
	if ( in_array( $tipo, array( 'simulador', 'contacto' ), true ) && ( $v['nombre'] === '' || strlen( $v['ruc'] ) !== 11 ) ) {
		return new WP_Error( 'fcc_datos', 'Faltan datos de la empresa.', array( 'status' => 400 ) );
	}
	if ( $tipo === 'reclamo' && ( $v['nombre'] === '' || $v['detalle'] === '' ) ) {
		return new WP_Error( 'fcc_datos', 'Faltan datos del reclamo.', array( 'status' => 400 ) );
	}
	$archivo = $tipo === 'reclamo' ? ( $req->get_file_params()['adjunto'] ?? null ) : null;
	if ( $archivo && ( $archivo['error'] ?? UPLOAD_ERR_NO_FILE ) === UPLOAD_ERR_NO_FILE ) {
		$archivo = null;
	}
	if ( $archivo ) {
		$archivo = fcc_revisar_adjunto( $archivo );
		if ( is_wp_error( $archivo ) ) {
			return $archivo;
		}
	}

	$titulos = array(
		'boletin' => 'Boletín · ' . $v['email'],
		'reclamo' => ( $v['tipo_solicitud'] ?: 'Reclamo' ) . ' · ' . $v['nombre'] . ( $v['documento'] ? ' · ' . $v['documento'] : '' ),
	);
	$titulo  = $titulos[ $tipo ] ?? ucfirst( $tipo ) . ' · ' . $v['nombre'] . ' · RUC ' . $v['ruc'];
	$id     = wp_insert_post( array(
		'post_type'   => 'fc_solicitud',
		'post_status' => 'private',
		'post_title'  => $titulo,
		'meta_input'  => array_combine( array_map( fn( $k ) => '_fcc_' . $k, array_keys( $v ) ), array_values( $v ) ),
	), true );
	if ( is_wp_error( $id ) ) {
		return new WP_Error( 'fcc_guardar', 'No se pudo guardar la solicitud.', array( 'status' => 500 ) );
	}

	$ruta = $archivo ? fcc_guardar_adjunto( $archivo, $id ) : '';
	fcc_avisar( $id, $v, $ruta );
	do_action( 'fcc_solicitud_creada', $id, $v );
	return new WP_REST_Response( array( 'ok' => true, 'id' => $id ), 201 );
}

/** Revisa el adjunto: subido por formulario, hasta 5 MB y de verdad PDF, JPG o PNG (por contenido, no solo por nombre). */
function fcc_revisar_adjunto( array $f ) {
	$malo = new WP_Error( 'fcc_adjunto', 'El archivo debe ser PDF, JPG o PNG de hasta 5 MB.', array( 'status' => 400 ) );
	$err  = (int) ( $f['error'] ?? UPLOAD_ERR_NO_FILE );
	if ( in_array( $err, array( UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE ), true ) ) {
		return $malo;
	}
	if ( $err !== UPLOAD_ERR_OK || empty( $f['tmp_name'] ) || ! is_uploaded_file( $f['tmp_name'] ) ) {
		return new WP_Error( 'fcc_adjunto', 'No pudimos recibir el archivo. Inténtalo de nuevo.', array( 'status' => 400 ) );
	}
	if ( (int) $f['size'] > 5 * MB_IN_BYTES ) {
		return $malo;
	}
	$tipos = array( 'pdf' => 'application/pdf', 'jpg|jpeg' => 'image/jpeg', 'png' => 'image/png' );
	$chk   = wp_check_filetype_and_ext( $f['tmp_name'], $f['name'], $tipos );
	if ( empty( $chk['ext'] ) || empty( $chk['type'] ) ) {
		return $malo;
	}
	$f['ext']  = $chk['ext'];
	$f['type'] = $chk['type'];
	return $f;
}

/** Carpeta privada de adjuntos (se crea con su .htaccess la primera vez). */
function fcc_carpeta_privada(): string {
	$dir = trailingslashit( wp_upload_dir( null, false )['basedir'] ) . 'falcon-privado';
	if ( ! is_dir( $dir ) ) {
		wp_mkdir_p( $dir );
	}
	if ( ! file_exists( $dir . '/.htaccess' ) ) {
		@file_put_contents( $dir . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n" );
		@file_put_contents( $dir . '/index.php', "<?php\n// Silencio.\n" );
	}
	return $dir;
}

/** Mueve el adjunto a la carpeta privada con nombre aleatorio y lo anota en la solicitud. Devuelve la ruta. */
function fcc_guardar_adjunto( array $f, int $id ): string {
	$dir    = fcc_carpeta_privada();
	$nombre = $id . '-' . wp_generate_password( 24, false ) . '.' . $f['ext'];
	if ( ! @move_uploaded_file( $f['tmp_name'], $dir . '/' . $nombre ) ) {
		return '';
	}
	@chmod( $dir . '/' . $nombre, 0640 );
	update_post_meta( $id, '_fcc_adjunto', array(
		'archivo' => $nombre,
		'nombre'  => sanitize_file_name( wp_basename( (string) $f['name'] ) ),
		'tipo'    => $f['type'],
		'peso'    => (int) $f['size'],
	) );
	return $dir . '/' . $nombre;
}

function fcc_avisar( int $id, array $v, string $adjunto = '' ): void {
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
	if ( $adjunto ) {
		$a        = get_post_meta( $id, '_fcc_adjunto', true );
		$lineas[] = 'Documento adjunto: ' . ( $a['nombre'] ?? '' ) . ' (va en este correo y queda en la solicitud)';
	}
	$lineas[] = '';
	$lineas[] = 'Ver en el sitio: ' . admin_url( 'post.php?post=' . $id . '&action=edit' );
	$asunto = $v['tipo'] === 'reclamo' ? 'Libro de Reclamaciones · ' : 'Nueva solicitud web · ';
	wp_mail( $para, $asunto . $v['nombre'], implode( "\n", $lineas ), '', $adjunto ? array( $adjunto ) : array() );
}

/* listado en el escritorio */
add_filter( 'manage_fc_solicitud_posts_columns', function () {
	return array( 'cb' => '<input type="checkbox">', 'title' => 'Solicitud', 'fcc_tipo' => 'Tipo', 'fcc_producto' => 'Solución', 'fcc_celular' => 'Celular',
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
		$a = get_post_meta( $post->ID, '_fcc_adjunto', true );
		if ( is_array( $a ) && ! empty( $a['archivo'] ) ) {
			$url = wp_nonce_url( admin_url( 'admin-post.php?action=fcc_adjunto&id=' . $post->ID ), 'fcc_adjunto_' . $post->ID );
			echo '<tr><th>Documento adjunto</th><td><a class="button" href="' . esc_url( $url ) . '">Descargar ' . esc_html( $a['nombre'] ) . '</a> <span class="description">' . esc_html( size_format( (int) $a['peso'] ) ) . '</span></td></tr>';
		}
		echo '</tbody></table>';
	}, 'fc_solicitud', 'normal', 'high' );
} );

/* descarga del adjunto: solo con permiso para editar la solicitud */
add_action( 'admin_post_fcc_adjunto', function () {
	$id = absint( $_GET['id'] ?? 0 );
	if ( ! $id || get_post_type( $id ) !== 'fc_solicitud' || ! current_user_can( 'edit_post', $id ) ) {
		wp_die( 'Sin permiso.', '', array( 'response' => 403 ) );
	}
	check_admin_referer( 'fcc_adjunto_' . $id );
	$a    = get_post_meta( $id, '_fcc_adjunto', true );
	$ruta = is_array( $a ) && ! empty( $a['archivo'] ) ? fcc_carpeta_privada() . '/' . basename( $a['archivo'] ) : '';
	if ( ! $ruta || ! is_file( $ruta ) ) {
		wp_die( 'El archivo ya no está disponible.', '', array( 'response' => 404 ) );
	}
	nocache_headers();
	header( 'Content-Type: ' . ( $a['tipo'] ?: 'application/octet-stream' ) );
	header( 'Content-Disposition: attachment; filename="' . str_replace( array( '"', "\r", "\n" ), '', $a['nombre'] ) . '"' );
	header( 'Content-Length: ' . filesize( $ruta ) );
	header( 'X-Content-Type-Options: nosniff' );
	readfile( $ruta );
	exit;
} );

/* al borrar una solicitud para siempre, su adjunto también se borra */
add_action( 'before_delete_post', function ( $id ) {
	if ( get_post_type( $id ) !== 'fc_solicitud' ) {
		return;
	}
	$a = get_post_meta( $id, '_fcc_adjunto', true );
	if ( is_array( $a ) && ! empty( $a['archivo'] ) ) {
		wp_delete_file( fcc_carpeta_privada() . '/' . basename( $a['archivo'] ) );
	}
} );
