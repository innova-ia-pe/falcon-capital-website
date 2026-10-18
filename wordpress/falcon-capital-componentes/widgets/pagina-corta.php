<?php
/**
 * Cabecera corta, sin foto (preguntas frecuentes, acceso, reclamaciones, gracias).
 */
defined( 'ABSPATH' ) || exit;

class FCC_Pagina_Corta extends FCC_Widget {

	public function get_name() { return 'fc-pagina-corta'; }
	public function get_title() { return 'Cabecera corta'; }
	public function get_icon() { return 'eicon-heading'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->texto( 'miga', 'Ruta: nombre de la página', '', 'text', array( 'description' => 'Vacío: el título de la página.' ) );
		$this->texto( 'kicker', 'Rótulo (opcional)', '' );
		$this->texto( 'titulo', 'Título', 'Título de la página', 'textarea', array( 'rows' => 2, 'description' => '*Entre asteriscos* se resalta en verde.' ) );
		$this->texto( 'bajada', 'Bajada', '', 'textarea' );
		$this->controles_botones();
		$this->cerrar();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-phero b-phero-s" data-sec="hero">
	<div class="b-wrap b-phero-in">
		<?php echo $this->migas( '', (string) $s['miga'] ); ?>
		<?php if ( $s['kicker'] ) : ?><span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span><?php endif; ?>
		<h1 class="b-h1" data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h1>
		<?php if ( $s['bajada'] ) : ?><p class="b-phero-sub" data-r="up"><?php echo fcc_txt( $s['bajada'] ); ?></p><?php endif; ?>
		<?php echo $this->botones( 'b-phero-acts', $s, ' data-r="up"' ); ?>
	</div>
</section>
		<?php
	}
}
