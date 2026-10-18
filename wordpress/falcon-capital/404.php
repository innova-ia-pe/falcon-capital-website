<?php
/**
 * Página no encontrada.
 */
defined( 'ABSPATH' ) || exit;

get_header();
$f = fc_icono( 'flecha' );
fc_cabecera_corta( 'Error 404', 'No encontramos <em>esta página</em>', 'Es posible que el enlace haya cambiado o que la dirección esté mal escrita. Estas son las secciones principales de la web.', '',
	'<a class="b-btn b-btn-em b-btn-lg" href="' . esc_url( home_url( '/' ) ) . '">Ir al inicio ' . $f . '</a><a class="b-btn b-btn-ghost b-btn-lg" href="' . esc_url( fc_pagina( 'simulador' ) ) . '">Simula tu crédito</a>' );
$enlaces = array(
	array( 'factoring', 'Factoring', 'Convierte tus facturas en liquidez' ),
	array( 'confirming', 'Confirming', 'Administra el pago a tus proveedores' ),
	array( 'capital-de-trabajo', 'Capital de Trabajo', 'Recursos para tus proyectos' ),
	array( 'contactanos', 'Contáctanos', 'Habla con un ejecutivo' ),
);
?>
<section class="b-sec b-art" data-sec="enlaces">
	<div class="b-wrap"><div class="b-links404"><?php foreach ( $enlaces as $e ) : ?><a href="<?php echo esc_url( fc_pagina( $e[0] ) ); ?>"><b><?php echo esc_html( $e[1] ); ?></b><span><?php echo esc_html( $e[2] ); ?></span><?php echo $f; ?></a><?php endforeach; ?></div></div>
</section>
<?php
get_footer();
