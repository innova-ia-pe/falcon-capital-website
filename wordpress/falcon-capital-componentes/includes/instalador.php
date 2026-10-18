<?php
/**
 * Instalador del contenido del sitio (Ajustes → Falcon Capital → Páginas del sitio).
 *
 * Lee plantillas/sitio.json y crea:
 * - las páginas armadas con Elementor (Inicio, soluciones, Simulador, Conócenos, Blog, Contáctanos, acceso…);
 * - las páginas de texto (legales), que se editan con el editor de WordPress;
 * - las entradas de ejemplo del blog, con su categoría e imagen destacada.
 *
 * «Crear lo que falta» no toca lo que ya existe. «Restablecer» vuelve las páginas de Elementor a la versión del
 * diseño (se pierden los cambios hechos en ellas).
 */
defined( 'ABSPATH' ) || exit;

function fcc_sitio(): array {
	$m = json_decode( (string) file_get_contents( FCC_DIR . 'plantillas/sitio.json' ), true );
	return is_array( $m ) ? $m : array();
}

/** Datos de Elementor de una plantilla, con las imágenes apuntando al tema activo. */
function fcc_plantilla( string $archivo ): string {
	$json = (string) file_get_contents( FCC_DIR . 'plantillas/' . basename( $archivo ) );
	$base = trailingslashit( get_stylesheet_directory_uri() . '/assets/img' );
	return str_replace( '{{img}}', str_replace( '/', '\/', $base ), $json );
}

function fcc_guardar_elementor( int $id, string $datos ): void {
	update_post_meta( $id, '_elementor_edit_mode', 'builder' );
	update_post_meta( $id, '_elementor_template_type', 'wp-page' );
	update_post_meta( $id, '_elementor_version', defined( 'ELEMENTOR_VERSION' ) ? ELEMENTOR_VERSION : '4.3.5' );
	update_post_meta( $id, '_wp_page_template', 'elementor_header_footer' );
	update_post_meta( $id, '_elementor_data', wp_slash( $datos ) );
	delete_post_meta( $id, '_elementor_css' );
}

/** Adjunta una imagen del tema a la biblioteca de medios (una sola vez por archivo). */
function fcc_adjuntar_imagen( string $archivo, int $post_id = 0 ): int {
	$ya = get_posts( array( 'post_type' => 'attachment', 'meta_key' => '_fcc_origen', 'meta_value' => $archivo, 'numberposts' => 1, 'fields' => 'ids', 'post_status' => 'any' ) );
	if ( $ya ) {
		return (int) $ya[0];
	}
	$origen = get_stylesheet_directory() . '/assets/img/' . basename( $archivo );
	if ( ! file_exists( $origen ) ) {
		return 0;
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	$tmp = wp_tempnam( $archivo );
	copy( $origen, $tmp );
	$id = media_handle_sideload( array( 'name' => basename( $archivo ), 'tmp_name' => $tmp ), $post_id );
	if ( is_wp_error( $id ) ) {
		@unlink( $tmp );
		return 0;
	}
	update_post_meta( $id, '_fcc_origen', $archivo );
	return (int) $id;
}

/** Elige en el widget de blog del Inicio las entradas marcadas «inicio» en sitio.json, si el widget no tiene elegidas. */
function fcc_blog_inicio( array $m ): void {
	$ids = array();
	foreach ( (array) ( $m['entradas'] ?? array() ) as $e ) {
		if ( isset( $e['inicio'] ) ) {
			$ya = get_posts( array( 'post_type' => 'post', 'title' => $e['titulo'], 'post_status' => 'publish', 'numberposts' => 1, 'fields' => 'ids' ) );
			if ( $ya ) {
				$ids[ (int) $e['inicio'] ] = (string) $ya[0];
			}
		}
	}
	$inicio = get_page_by_path( 'inicio' );
	if ( ! $ids || ! $inicio ) {
		return;
	}
	ksort( $ids );
	$datos = json_decode( (string) get_post_meta( $inicio->ID, '_elementor_data', true ), true );
	if ( ! is_array( $datos ) ) {
		return;
	}
	$cambio = false;
	$poner  = function ( array &$els ) use ( &$poner, &$cambio, $ids ) {
		foreach ( $els as &$el ) {
			if ( ( $el['widgetType'] ?? '' ) === 'fc-blog' && empty( $el['settings']['elegidas'] ) ) {
				$el['settings']['elegidas'] = array_values( $ids );
				$cambio = true;
			}
			if ( ! empty( $el['elements'] ) ) {
				$poner( $el['elements'] );
			}
		}
	};
	$poner( $datos );
	if ( $cambio ) {
		update_post_meta( $inicio->ID, '_elementor_data', wp_slash( wp_json_encode( $datos ) ) );
		delete_post_meta( $inicio->ID, '_elementor_css' );
	}
}

function fcc_instalar( bool $restablecer ): array {
	$m   = fcc_sitio();
	$log = array( 'creadas' => 0, 'restablecidas' => 0, 'entradas' => 0 );

	foreach ( (array) ( $m['paginas'] ?? array() ) as $p ) {
		$pag = get_page_by_path( $p['ruta'] );
		if ( ! $pag ) {
			$id = wp_insert_post( array( 'post_type' => 'page', 'post_title' => $p['titulo'], 'post_name' => $p['ruta'], 'post_status' => 'publish' ) );
			if ( $id && ! is_wp_error( $id ) ) {
				fcc_guardar_elementor( $id, fcc_plantilla( $p['plantilla'] ) );
				$log['creadas']++;
			}
		} elseif ( $restablecer ) {
			$id = $pag->ID;
			fcc_guardar_elementor( $id, fcc_plantilla( $p['plantilla'] ) );
			$log['restablecidas']++;
		} else {
			$id = $pag->ID;
		}
		if ( ! empty( $p['portada'] ) && ! empty( $id ) ) {
			update_option( 'show_on_front', 'page' );
			update_option( 'page_on_front', (int) $id );
		}
	}

	foreach ( (array) ( $m['textos'] ?? array() ) as $t ) {
		$pag = get_page_by_path( $t['ruta'] );
		if ( $pag && ! $restablecer ) {
			continue;
		}
		$datos = array( 'post_type' => 'page', 'post_title' => $t['titulo'], 'post_name' => $t['ruta'], 'post_status' => 'publish',
			'post_excerpt' => $t['extracto'], 'post_content' => $t['contenido'] );
		if ( $pag ) {
			/* al restablecer, el texto legal ya cargado por Falcon no se pisa */
			if ( trim( wp_strip_all_tags( $pag->post_content ) ) !== '' && strpos( $pag->post_content, 'b-pending' ) === false ) {
				continue;
			}
			$datos['ID'] = $pag->ID;
		}
		$id = wp_insert_post( $datos );
		if ( $id && ! is_wp_error( $id ) ) {
			update_post_meta( $id, 'fc_rotulo', $t['rotulo'] ?? '' );
			delete_post_meta( $id, '_elementor_edit_mode' );
			update_post_meta( $id, '_wp_page_template', 'default' );
			$pag ? $log['restablecidas']++ : $log['creadas']++;
			if ( $t['ruta'] === 'politica-de-privacidad' ) {
				update_option( 'wp_page_for_privacy_policy', (int) $id );
			}
		}
	}

	foreach ( (array) ( $m['entradas'] ?? array() ) as $e ) {
		$ya = get_posts( array( 'post_type' => 'post', 'title' => $e['titulo'], 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids' ) );
		if ( $ya ) {
			continue;
		}
		$cat = get_category_by_slug( sanitize_title( $e['categoria'] ) );
		$cat = $cat ? $cat->term_id : wp_create_category( $e['categoria'] );
		$id  = wp_insert_post( array(
			'post_type'     => 'post',
			'post_status'   => 'publish',
			'post_title'    => $e['titulo'],
			'post_excerpt'  => $e['extracto'],
			'post_content'  => $e['contenido'],
			'post_category' => array( (int) $cat ),
			'post_date'     => wp_date( 'Y-m-d H:i:s', time() - ( 1 + (int) $e['orden'] ) * DAY_IN_SECONDS ), /* la primera, la más reciente */
		) );
		if ( ! $id || is_wp_error( $id ) ) {
			continue;
		}
		$img = fcc_adjuntar_imagen( $e['foto'], $id );
		if ( $img ) {
			set_post_thumbnail( $id, $img );
		}
		if ( ! empty( $e['fijo'] ) ) {
			stick_post( $id );
		}
		$log['entradas']++;
	}

	/* el blog del Inicio muestra las entradas del diseño (si nadie eligió otras) */
	fcc_blog_inicio( $m );

	/* «Hola, mundo» de la instalación de WordPress, fuera */
	$hola = get_page_by_path( 'hello-world', OBJECT, 'post' ) ?: get_page_by_path( 'hola-mundo', OBJECT, 'post' );
	if ( $hola ) {
		wp_trash_post( $hola->ID );
	}
	$ejemplo = get_page_by_path( 'sample-page' ) ?: get_page_by_path( 'pagina-ejemplo' );
	if ( $ejemplo ) {
		wp_trash_post( $ejemplo->ID );
	}
	/* el borrador de privacidad que trae WordPress sobra: la página buena es «politica-de-privacidad» */
	foreach ( array( 'privacy-policy', 'politica-privacidad' ) as $ruta ) {
		$borrador = get_page_by_path( $ruta );
		if ( $borrador && $borrador->post_status === 'draft' && (int) get_option( 'wp_page_for_privacy_policy' ) !== $borrador->ID ) {
			wp_trash_post( $borrador->ID );
		}
	}

	update_option( 'elementor_google_font', '0' );
	update_option( 'elementor_disable_color_schemes', 'yes' );
	update_option( 'elementor_disable_typography_schemes', 'yes' );
	if ( class_exists( '\Elementor\Plugin' ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	flush_rewrite_rules();
	return $log;
}

add_action( 'admin_post_fcc_instalar', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Sin permiso.' );
	}
	check_admin_referer( 'fcc_instalar' );
	$log = fcc_instalar( ! empty( $_POST['restablecer'] ) );
	wp_safe_redirect( add_query_arg( array( 'page' => 'fcc-ajustes', 'fcc_ok' => implode( ',', $log ) ), admin_url( 'options-general.php' ) ) );
	exit;
} );
