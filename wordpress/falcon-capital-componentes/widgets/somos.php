<?php
/**
 * «¿Quiénes somos?» de Conócenos: foto del equipo, texto y cifras con el grupo económico.
 */
defined( 'ABSPATH' ) || exit;

class FCC_Somos extends FCC_Widget {

	public function get_name() { return 'fc-somos'; }
	public function get_title() { return 'Quiénes somos'; }
	public function get_icon() { return 'eicon-person'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->imagen( 'foto', 'Foto', 'act-1.jpg' );
		$this->texto( 'pie', 'Pie de foto', 'Equipo Falcon Capital' );
		$this->texto( 'kicker', 'Rótulo', '¿Quiénes somos?' );
		$this->texto( 'titulo', 'Título', 'Somos *Falcon Capital*' );
		$this->texto( 'texto', 'Texto (separa los párrafos con una línea en blanco)', '', 'textarea', array( 'rows' => 10 ) );
		$this->cerrar();
		$this->controles_datos();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-sec b-somos" data-sec="presentacion">
	<div class="b-wrap b-somos-grid">
		<figure class="b-somos-photo"><img src="<?php echo esc_url( fcc_img( $s['foto'], 'act-1.jpg' ) ); ?>" alt="<?php echo esc_attr( $s['pie'] ); ?>" loading="lazy" data-r="up"><?php if ( $s['pie'] ) : ?><figcaption><?php echo esc_html( $s['pie'] ); ?></figcaption><?php endif; ?></figure>
		<div class="b-somos-txt"><span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span><h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2><?php echo fcc_parrafos( $s['texto'] ); ?></div>
	</div>
	<?php $this->render_datos( $s ); ?>
</section>
		<?php
	}
}
