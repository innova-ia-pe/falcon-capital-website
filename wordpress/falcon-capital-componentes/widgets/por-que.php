<?php
/**
 * «¿Por qué elegir Falcon Capital?»: lista de razones; al recorrerla cambia la foto del marco.
 */
defined( 'ABSPATH' ) || exit;

class FCC_Por_Que extends FCC_Widget {

	public function get_name() { return 'fc-por-que'; }
	public function get_title() { return 'Por qué elegirnos'; }
	public function get_icon() { return 'eicon-bullet-list'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->texto( 'kicker', 'Rótulo', 'Por qué elegirnos' );
		$this->texto( 'titulo', 'Título', '¿Por qué elegir *Falcon Capital*?', 'textarea', array( 'rows' => 2 ) );
		$this->lista( 'items', 'Razones', array(
			'icono'    => array( 'icono', 'Ícono', 'escudo' ),
			'titulo'   => array( 'text', 'Título', '' ),
			'texto'    => array( 'text', 'Texto', '' ),
			'foto'     => array( 'media', 'Foto' ),
			'foto_pos' => array( 'text', 'Recorte de la foto (posición)', '50% 40%' ),
		), array(
			array( 'icono' => 'escudo', 'titulo' => 'Respaldo financiero', 'texto' => 'Solidez para seguir creciendo.', 'foto' => fcc_media_tema( 'sol-factoring.jpg' ), 'foto_pos' => '50% 40%' ),
			array( 'icono' => 'rayo', 'titulo' => 'Desembolsos rápidos', 'texto' => 'La liquidez que tu negocio necesita.', 'foto' => fcc_media_tema( 'hero-evaluacion.jpg' ), 'foto_pos' => '50% 40%' ),
			array( 'icono' => 'asesor', 'titulo' => 'Asesoría personalizada', 'texto' => 'Te acompañamos en cada paso.', 'foto' => fcc_media_tema( 'cumplimiento.jpg' ), 'foto_pos' => '50% 40%' ),
			array( 'icono' => 'balanza', 'titulo' => 'Experiencia y respaldo legal', 'texto' => 'Operaciones seguras y transparentes.', 'foto' => fcc_media_tema( 'marco-legal.jpg' ), 'foto_pos' => '50% 40%' ),
		), '{{{ titulo }}}' );
		$this->cerrar();
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$items = array_values( (array) $s['items'] );
		$pos   = fn( $it ) => ' style="object-position:' . esc_attr( $it['foto_pos'] ?: '50% 40%' ) . '"';
		?>
<section class="b-sec b-why" data-sec="por-que" data-why>
	<div class="b-wrap b-why-grid">
		<div class="b-why-side">
			<span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span>
			<h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2>
			<div class="b-why-frame"><?php foreach ( $items as $i => $it ) : ?><img<?php echo $pos( $it ); ?> class="<?php echo $i === 0 ? 'is-on' : ''; ?>" data-w="<?php echo (int) $i; ?>" src="<?php echo esc_url( fcc_img( $it['foto'] ) ); ?>" alt="" loading="lazy"><?php endforeach; ?><span class="b-why-mk"><img src="<?php echo esc_url( fcc_img_tema( 'isotipo-falcon.png' ) ); ?>" alt="" width="40" height="40"></span></div>
		</div>
		<ol class="b-why-list"><?php foreach ( $items as $i => $it ) : ?><li class="b-why-i<?php echo $i === 0 ? ' is-on' : ''; ?>" data-w="<?php echo (int) $i; ?>"><span class="b-why-n"><?php echo fcc_icono( $it['icono'] ?: 'check', 'aria-hidden="true"' ); ?></span><b><?php echo esc_html( $it['titulo'] ); ?></b><p><?php echo esc_html( $it['texto'] ); ?></p><img<?php echo $pos( $it ); ?> class="b-why-mob" src="<?php echo esc_url( fcc_img( $it['foto'] ) ); ?>" alt="" loading="lazy"></li><?php endforeach; ?></ol>
	</div>
</section>
		<?php
	}
}
