<?php
/**
 * Plugin Name:       Falcon Capital – Componentes
 * Description:       Secciones del sitio de Falcon Capital como widgets de Elementor (banner con simulador, soluciones, cifras, noticias…) y registro de las solicitudes del simulador y de los formularios.
 * Version:           0.2.0
 * Author:            Innova IA
 * Requires at least: 6.8
 * Requires PHP:      8.1
 * Requires Plugins:  elementor
 * Text Domain:       falcon-capital-componentes
 */

defined( 'ABSPATH' ) || exit;

define( 'FCC_VER', '0.2.0' );
define( 'FCC_DIR', plugin_dir_path( __FILE__ ) );
define( 'FCC_URL', plugin_dir_url( __FILE__ ) );

require_once FCC_DIR . 'includes/ayudas.php';
require_once FCC_DIR . 'includes/solicitudes.php';
require_once FCC_DIR . 'includes/ajustes.php';
require_once FCC_DIR . 'includes/instalador.php';
require_once FCC_DIR . 'includes/bot.php';

/* Widgets de Elementor: categoría propia «Falcon Capital» y una clase por sección */
add_action( 'elementor/elements/categories_registered', function ( $m ) {
	$m->add_category( 'falcon-capital', array( 'title' => 'Falcon Capital', 'icon' => 'eicon-site-logo' ) );
} );

add_action( 'elementor/widgets/register', function ( $m ) {
	require_once FCC_DIR . 'includes/class-widget.php';
	foreach ( glob( FCC_DIR . 'widgets/*.php' ) as $archivo ) {
		require_once $archivo;
	}
	foreach ( get_declared_classes() as $clase ) {
		if ( is_subclass_of( $clase, 'FCC_Widget' ) && ! ( new ReflectionClass( $clase ) )->isAbstract() ) {
			$m->register( new $clase() );
		}
	}
} );

/* tipografía de las secciones: «9:00 a. m.» y «S/ 300» no se parten entre dos líneas */
add_filter( 'elementor/widget/render_content', function ( $html, $widget ) {
	if ( strpos( $widget->get_name(), 'fc-' ) !== 0 ) {
		return $html;
	}
	$html = preg_replace( '/(\d) ([ap])\. m\./u', "$1\u{00A0}$2.\u{00A0}m.", $html );
	return preg_replace( '/(S\/|US\$) (?=\d)/u', "$1\u{00A0}", $html );
}, 10, 2 );
