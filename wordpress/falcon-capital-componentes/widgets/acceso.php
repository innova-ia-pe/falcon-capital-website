<?php
/**
 * Acceso a Mi Portal Falcon: iniciar sesión o crear cuenta. Mientras TI de Falcon defina la plataforma, el
 * formulario valida los datos y muestra un aviso (no envía nada).
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;

class FCC_Acceso extends FCC_Widget {

	public function get_name() { return 'fc-acceso'; }
	public function get_title() { return 'Acceso (iniciar sesión o registro)'; }
	public function get_icon() { return 'eicon-lock-user'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->add_control( 'modo', array( 'label' => 'Formulario', 'type' => Controls_Manager::SELECT, 'default' => 'login',
			'options' => array( 'login' => 'Iniciar sesión', 'registro' => 'Crear cuenta' ) ) );
		$this->texto( 'kicker', 'Rótulo', 'Mi Portal Falcon' );
		$this->texto( 'titulo', 'Título', 'Tus servicios, en un solo lugar' );
		$this->texto( 'texto', 'Texto', 'Consulta el estado de tus operaciones y los servicios que has contratado con Falcon Capital.', 'textarea' );
		$this->texto( 'puntos', 'Puntos (uno por línea)', "Estado de tus operaciones\nServicios contratados\nDocumentos de tu evaluación", 'textarea', array( 'rows' => 3 ) );
		$this->texto( 'pendiente', 'Aviso (vacío para quitarlo)', '<b>Pendiente de TI Falcon.</b> Confirmar si estas pantallas viven en la web o en el portal externo, su URL y los proveedores de acceso admitidos.', 'textarea' );
		$this->texto( 'aviso', 'Mensaje al enviar el formulario', 'El acceso se conectará a Mi Portal Falcon cuando TI confirme el flujo.', 'textarea' );
		$this->texto( 'portal', 'Enlace a la plataforma (cuando exista, el botón lleva ahí)', '' );
		$this->cerrar();
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$login = ( $s['modo'] ?? 'login' ) === 'login';
		$f     = fcc_icono( 'flecha' );
		?>
<section class="b-sec b-contact" data-sec="acceso">
	<div class="b-wrap b-contact-grid">
		<div class="b-contact-side">
			<span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span>
			<h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2>
			<p data-r="up"><?php echo fcc_txt( $s['texto'] ); ?></p>
			<?php if ( fcc_lineas( $s['puntos'] ) ) : ?><ul class="b-acc-list" data-r="up"><?php foreach ( fcc_lineas( $s['puntos'] ) as $p ) : ?><li><?php echo fcc_icono( 'check' ); ?><span><?php echo esc_html( $p ); ?></span></li><?php endforeach; ?></ul><?php endif; ?>
			<?php if ( $s['pendiente'] ) : ?><div class="b-pending" data-r="up"><?php echo fcc_txt( $s['pendiente'] ); ?></div><?php endif; ?>
		</div>
		<div class="b-contact-card lead" data-r="up"><form class="lead-form b-form" novalidate data-demo<?php echo $s['portal'] ? ' action="' . esc_url( $s['portal'] ) . '"' : ''; ?>>
			<?php if ( $login ) : ?>
				<div class="lf-grid">
					<label class="lf lf-full"><span>Correo</span><input name="email" type="email" placeholder="nombre@empresa.com" autocomplete="email" required><em class="lf-err">Revisa tu correo.</em></label>
					<label class="lf lf-full"><span>Contraseña</span><input name="clave" type="password" placeholder="Tu contraseña" autocomplete="current-password" required><em class="lf-err">Escribe tu contraseña.</em></label>
				</div>
				<button class="lf-send" type="submit"><span>Ingresar</span><?php echo $f; ?></button>
				<p class="b-demo-ok" data-demo-ok hidden><?php echo esc_html( $s['aviso'] ); ?></p>
				<p class="b-acc-links"><a href="<?php echo esc_url( $s['portal'] ?: '#' ); ?>">¿Olvidaste tu contraseña?</a><span>¿No tienes una cuenta? <a href="<?php echo esc_url( fcc_pag( 'registro' ) ); ?>">Regístrate aquí</a></span></p>
			<?php else : ?>
				<div class="b-sso"><button type="button"><b class="g">G</b>Continuar con Google</button><button type="button"><b class="o">O</b>Continuar con Outlook</button><button type="button"><b class="m"><i></i><i></i><i></i><i></i></b>Continuar con Microsoft</button></div>
				<p class="b-or"><span>o regístrate con tu correo</span></p>
				<div class="lf-grid">
					<label class="lf lf-full"><span>Correo electrónico</span><input name="email" type="email" placeholder="tu@empresa.com" autocomplete="email" required><em class="lf-err">Revisa tu correo.</em></label>
				</div>
				<button class="lf-send" type="submit"><span>Crear cuenta</span><?php echo $f; ?></button>
				<p class="b-demo-ok" data-demo-ok hidden><?php echo esc_html( $s['aviso'] ); ?></p>
				<p class="b-acc-links"><span>¿Ya tienes una cuenta? <a href="<?php echo esc_url( fcc_pag( 'iniciar-sesion' ) ); ?>">Inicia sesión aquí</a></span></p>
			<?php endif; ?>
		</form></div>
	</div>
</section>
		<?php
	}
}
