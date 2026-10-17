<?php
/**
 * Soluciones: tarjetas que avanzan de lado al bajar (Factoring, Confirming, Capital de Trabajo).
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

class FCC_Soluciones extends FCC_Widget {

	public function get_name() { return 'fc-soluciones'; }
	public function get_title() { return 'Soluciones'; }
	public function get_icon() { return 'eicon-slides'; }

	protected function register_controls() {
		$this->abrir( 'sec', 'Encabezado' );
		$this->texto( 'kicker', 'Rótulo', 'Soluciones' );
		$this->texto( 'titulo', 'Título', 'Tres soluciones para impulsar la *liquidez* de tu empresa', 'textarea' );
		$this->cerrar();

		$this->abrir( 'sec_items', 'Tarjetas' );
		$r = new Repeater();
		$r->add_control( 'icono', array( 'label' => 'Ícono', 'type' => Controls_Manager::SELECT, 'default' => 'factoring',
			'options' => array( 'factoring' => 'Factura', 'confirming' => 'Flechas', 'capital' => 'Gráfico', 'escudo' => 'Escudo', 'rayo' => 'Rayo' ) ) );
		$r->add_control( 'titulo', array( 'label' => 'Título', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$r->add_control( 'texto', array( 'label' => 'Texto', 'type' => Controls_Manager::TEXTAREA, 'rows' => 3, 'default' => '' ) );
		$r->add_control( 'puntos', array( 'label' => 'Puntos (uno por línea)', 'type' => Controls_Manager::TEXTAREA, 'rows' => 3, 'default' => '' ) );
		$r->add_control( 'foto', array( 'label' => 'Foto', 'type' => Controls_Manager::MEDIA ) );
		$r->add_control( 'foto_pos', array( 'label' => 'Recorte (posición)', 'type' => Controls_Manager::TEXT, 'default' => '60% 40%' ) );
		$r->add_control( 'cta1', array( 'label' => 'Botón', 'type' => Controls_Manager::TEXT, 'default' => 'Solicita tu evaluación' ) );
		$r->add_control( 'cta1_url', array( 'label' => 'Destino del botón', 'type' => Controls_Manager::URL, 'default' => fcc_url( '/contactanos/' ) ) );
		$r->add_control( 'cta2', array( 'label' => 'Enlace', 'type' => Controls_Manager::TEXT, 'default' => 'Más información' ) );
		$r->add_control( 'cta2_url', array( 'label' => 'Destino del enlace', 'type' => Controls_Manager::URL, 'default' => fcc_url( '/' ) ) );
		$u = 'https://images.unsplash.com/photo-%s?auto=format&fit=crop&w=2000&q=78';
		$this->add_control( 'items', array( 'label' => 'Tarjetas', 'type' => Controls_Manager::REPEATER, 'fields' => $r->get_controls(), 'title_field' => '{{{ titulo }}}',
			'default' => array(
				array( 'icono' => 'factoring', 'titulo' => 'Factoring', 'texto' => 'Cede tus facturas por cobrar y obtén liquidez para tu operación, sin recurrir a préstamos bancarios.',
					'puntos' => "Liquidez en tiempo récord\nAgilidad\nGestión optimizada", 'foto' => array( 'url' => sprintf( $u, '1758876022836-70b89d3e6944' ), 'id' => '' ), 'foto_pos' => '68% 30%',
					'cta1' => 'Simula tu crédito', 'cta1_url' => fcc_url( '/simulador/' ), 'cta2' => 'Más información', 'cta2_url' => fcc_url( '/factoring/' ) ),
				array( 'icono' => 'confirming', 'titulo' => 'Confirming', 'texto' => 'Gestiona el pago a tus proveedores y permíteles adelantar el cobro antes del vencimiento, sin afectar tu liquidez.',
					'puntos' => "Optimiza tu flujo de pagos\nFortalece relaciones con proveedores\nFlexibilidad financiera", 'foto' => array( 'url' => sprintf( $u, '1758519288557-9a9dee0a7f58' ), 'id' => '' ), 'foto_pos' => '60% 40%',
					'cta1' => 'Solicita tu evaluación', 'cta1_url' => fcc_url( '/confirming/#b-contacto' ), 'cta2' => 'Más información', 'cta2_url' => fcc_url( '/confirming/' ) ),
				array( 'icono' => 'capital', 'titulo' => 'Capital de Trabajo', 'texto' => 'Financiamiento estructurado para proyectos estratégicos, ajustado a garantías, plazos y capacidad de pago.',
					'puntos' => "Financiamiento a la medida\nLiquidez sin afectar tu operatividad\nCondiciones personalizadas", 'foto' => array( 'url' => sprintf( $u, '1753162658547-f017a4d84541' ), 'id' => '' ), 'foto_pos' => '60% 40%',
					'cta1' => 'Solicita tu evaluación', 'cta1_url' => fcc_url( '/capital-de-trabajo/#b-contacto' ), 'cta2' => 'Más información', 'cta2_url' => fcc_url( '/capital-de-trabajo/' ) ),
			) ) );
		$this->cerrar();
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$items = (array) $s['items'];
		?>
<section class="b-sec b-sol" id="b-soluciones" data-sec="soluciones">
<div class="b-sol-pin" data-hscroll><div class="b-sol-sticky">
	<div class="b-wrap">
		<div class="b-head b-head-row"><div><span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span><h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2></div><div class="b-sol-side"><div class="b-rail-nav"><button type="button" data-rail-prev aria-label="Solución anterior"><?php echo fcc_icono( 'flecha-izq' ); ?></button><button type="button" data-rail-next aria-label="Solución siguiente"><?php echo fcc_icono( 'flecha' ); ?></button></div></div></div>
	</div>
	<div class="b-rail b-sol-rail" data-rail tabindex="0" aria-label="Soluciones: desliza para verlas">
		<?php foreach ( $items as $i => $it ) : $puntos = array_filter( array_map( 'trim', explode( "\n", (string) $it['puntos'] ) ) ); ?>
		<article class="b-stack" style="--i:<?php echo (int) $i; ?>">
			<div class="b-stack-in">
				<div class="b-stack-img"><img style="object-position:<?php echo esc_attr( $it['foto_pos'] ?: '60% 40%' ); ?>" src="<?php echo esc_url( fcc_img( $it['foto'] ) ); ?>" alt="" loading="lazy"></div>
				<div class="b-stack-txt">
					<span class="b-stack-n"><?php echo fcc_icono( $it['icono'] ?: 'factoring', 'aria-hidden="true"' ); ?></span>
					<h3><?php echo esc_html( $it['titulo'] ); ?></h3>
					<p><?php echo fcc_txt( $it['texto'] ); ?></p>
					<?php if ( $puntos ) : ?><ul><?php foreach ( $puntos as $pt ) : ?><li><?php echo fcc_icono( 'check' ); ?><?php echo esc_html( $pt ); ?></li><?php endforeach; ?></ul><?php endif; ?>
					<div class="b-stack-acts"><?php if ( $it['cta1'] ) : ?><a class="b-btn b-btn-em" <?php echo fcc_href( $it['cta1_url'] ); ?>><?php echo esc_html( $it['cta1'] ); ?> <?php echo fcc_icono( 'flecha' ); ?></a><?php endif; ?><?php if ( $it['cta2'] ) : ?><a class="b-link" <?php echo fcc_href( $it['cta2_url'] ); ?>><?php echo esc_html( $it['cta2'] ); ?> <?php echo fcc_icono( 'flecha' ); ?></a><?php endif; ?></div>
				</div>
			</div>
		</article>
		<?php endforeach; ?>
	</div>
	<div class="b-wrap"><div class="b-rail-bar"><i data-rail-bar></i></div></div>
</div></div>
</section>
		<?php
	}
}
