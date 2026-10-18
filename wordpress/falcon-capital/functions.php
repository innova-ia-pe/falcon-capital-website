<?php
/**
 * Falcon Capital · tema hijo de Hello Elementor.
 *
 * El diseño viene del prototipo aprobado (propuesta B «Impulso», banner 1 «Vidrio»): sus hojas de estilo y su
 * script se cargan tal cual, y el sitio se envuelve en <div class="P pb"> para que sus selectores funcionen sin
 * cambios. La cabecera y el pie son del tema; el contenido de cada página se arma en Elementor con los widgets
 * del plugin «Falcon Capital – Componentes».
 */

defined( 'ABSPATH' ) || exit;

define( 'FC_TEMA_VER', '0.2.0' );
define( 'FC_TEMA_URI', get_stylesheet_directory_uri() );
define( 'FC_TEMA_DIR', get_stylesheet_directory() );

require_once FC_TEMA_DIR . '/inc/iconos.php';
require_once FC_TEMA_DIR . '/inc/plantillas.php';

/** URL de una imagen incluida en el tema. */
function fc_img( string $archivo ): string {
	return FC_TEMA_URI . '/assets/img/' . $archivo;
}

/** Enlace a una página del sitio por su ruta (slug); si aún no existe, al inicio con el ancla. */
function fc_pagina( string $ruta, string $ancla = '' ): string {
	$p = get_page_by_path( $ruta );
	$url = $p ? get_permalink( $p ) : home_url( '/' . $ruta . '/' );
	return $ancla ? $url . '#' . $ancla : $url;
}

/** Datos de contacto (editables en Apariencia → Personalizar → Falcon Capital). */
function fc_dato( string $clave ): string {
	$porDefecto = array(
		'whatsapp'  => '51955447475',
		'telefono'  => '955 447 475',
		'correo'    => 'info@falconcapital.pe',
		'direccion' => 'Av. José Gálvez Barrenechea 535, Urb. Corpac, San Isidro · Lima',
		'facebook'  => 'https://www.facebook.com/falconcapital.p',
		'linkedin'  => 'https://www.linkedin.com/company/falcon-capital-pe/',
		'instagram' => 'https://www.instagram.com/falcon.capital_',
		'login'     => '',
		'registro'  => '',
		'cookies_titulo' => 'Usamos cookies',
		'cookies_texto'  => 'Usamos cookies propias y de terceros para que la web funcione y, si lo aceptas, para medir cómo se usa y mejorarla.',
	);
	$v = get_theme_mod( 'fc_' . $clave, $porDefecto[ $clave ] ?? '' );
	return is_string( $v ) ? $v : '';
}

function fc_wa( string $texto = '' ): string {
	$url = 'https://wa.me/' . preg_replace( '/\D/', '', fc_dato( 'whatsapp' ) );
	return $texto ? $url . '?text=' . rawurlencode( $texto ) : $url;
}

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	register_nav_menus( array( 'pie-legal' => 'Pie · enlaces legales' ) );
	/* las páginas de texto usan el extracto como bajada de la cabecera */
	add_post_type_support( 'page', 'excerpt' );
}, 20 );

/* Hello Elementor: sin sus estilos ni su cabecera y pie (los reemplaza el diseño de Falcon) */
add_filter( 'hello_elementor_enqueue_style', '__return_false' );
add_filter( 'hello_elementor_enqueue_theme_style', '__return_false' );
add_filter( 'hello_elementor_header_footer', '__return_false' );
add_filter( 'hello_elementor_page_title', '__return_false' );

/* atributos que el diseño del prototipo espera en <html> */
add_filter( 'language_attributes', function ( $out ) {
	if ( is_admin() ) {
		return $out;
	}
	$pag = is_front_page() ? 'index' : ( is_singular() ? get_post_field( 'post_name', get_queried_object_id() ) : 'otra' );
	return $out . ' data-p="b" data-hb="1" data-pag="' . esc_attr( $pag ) . '"';
} );

add_action( 'wp_head', function () {
	/* sin esto el script del diseño no sabe que hay JS (animaciones de entrada) */
	echo "<script>document.documentElement.className+=' js';</script>\n";
	echo '<link rel="icon" href="' . esc_url( fc_img( 'isotipo-falcon.png' ) ) . '">' . "\n";
}, 1 );

add_action( 'wp_enqueue_scripts', function () {
	/* versión = fecha del archivo: cada cambio llega al navegador sin esperar a que caduque la caché */
	$v = fn( $f ) => FC_TEMA_VER . '.' . (int) @filemtime( FC_TEMA_DIR . '/assets/' . $f );
	wp_enqueue_style( 'fc-manrope', 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap', array(), null );
	wp_enqueue_style( 'fc-base', FC_TEMA_URI . '/assets/css/base.css', array(), $v( 'css/base.css' ) );
	wp_enqueue_style( 'fc-impulso', FC_TEMA_URI . '/assets/css/impulso.css', array( 'fc-base' ), $v( 'css/impulso.css' ) );
	wp_enqueue_style( 'fc-banner', FC_TEMA_URI . '/assets/css/banner.css', array( 'fc-impulso' ), $v( 'css/banner.css' ) );
	wp_enqueue_style( 'fc-paginas', FC_TEMA_URI . '/assets/css/paginas.css', array( 'fc-banner' ), $v( 'css/paginas.css' ) );
	wp_enqueue_style( 'fc-wp', FC_TEMA_URI . '/assets/css/wp.css', array( 'fc-paginas' ), $v( 'css/wp.css' ) );
	wp_enqueue_script( 'fc-falcon', FC_TEMA_URI . '/assets/js/falcon.js', array(), $v( 'js/falcon.js' ), array( 'in_footer' => true ) );
	/* el plugin agrega lo suyo (p. ej. FC_WP.bot, el asistente virtual) con el filtro fc_wp_datos */
	wp_localize_script( 'fc-falcon', 'FC_WP', apply_filters( 'fc_wp_datos', array(
		'img'   => trailingslashit( FC_TEMA_URI . '/assets/img' ),
		'wa'    => fc_wa(),
		'rest'  => esc_url_raw( rest_url( 'falcon/v1/' ) ),
		'nonce' => wp_create_nonce( 'wp_rest' ),
		'tasa'  => (float) get_option( 'fc_tasa_tem', 1.80 ),
		/* aviso de cookies: vacío si se apagó en Personalizar */
		'cookies' => get_theme_mod( 'fc_cookies_on', true ) ? array(
			'titulo' => fc_dato( 'cookies_titulo' ),
			'texto'  => fc_dato( 'cookies_texto' ),
			'url'    => fc_pagina( 'politica-de-cookies' ),
		) : '',
	) ) );
}, 100 ); /* después de los estilos de Elementor, para que el diseño gane en empates */

/* Personalizar: datos de contacto que usan la cabecera, el pie y los botones de WhatsApp */
add_action( 'customize_register', function ( WP_Customize_Manager $c ) {
	$c->add_section( 'fc_datos', array( 'title' => 'Falcon Capital · datos de contacto', 'priority' => 30 ) );
	$campos = array(
		'whatsapp'  => 'WhatsApp (solo números, con 51)',
		'telefono'  => 'Teléfono visible',
		'correo'    => 'Correo de contacto',
		'direccion' => 'Dirección',
		'facebook'  => 'Facebook (URL)',
		'linkedin'  => 'LinkedIn (URL)',
		'instagram' => 'Instagram (URL)',
		'login'     => '«Iniciar sesión» (URL de la plataforma)',
		'registro'  => '«Crea tu cuenta» (URL de la plataforma)',
	);
	foreach ( $campos as $k => $etq ) {
		$c->add_setting( 'fc_' . $k, array( 'default' => fc_dato( $k ), 'sanitize_callback' => 'sanitize_text_field' ) );
		$c->add_control( 'fc_' . $k, array( 'label' => $etq, 'section' => 'fc_datos', 'type' => 'text' ) );
	}

	/* aviso de cookies: aparece la primera vez; la elección queda en el navegador del visitante */
	$c->add_section( 'fc_cookies', array( 'title' => 'Falcon Capital · aviso de cookies', 'priority' => 31,
		'description' => 'Se muestra la primera vez que alguien entra. «Aceptar» o «Solo necesarias» queda guardado en su navegador; una herramienta de medición puede esperar el evento «fc:cookies» para activarse solo si se aceptan.' ) );
	$c->add_setting( 'fc_cookies_on', array( 'default' => true, 'sanitize_callback' => 'rest_sanitize_boolean' ) );
	$c->add_control( 'fc_cookies_on', array( 'label' => 'Mostrar el aviso de cookies', 'section' => 'fc_cookies', 'type' => 'checkbox' ) );
	$c->add_setting( 'fc_cookies_titulo', array( 'default' => fc_dato( 'cookies_titulo' ), 'sanitize_callback' => 'sanitize_text_field' ) );
	$c->add_control( 'fc_cookies_titulo', array( 'label' => 'Título', 'section' => 'fc_cookies', 'type' => 'text' ) );
	$c->add_setting( 'fc_cookies_texto', array( 'default' => fc_dato( 'cookies_texto' ), 'sanitize_callback' => 'sanitize_textarea_field' ) );
	$c->add_control( 'fc_cookies_texto', array( 'label' => 'Texto (al final se agrega el enlace a la Política de Cookies)', 'section' => 'fc_cookies', 'type' => 'textarea' ) );
} );
