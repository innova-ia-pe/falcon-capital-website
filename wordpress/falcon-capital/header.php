<?php
/**
 * Cabecera del sitio (diseño «Impulso»). Abre el contenedor .P.pb que cierra footer.php.
 */
defined( 'ABSPATH' ) || exit;

$login    = fc_dato( 'login' ) ?: fc_pagina( 'iniciar-sesion' );
$registro = fc_dato( 'registro' ) ?: fc_pagina( 'registro' );
$actual   = function ( string $ruta ): string {
	return is_page( $ruta ) ? ' aria-current="page"' : '';
};
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#041619">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="screen-reader-text skip-link" href="#contenido">Ir al contenido</a>
<div class="P pb" data-prop="b" id="b-top">
<header class="b-hdr" data-bhdr>
	<div class="b-wrap b-hdr-in">
		<a class="b-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Falcon Capital, inicio"><img src="<?php echo esc_url( fc_img( 'logo-light.png' ) ); ?>" alt="Falcon Capital" width="160" height="41"></a>
		<nav class="b-nav" aria-label="Principal">
			<a href="<?php echo esc_url( fc_pagina( 'conocenos' ) ); ?>"<?php echo $actual( 'conocenos' ); ?>>Conócenos</a>
			<div class="b-dd">
				<button type="button" class="b-dd-btn" aria-expanded="false">Soluciones <?php echo fc_icono( 'chevron' ); ?></button>
				<div class="b-dd-menu">
					<a href="<?php echo esc_url( fc_pagina( 'factoring' ) ); ?>"><i><?php echo fc_icono( 'factoring', 'aria-hidden="true"' ); ?></i><span><b>Factoring</b><small>Convierte tus facturas en liquidez</small></span></a>
					<a href="<?php echo esc_url( fc_pagina( 'confirming' ) ); ?>"><i><?php echo fc_icono( 'confirming', 'aria-hidden="true"' ); ?></i><span><b>Confirming</b><small>Administra el pago a tus proveedores</small></span></a>
					<a href="<?php echo esc_url( fc_pagina( 'capital-de-trabajo' ) ); ?>"><i><?php echo fc_icono( 'capital', 'aria-hidden="true"' ); ?></i><span><b>Capital de Trabajo</b><small>Recursos para tus proyectos</small></span></a>
				</div>
			</div>
			<a href="<?php echo esc_url( fc_pagina( 'blog' ) ); ?>"<?php echo $actual( 'blog' ); ?>>Blog</a>
			<a class="b-nav-sim" href="<?php echo esc_url( fc_pagina( 'simulador' ) ); ?>"<?php echo $actual( 'simulador' ); ?>>Simulador</a>
		</nav>
		<div class="b-hdr-acts">
			<a class="b-btn b-btn-ghost" href="<?php echo esc_url( $login ); ?>">Iniciar sesión</a>
			<a class="b-btn b-btn-em" href="<?php echo esc_url( $registro ); ?>">Crea tu cuenta</a>
		</div>
		<button class="b-burger" type="button" aria-label="Abrir menú" aria-expanded="false" data-menu><span></span><span></span></button>
	</div>
</header>
<div class="b-mmenu" data-mmenu hidden>
	<nav aria-label="Menú móvil">
		<a href="<?php echo esc_url( fc_pagina( 'conocenos' ) ); ?>">Conócenos</a>
		<a href="<?php echo esc_url( fc_pagina( 'factoring' ) ); ?>">Factoring</a>
		<a href="<?php echo esc_url( fc_pagina( 'confirming' ) ); ?>">Confirming</a>
		<a href="<?php echo esc_url( fc_pagina( 'capital-de-trabajo' ) ); ?>">Capital de Trabajo</a>
		<a href="<?php echo esc_url( fc_pagina( 'blog' ) ); ?>">Blog</a>
		<a href="<?php echo esc_url( fc_pagina( 'simulador' ) ); ?>">Simulador</a>
		<a href="<?php echo esc_url( fc_pagina( 'contactanos' ) ); ?>">Contáctanos</a>
	</nav>
	<div class="b-mmenu-acts">
		<a class="b-btn b-btn-em b-btn-lg" href="<?php echo esc_url( $registro ); ?>">Crea tu cuenta</a>
		<a class="b-btn b-btn-ghost b-btn-lg" href="<?php echo esc_url( $login ); ?>">Iniciar sesión</a>
	</div>
</div>
<div class="fc-main" id="contenido">
