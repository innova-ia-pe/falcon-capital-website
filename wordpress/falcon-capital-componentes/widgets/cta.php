<?php
/**
 * Llamada final: «¿Preparado para obtener la liquidez que tu empresa necesita?».
 */
defined( 'ABSPATH' ) || exit;

class FCC_Cta extends FCC_Widget {

	public function get_name() { return 'fc-cta'; }
	public function get_title() { return 'Llamada a la acción'; }
	public function get_icon() { return 'eicon-call-to-action'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->imagen( 'fondo', 'Foto de fondo', 'hero-evaluacion.jpg' );
		$this->texto( 'titulo', 'Título', '¿Preparado para obtener la liquidez que tu empresa necesita?', 'textarea' );
		$this->texto( 'texto', 'Texto', 'Descubre cómo las soluciones financieras de Falcon Capital pueden impulsar la liquidez y el crecimiento de tu empresa, de forma ágil, segura y sin afectar tu flujo de caja.', 'textarea' );
		$this->texto( 'b1', 'Botón principal', 'Simula tu crédito' );
		$this->enlace( 'b1_url', 'Destino del botón principal', '/simulador/' );
		$this->texto( 'b2', 'Botón secundario', 'Contáctanos' );
		$this->enlace( 'b2_url', 'Destino del botón secundario', '/contactanos/' );
		$this->cerrar();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-cta" data-sec="cta">
	<img class="b-cta-bg" src="<?php echo esc_url( fcc_img( $s['fondo'], 'hero-evaluacion.jpg' ) ); ?>" alt="" loading="lazy" data-scrub="cta">
	<div class="b-wrap b-cta-in">
		<h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2>
		<p data-r="up"><?php echo fcc_txt( $s['texto'] ); ?></p>
		<div class="b-cta-acts" data-r="up">
			<?php if ( $s['b1'] ) : ?><a class="b-btn b-btn-em b-btn-lg" <?php echo fcc_href( $s['b1_url'] ); ?>><?php echo esc_html( $s['b1'] ); ?> <?php echo fcc_icono( 'flecha' ); ?></a><?php endif; ?>
			<?php if ( $s['b2'] ) : ?><a class="b-btn b-btn-ghost b-btn-lg" <?php echo fcc_href( $s['b2_url'] ); ?>><?php echo esc_html( $s['b2'] ); ?></a><?php endif; ?>
		</div>
	</div>
</section>
		<?php
	}
}
