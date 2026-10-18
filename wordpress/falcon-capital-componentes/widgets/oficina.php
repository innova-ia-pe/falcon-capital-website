<?php
/**
 * Oficina: dirección con enlace a Google Maps y tarjeta con foto.
 */
defined( 'ABSPATH' ) || exit;

class FCC_Oficina extends FCC_Widget {

	public function get_name() { return 'fc-oficina'; }
	public function get_title() { return 'Oficina'; }
	public function get_icon() { return 'eicon-google-maps'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->texto( 'kicker', 'Rótulo', 'Oficina' );
		$this->texto( 'titulo', 'Título', 'Visítanos en San Isidro' );
		$this->texto( 'direccion', 'Dirección (vacío: la de Personalizar)', '' );
		$this->texto( 'enlace', 'Enlace', 'Cómo llegar' );
		$this->texto( 'mapa', 'Enlace de Google Maps (vacío: se arma con la dirección)', '' );
		$this->imagen( 'foto', 'Foto', 'hero-evaluacion.jpg' );
		$this->cerrar();
	}

	protected function render() {
		$s   = $this->get_settings_for_display();
		$dir = $s['direccion'] ?: ( function_exists( 'fc_dato' ) ? fc_dato( 'direccion' ) : '' );
		$map = $s['mapa'] ?: 'https://maps.google.com/?q=' . rawurlencode( str_replace( ' · ', ' ', $dir ) );
		?>
<section class="b-sec b-map" data-sec="oficina">
	<div class="b-wrap b-map-grid">
		<div><span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span><h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2><p data-r="up"><?php echo esc_html( $dir ); ?></p><?php if ( $s['enlace'] ) : ?><a class="b-link" href="<?php echo esc_url( $map ); ?>" target="_blank" rel="noopener" data-r="up"><?php echo esc_html( $s['enlace'] ); ?> <?php echo fcc_icono( 'flecha' ); ?></a><?php endif; ?></div>
		<div class="b-map-card" data-r="up"><img src="<?php echo esc_url( fcc_img( $s['foto'], 'hero-evaluacion.jpg' ) ); ?>" alt="" loading="lazy"><span><?php echo fcc_icono( 'ubicacion' ); ?><b>Falcon Capital</b><small><?php echo esc_html( $dir ); ?></small></span></div>
	</div>
</section>
		<?php
	}
}
