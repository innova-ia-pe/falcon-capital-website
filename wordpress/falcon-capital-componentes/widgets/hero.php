<?php
/**
 * Banner del Inicio «Vidrio»: carrusel de soluciones con foto y la tarjeta del simulador de Factoring.
 * Minuta 007: tres diapositivas, el simulador solo en Factoring y más tiempo en la primera.
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

class FCC_Hero extends FCC_Widget {

	public function get_name() {
		return 'fc-hero';
	}

	public function get_title() {
		return 'Banner con simulador';
	}

	public function get_icon() {
		return 'eicon-slider-full-screen';
	}

	public function get_keywords() {
		return array( 'falcon', 'banner', 'hero', 'simulador', 'carrusel' );
	}

	private static function pct( float $v ): array {
		return array( 'unit' => '%', 'size' => $v );
	}

	private static function diapositiva( string $etq, string $tit, string $txt, string $c1, string $u1, string $u2, string $foto, string $pos, array $p, bool $sim ): array {
		return array(
			'etiqueta' => $etq, 'titulo' => $tit, 'texto' => $txt,
			'cta1' => $c1, 'cta1_url' => fcc_url( $u1 ), 'cta2' => 'Más información', 'cta2_url' => fcc_url( $u2 ),
			'foto' => fcc_media_tema( $foto ), 'foto_pos' => $pos, 'sin_personas' => '',
			'p_x0' => self::pct( $p[0] ), 'p_x1' => self::pct( $p[1] ), 'p_y0' => self::pct( $p[2] ), 'p_y1' => self::pct( $p[3] ),
			'con_sim' => $sim ? 'yes' : '',
		);
	}

	protected function register_controls() {
		$this->abrir( 'sec_diapos', 'Diapositivas' );
		$r = new Repeater();
		$r->add_control( 'etiqueta', array( 'label' => 'Nombre en el indicador', 'type' => Controls_Manager::TEXT, 'default' => 'Factoring' ) );
		$r->add_control( 'titulo', array( 'label' => 'Título', 'type' => Controls_Manager::TEXTAREA, 'rows' => 2, 'default' => '',
			'description' => 'Escribe *entre asteriscos* lo que va resaltado en verde.' ) );
		$r->add_control( 'texto', array( 'label' => 'Bajada', 'type' => Controls_Manager::TEXTAREA, 'rows' => 3, 'default' => '' ) );
		$r->add_control( 'cta1', array( 'label' => 'Enlace principal', 'type' => Controls_Manager::TEXT, 'default' => 'Simula tu crédito' ) );
		$r->add_control( 'cta1_url', array( 'label' => 'Destino del enlace principal', 'type' => Controls_Manager::URL, 'default' => fcc_url( '#b-simulador' ),
			'description' => '«#b-simulador» lleva a la tarjeta del simulador.' ) );
		$r->add_control( 'cta2', array( 'label' => 'Enlace secundario', 'type' => Controls_Manager::TEXT, 'default' => 'Más información' ) );
		$r->add_control( 'cta2_url', array( 'label' => 'Destino del enlace secundario', 'type' => Controls_Manager::URL, 'default' => fcc_url( '/factoring/' ) ) );
		$r->add_control( 'con_sim', array( 'label' => 'Mostrar el simulador', 'type' => Controls_Manager::SWITCHER, 'default' => '',
			'description' => 'El simulador es de Factoring: en las demás diapositivas se oculta.' ) );
		$r->add_control( 'foto', array( 'label' => 'Foto', 'type' => Controls_Manager::MEDIA, 'separator' => 'before' ) );
		$r->add_control( 'sin_personas', array( 'label' => 'La foto no tiene personas', 'type' => Controls_Manager::SWITCHER, 'default' => '',
			'description' => 'Si está activo, la foto cubre todo el banner.' ) );
		$cond = array( 'sin_personas!' => 'yes' );
		$r->add_control( 'nota_p', array( 'type' => Controls_Manager::RAW_HTML, 'condition' => $cond,
			'raw' => 'Indica dónde están las personas en la foto (en % del ancho y del alto). El banner la encuadra para que sus caras no queden bajo el texto ni detrás de la tarjeta.',
			'content_classes' => 'elementor-descriptor' ) );
		foreach ( array( 'p_x0' => 'Personas: desde (izquierda)', 'p_x1' => 'Personas: hasta (derecha)', 'p_y0' => 'Caras: borde de arriba', 'p_y1' => 'Caras: borde de abajo' ) as $k => $etq ) {
			$r->add_control( $k, array( 'label' => $etq, 'type' => Controls_Manager::SLIDER, 'size_units' => array( '%' ),
				'range' => array( '%' => array( 'min' => 0, 'max' => 100 ) ), 'default' => self::pct( 50 ), 'condition' => $cond ) );
		}
		$r->add_control( 'foto_pos', array( 'label' => 'Recorte en celular (posición)', 'type' => Controls_Manager::TEXT, 'default' => '50% 30%',
			'description' => 'Horizontal y vertical, por ejemplo «55% 30%».' ) );

		$this->add_control( 'diapos', array(
			'label'       => 'Diapositivas',
			'type'        => Controls_Manager::REPEATER,
			'fields'      => $r->get_controls(),
			'title_field' => '{{{ etiqueta }}}',
			'default'     => array(
				self::diapositiva( 'Factoring', 'Convierte tus facturas en *liquidez inmediata*',
					'Transforma tus facturas en oportunidades y fortalece el flujo de tu negocio sin complicaciones.',
					'Simula tu crédito', '#b-simulador', '/factoring/', 'b-factoring.jpg', '55% 30%', array( 35, 71, 6, 39 ), true ),
				self::diapositiva( 'Confirming', 'Ordena tus pagos y *potencia tu relación* con proveedores',
					'Administra tus pagos de forma eficiente y permite que tus proveedores cobren antes del vencimiento.',
					'Solicita tu evaluación', '/confirming/#b-contacto', '/confirming/', 'b-confirming.jpg', '45% 30%', array( 24.5, 62.5, 14, 47 ), false ),
				self::diapositiva( 'Capital', 'Crece sin *comprometer* tu operación',
					'Obtén los recursos que necesitas para ejecutar tus proyectos y mantener tu negocio en movimiento.',
					'Solicita tu evaluación', '/capital-de-trabajo/#b-contacto', '/capital-de-trabajo/', 'b-capital.jpg', '70% 30%', array( 30, 69, 9, 41 ), false ),
			),
		) );
		$this->cerrar();

		$this->abrir( 'sec_tiempos', 'Carrusel' );
		$this->add_control( 'dur1', array( 'label' => 'Primera diapositiva (segundos)', 'type' => Controls_Manager::NUMBER, 'min' => 3, 'max' => 30, 'default' => 12 ) );
		$this->add_control( 'dur', array( 'label' => 'Demás diapositivas (segundos)', 'type' => Controls_Manager::NUMBER, 'min' => 3, 'max' => 30, 'default' => 7 ) );
		$this->nota( 'nota_tasa', 'La tasa del simulador se cambia en <b>Ajustes → Falcon Capital</b>. En celular el carrusel no avanza solo.' );
		$this->cerrar();
	}

	protected function render() {
		$s      = $this->get_settings_for_display();
		$diapos = array_values( array_filter( (array) ( $s['diapos'] ?? array() ), fn( $d ) => trim( (string) ( $d['titulo'] ?? '' ) ) !== '' ) );
		if ( ! $diapos ) {
			return;
		}
		$claves = array();
		foreach ( $diapos as $i => $d ) {
			$k = sanitize_title( $d['etiqueta'] ?? '' ) ?: 'diapositiva';
			$claves[ $i ] = in_array( $k, $claves, true ) ? $k . '-' . $i : $k;
		}
		$conSim = (bool) array_filter( $diapos, fn( $d ) => ( $d['con_sim'] ?? '' ) === 'yes' );
		$num    = fn( $v ) => isset( $v['size'] ) && $v['size'] !== '' ? round( (float) $v['size'] / 100, 3 ) : 0.5;
		?>
<section class="b-hero bh1" id="b-simulador" data-sec="hero" data-hero data-hv="1" data-dur="<?php echo esc_attr( (int) ( $s['dur'] ?: 7 ) ); ?>" data-dur1="<?php echo esc_attr( (int) ( $s['dur1'] ?: 12 ) ); ?>">
	<div class="b-hero-bg" aria-hidden="true"><?php
		foreach ( $diapos as $i => $d ) {
			$url   = fcc_img( $d['foto'] ?? array() );
			$attrs = $i === 0 ? ' class="is-on" fetchpriority="high"' : ' class="" loading="lazy"';
			$cara  = ( $d['sin_personas'] ?? '' ) === 'yes' ? ' data-full' : ' data-caras="' . esc_attr( wp_json_encode( array( $num( $d['p_x0'] ?? null ), $num( $d['p_y0'] ?? null ), $num( $d['p_x1'] ?? null ), $num( $d['p_y1'] ?? null ) ) ) ) . '"';
			printf( '<img%s src="%s" alt="" data-prod="%s" data-blur="%s"%s style="object-position:%s">', $attrs, esc_url( $url ), esc_attr( $claves[ $i ] ), esc_url( $url ), $cara, esc_attr( $d['foto_pos'] ?: '50% 30%' ) );
		}
	?></div><div class="b-hero-frost" aria-hidden="true"></div>
	<div class="b-hero-shade" aria-hidden="true"></div>
	<div class="b-wrap b-hero-in">
		<div class="b-copies" data-swipe><?php foreach ( $diapos as $i => $d ) :
			$sim  = ( $d['con_sim'] ?? '' ) === 'yes';
			$u1   = $d['cta1_url']['url'] ?? '';
			$foco = $sim && str_starts_with( $u1, '#' ) ? ' data-focus-sim' : '';
			$tag  = $i === 0 ? 'h1' : 'p';
			?><div class="b-copy<?php echo $i === 0 ? ' is-on' : ''; ?>" data-prod="<?php echo esc_attr( $claves[ $i ] ); ?>"<?php echo $sim ? ' data-con-sim' : ''; ?><?php echo $i ? ' aria-hidden="true"' : ''; ?>>
				<<?php echo $tag; ?> class="b-h1"><?php echo fcc_txt( $d['titulo'] ); ?></<?php echo $tag; ?>>
				<?php if ( ! empty( $d['texto'] ) ) : ?><p><?php echo fcc_txt( $d['texto'] ); ?></p><?php endif; ?>
				<div class="b-copy-acts"><?php if ( ! empty( $d['cta1'] ) ) : ?><a class="b-more" <?php echo fcc_href( $d['cta1_url'] ?? '' ); ?><?php echo $foco; ?>><?php echo esc_html( $d['cta1'] ); ?> <?php echo fcc_icono( 'flecha' ); ?></a><?php endif; ?><?php if ( ! empty( $d['cta2'] ) ) : ?><a class="b-more b-more-alt" <?php echo fcc_href( $d['cta2_url'] ?? '' ); ?>><?php echo esc_html( $d['cta2'] ); ?></a><?php endif; ?></div>
			</div><?php endforeach; ?></div>
		<?php if ( count( $diapos ) > 1 ) : ?>
		<div class="b-dots-row">
			<button type="button" class="b-arrow" data-prev aria-label="Anterior"><?php echo fcc_icono( 'flecha-izq' ); ?></button>
			<div class="b-dots" aria-label="Diapositivas"><?php foreach ( $diapos as $i => $d ) : ?><button type="button" data-prod="<?php echo esc_attr( $claves[ $i ] ); ?>" aria-label="<?php echo esc_attr( $d['etiqueta'] ); ?>"<?php echo $i === 0 ? ' class="is-on" aria-current="true"' : ''; ?>><span><?php echo esc_html( $d['etiqueta'] ); ?></span><b class="b-prog"></b></button><?php endforeach; ?></div>
			<button type="button" class="b-arrow" data-next aria-label="Siguiente"><?php echo fcc_icono( 'flecha' ); ?></button>
		</div>
		<?php endif; ?>
		<?php if ( $conSim ) { include FCC_DIR . 'partials/simulador-vidrio.php'; } ?>
	</div>
</section>
		<?php
	}
}
