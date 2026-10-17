<?php
/**
 * Pie del sitio (diseño «Impulso»). Cierra el contenedor .P.pb que abre header.php.
 */
defined( 'ABSPATH' ) || exit;

$wa     = fc_wa();
$redes  = array_filter( array( 'facebook' => fc_dato( 'facebook' ), 'linkedin' => fc_dato( 'linkedin' ), 'instagram' => fc_dato( 'instagram' ) ) );
$nombre = array( 'facebook' => 'Facebook', 'linkedin' => 'LinkedIn', 'instagram' => 'Instagram' );
?>
</div>
<footer class="b-ft" data-sec="footer">
	<div class="b-wrap">
		<div class="b-ft-news">
			<div><b>Guías para mejorar el flujo de caja de tu empresa</b><span>Un correo al mes con artículos del blog y novedades de Falcon Capital.</span></div>
			<form class="nl" novalidate data-nl>
				<input type="email" name="email" required placeholder="Tu correo de trabajo" aria-label="Correo">
				<button type="submit">Suscribirme</button>
				<p class="nl-ok" hidden>¡Gracias! Te escribiremos pronto.</p>
			</form>
		</div>
		<div class="b-ft-cols">
			<div class="b-ft-brand">
				<img src="<?php echo esc_url( fc_img( 'logo-light.png' ) ); ?>" alt="Falcon Capital" width="170" height="44" loading="lazy">
				<p><?php echo fc_icono( 'ubicacion' ); ?> <?php echo esc_html( fc_dato( 'direccion' ) ); ?></p>
				<?php if ( $redes ) : ?>
				<div class="b-social"><?php foreach ( $redes as $k => $url ) : ?><a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener" aria-label="<?php echo esc_attr( $nombre[ $k ] ); ?>"><?php echo fc_icono( $k ); ?></a><?php endforeach; ?></div>
				<?php endif; ?>
			</div>
			<div><h4>Soluciones</h4><a href="<?php echo esc_url( fc_pagina( 'factoring' ) ); ?>">Factoring</a><a href="<?php echo esc_url( fc_pagina( 'confirming' ) ); ?>">Confirming</a><a href="<?php echo esc_url( fc_pagina( 'capital-de-trabajo' ) ); ?>">Capital de Trabajo</a><a href="<?php echo esc_url( fc_pagina( 'simulador' ) ); ?>">Simulador</a></div>
			<div><h4>Contacta con nosotros</h4><a href="mailto:<?php echo esc_attr( fc_dato( 'correo' ) ); ?>">Correo electrónico</a><a href="<?php echo esc_url( $wa ); ?>" target="_blank" rel="noopener">WhatsApp</a><a href="<?php echo esc_url( fc_pagina( 'contactanos' ) ); ?>">Contáctanos</a><a href="<?php echo esc_url( fc_pagina( 'preguntas-frecuentes' ) ); ?>">Preguntas frecuentes</a></div>
			<div><h4>Falcon Capital</h4><a href="<?php echo esc_url( fc_pagina( 'conocenos' ) ); ?>">¿Quiénes somos?</a><a href="<?php echo esc_url( fc_pagina( 'reglamento-de-factoring' ) ); ?>">Reglamento de Factoring</a><a href="<?php echo esc_url( get_privacy_policy_url() ?: fc_pagina( 'politica-de-privacidad' ) ); ?>">Política de privacidad</a><a href="<?php echo esc_url( fc_pagina( 'constancia-de-registro' ) ); ?>">Constancia de registro (SBS)</a></div>
		</div>
		<div class="b-ft-btm">
			<span>© <?php echo esc_html( wp_date( 'Y' ) ); ?> Falcon Capital · Registrados ante la SBS · Participantes en CAVALI · Miembros de APEFAC</span>
			<a class="b-ft-book" href="<?php echo esc_url( fc_pagina( 'libro-de-reclamaciones' ) ); ?>"><?php echo fc_icono( 'libro' ); ?> Libro de Reclamaciones</a>
		</div>
	</div>
</footer>
<a class="b-fab" href="<?php echo esc_url( $wa ); ?>" target="_blank" rel="noopener" data-wa><?php echo fc_icono( 'whatsapp' ); ?><span>Contacta un experto</span></a>
<div class="b-mbar" data-mbar>
	<a class="b-btn b-btn-em" href="<?php echo esc_url( fc_pagina( 'simulador' ) ); ?>">Simula tu crédito</a>
	<a class="b-mbar-wa" href="<?php echo esc_url( $wa ); ?>" target="_blank" rel="noopener" data-wa aria-label="WhatsApp"><?php echo fc_icono( 'whatsapp' ); ?></a>
</div>
</div>
<div class="vmodal" data-vmodal hidden>
	<div class="vmodal-bg" data-close></div>
	<div class="vmodal-box" role="dialog" aria-modal="true" aria-label="Video institucional">
		<button type="button" class="vmodal-x" data-close aria-label="Cerrar"><?php echo fc_icono( 'cerrar' ); ?></button>
		<div class="vmodal-ph" data-vmodal-body><?php echo fc_icono( 'play' ); ?><b>Video institucional</b><span>Aquí se incrusta el video cuando Falcon Capital lo entregue (YouTube, Vimeo o archivo propio).</span></div>
	</div>
</div>
<?php wp_footer(); ?>
</body>
</html>
