<?php
/**
 * Simulador de Factoring fuera del banner: como sección (página Factoring) o como cabecera de la página
 * Simulador. La tarjeta es la misma del banner; la tasa se cambia en Ajustes → Falcon Capital.
 */
defined( 'ABSPATH' ) || exit;

class FCC_Simulador extends FCC_Widget {

	public function get_name() { return 'fc-simulador'; }
	public function get_title() { return 'Simulador de factoring'; }
	public function get_icon() { return 'eicon-calculator'; }
	public function get_keywords() { return array( 'falcon', 'simulador', 'factoring', 'calculadora' ); }

	protected function register_controls() {
		$this->abrir( 'sec', 'Contenido' );
		$this->add_control( 'modo', array( 'label' => 'Formato', 'type' => \Elementor\Controls_Manager::SELECT, 'default' => 'seccion',
			'options' => array( 'seccion' => 'Sección (dentro de una página)', 'pagina' => 'Cabecera de la página Simulador' ) ) );
		$this->imagen( 'foto', 'Foto de fondo' );
		$this->texto( 'foto_pos', 'Recorte de la foto (posición)', '40% 35%' );
		$this->texto( 'kicker', 'Rótulo', 'Simulador de factoring', 'text', array( 'condition' => array( 'modo' => 'seccion' ) ) );
		$this->texto( 'miga', 'Ruta: nombre de la página', '', 'text', array( 'condition' => array( 'modo' => 'pagina' ) ) );
		$this->texto( 'titulo', 'Título', '¿Cuánto recibirías *hoy* por tu factura?', 'textarea', array( 'rows' => 2 ) );
		$this->texto( 'bajada', 'Bajada', 'Tres datos y simulas al instante. Si te convence, solicitas tu evaluación en un clic.', 'textarea' );
		$this->add_control( 'datos', array( 'label' => 'Datos destacados', 'type' => \Elementor\Controls_Manager::REPEATER, 'condition' => array( 'modo' => 'pagina' ),
			'title_field' => '{{{ texto }}}', 'default' => array(),
			'fields' => ( function () {
				$r = new \Elementor\Repeater();
				$r->add_control( 'icono', array( 'label' => 'Ícono', 'type' => \Elementor\Controls_Manager::SELECT, 'options' => fcc_iconos(), 'default' => 'check' ) );
				$r->add_control( 'texto', array( 'label' => 'Texto', 'type' => \Elementor\Controls_Manager::TEXT, 'default' => 'Nuevo dato' ) );
				return $r->get_controls();
			} )() ) );
		$this->texto( 'alt', 'Nota bajo la tarjeta', '¿Buscas Confirming o Capital de Trabajo? Se evalúan a la medida:', 'text', array( 'condition' => array( 'modo' => 'pagina' ) ) );
		$this->texto( 'alt_enlace', 'Enlace de la nota', 'solicita tu evaluación', 'text', array( 'condition' => array( 'modo' => 'pagina' ) ) );
		$this->enlace( 'alt_url', 'Destino del enlace de la nota', '/contactanos/' );
		$this->nota( 'nota_tasa', 'La tasa del simulador se cambia en <b>Ajustes → Falcon Capital</b>.' );
		$this->cerrar();
	}

	protected function render() {
		$s    = $this->get_settings_for_display();
		$foto = fcc_img( $s['foto'] ?? array(), 'home-about.jpg' );
		if ( ( $s['modo'] ?? 'seccion' ) === 'pagina' ) {
			$fc_variante = 'page';
			?>
<section class="b-phero b-simpage" data-sec="hero">
	<div class="b-phero-bg" aria-hidden="true"><img src="<?php echo esc_url( $foto ); ?>" alt="" fetchpriority="high" style="object-position:<?php echo esc_attr( $s['foto_pos'] ?: '50% 40%' ); ?>"></div>
	<div class="b-wrap b-phero-in">
		<?php echo $this->migas( '', (string) $s['miga'] ); ?>
		<h1 class="b-h1" data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h1>
		<?php if ( $s['bajada'] ) : ?><p class="b-phero-sub" data-r="up"><?php echo fcc_txt( $s['bajada'] ); ?></p><?php endif; ?>
		<?php echo $this->render_datos_cortos( (array) ( $s['datos'] ?? array() ) ); ?>
		<?php include FCC_DIR . 'partials/simulador-vidrio.php'; ?>
		<?php if ( $s['alt'] ) : ?><p class="b-simpage-alt"><?php echo esc_html( $s['alt'] ); ?> <?php if ( $s['alt_enlace'] ) : ?><a <?php echo fcc_href( $s['alt_url'] ); ?>><?php echo esc_html( $s['alt_enlace'] ); ?></a>.<?php endif; ?></p><?php endif; ?>
	</div>
</section>
			<?php
			return;
		}
		$fc_variante = 'sec';
		?>
<section class="b-sec b-simsec" id="b-sim-sec" data-sec="simulador">
	<div class="b-simsec-bg" aria-hidden="true"><img style="object-position:<?php echo esc_attr( $s['foto_pos'] ?: '40% 35%' ); ?>" src="<?php echo esc_url( $foto ); ?>" alt="" loading="lazy"></div>
	<div class="b-wrap">
		<div class="b-head"><div><span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span><h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2></div><?php if ( $s['bajada'] ) : ?><p class="b-head-p" data-r="up"><?php echo fcc_txt( $s['bajada'] ); ?></p><?php endif; ?></div>
		<?php include FCC_DIR . 'partials/simulador-vidrio.php'; ?>
	</div>
</section>
		<?php
	}
}
