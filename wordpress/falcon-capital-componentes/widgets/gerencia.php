<?php
/**
 * Mensaje de la gerencia: cita con foto recortada.
 */
defined( 'ABSPATH' ) || exit;

class FCC_Gerencia extends FCC_Widget {

	public function get_name() { return 'fc-gerencia'; }
	public function get_title() { return 'Mensaje de la gerencia'; }
	public function get_icon() { return 'eicon-blockquote'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->texto( 'kicker', 'Rótulo', 'Mensaje de la gerencia' );
		$this->texto( 'cita', 'Mensaje', 'Hoy las empresas necesitan más que financiamiento: requieren aliados que comprendan su ritmo, su mercado y su visión. En Falcon Capital unimos tecnología, experiencia financiera y compromiso humano para acompañarlos en su crecimiento, fortaleciendo su liquidez, su eficiencia y la relación con sus clientes.', 'textarea', array( 'rows' => 6 ) );
		$this->texto( 'nombre', 'Nombre', 'Julio Sebastiani' );
		$this->texto( 'cargo', 'Cargo', 'Gerente General de Falcon Capital' );
		$this->imagen( 'foto', 'Foto (PNG sin fondo)', 'julio-sin-fondo.png' );
		$this->cerrar();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-sec b-ceo" data-sec="gerencia">
	<div class="b-wrap b-ceo-grid">
		<div class="b-ceo-txt">
			<span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span>
			<blockquote class="b-bubble"><p data-words>“<?php echo esc_html( trim( (string) $s['cita'], " \t\n\"“”" ) ); ?>”</p></blockquote>
			<footer class="b-sign" data-r="up"><b><?php echo esc_html( $s['nombre'] ); ?></b><span><?php echo esc_html( $s['cargo'] ); ?></span></footer>
		</div>
		<figure class="b-ceo-photo">
			<span class="b-ceo-arc" aria-hidden="true"></span>
			<img src="<?php echo esc_url( fcc_img( $s['foto'], 'julio-sin-fondo.png' ) ); ?>" alt="<?php echo esc_attr( $s['nombre'] . ', ' . $s['cargo'] ); ?>" loading="lazy" data-r="up">
		</figure>
	</div>
</section>
		<?php
	}
}
