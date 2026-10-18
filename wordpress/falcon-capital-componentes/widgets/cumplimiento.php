<?php
/**
 * Cumplimiento y respaldo: marco regulatorio, sellos, norma principal e índice de normas por grupo.
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

class FCC_Cumplimiento extends FCC_Widget {

	public function get_name() { return 'fc-cumplimiento'; }
	public function get_title() { return 'Cumplimiento y marco legal'; }
	public function get_icon() { return 'eicon-document-file'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->imagen( 'fondo', 'Foto de fondo', 'marco-legal.jpg' );
		$this->texto( 'kicker', 'Rótulo', 'Cumplimiento y respaldo' );
		$this->texto( 'titulo', 'Título', 'Cada operación, dentro del *marco regulatorio*', 'textarea', array( 'rows' => 2 ) );
		$this->texto( 'texto', 'Texto', 'Cada operación de Falcon Capital se registra y valida dentro del sistema financiero peruano. Contamos con política SPLAFT y oficial de cumplimiento, y trabajamos integrados con SUNAT y CAVALI.', 'textarea', array( 'rows' => 4 ) );
		$this->lista( 'sellos', 'Sellos', array(
			'logo' => array( 'media', 'Logo' ),
			'alt'  => array( 'text', 'Nombre', '' ),
		), array(
			array( 'logo' => fcc_media_tema( 'logo-sbs.png' ), 'alt' => 'SBS' ),
			array( 'logo' => fcc_media_tema( 'logo-cavali.png' ), 'alt' => 'CAVALI' ),
		), '{{{ alt }}}' );
		$this->texto( 'ley_k', 'Norma principal · rótulo', 'Norma principal' );
		$this->texto( 'ley', 'Norma principal · número', 'Ley N.° 29623' );
		$this->texto( 'ley_d', 'Norma principal · nombre', 'Ley de Factoring' );
		$this->cerrar();

		$this->abrir( 'sec_idx', 'Marco normativo' );
		$this->texto( 'idx_t', 'Título del índice', 'Marco normativo clave' );
		$r = new Repeater();
		$r->add_control( 'titulo', array( 'label' => 'Grupo', 'type' => Controls_Manager::TEXT, 'default' => '', 'label_block' => true ) );
		$r->add_control( 'normas', array( 'label' => 'Normas (una por línea: «Código | Descripción»)', 'type' => Controls_Manager::TEXTAREA, 'rows' => 4, 'default' => '' ) );
		$this->add_control( 'grupos', array( 'label' => 'Grupos', 'type' => Controls_Manager::REPEATER, 'fields' => $r->get_controls(), 'title_field' => '{{{ titulo }}}', 'default' => array(
			array( 'titulo' => 'Prevención de lavado de activos', 'normas' => "DS 008-2025-JUS | Sujeto obligado UIF\nRes. SBS 789-2018 y 02351-2023 | Norma SPLAFT\nLey 27693 | Crea la UIF-Perú" ),
			array( 'titulo' => 'Transparencia y control', 'normas' => "DL 1372 | Beneficiario final\nRes. SBS 8930-2012 | Infracciones y sanciones" ),
			array( 'titulo' => 'Estándares internacionales', 'normas' => 'Rec. 7 GAFI + RCSNU | Sanciones financieras ONU' ),
		) ) );
		$this->cerrar();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-sec b-norm" data-sec="cumplimiento">
	<div class="b-norm-bg" aria-hidden="true"><img src="<?php echo esc_url( fcc_img( $s['fondo'], 'marco-legal.jpg' ) ); ?>" alt="" loading="lazy"></div>
	<div class="b-wrap b-norm-grid">
		<div class="b-norm-side">
			<span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span>
			<h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2>
			<p data-r="up"><?php echo fcc_txt( $s['texto'] ); ?></p>
			<?php if ( ! empty( $s['sellos'] ) ) : ?><div class="b-norm-seals" data-r="up"><?php foreach ( $s['sellos'] as $x ) : ?><span><img src="<?php echo esc_url( fcc_img( $x['logo'] ) ); ?>" alt="<?php echo esc_attr( $x['alt'] ); ?>" loading="lazy"></span><?php endforeach; ?></div><?php endif; ?>
			<?php if ( $s['ley'] ) : ?><div class="b-norm-law" data-r="up"><small><?php echo esc_html( $s['ley_k'] ); ?></small><b><?php echo esc_html( $s['ley'] ); ?></b><span><?php echo esc_html( $s['ley_d'] ); ?></span></div><?php endif; ?>
		</div>
		<div class="b-norm-idx">
			<p class="b-norm-k" data-r="up"><?php echo esc_html( $s['idx_t'] ); ?></p>
			<?php foreach ( (array) $s['grupos'] as $g ) : ?><div class="b-norm-g" data-r="up"><h4><?php echo esc_html( $g['titulo'] ); ?></h4><?php foreach ( fcc_lineas( $g['normas'] ) as $l ) : $p = array_map( 'trim', explode( '|', $l, 2 ) ); ?><p class="b-norm-row"><b><?php echo esc_html( $p[0] ); ?></b><span><?php echo esc_html( $p[1] ?? '' ); ?></span></p><?php endforeach; ?></div><?php endforeach; ?>
		</div>
	</div>
</section>
		<?php
	}
}
