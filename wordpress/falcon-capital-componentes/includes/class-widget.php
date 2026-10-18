<?php
/**
 * Base de los widgets de Falcon Capital: categoría propia, atajos para declarar controles y piezas que se repiten
 * entre secciones (botones, migas de pan, cifras y respaldo).
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

abstract class FCC_Widget extends \Elementor\Widget_Base {

	public function get_categories() {
		return array( 'falcon-capital' );
	}

	public function get_icon() {
		return 'eicon-site-logo';
	}

	/** Sin envoltorio interno extra: el marcado queda igual al del diseño. */
	public function has_widget_inner_wrapper(): bool {
		return false;
	}

	protected function abrir( string $id, string $titulo ): void {
		$this->start_controls_section( $id, array( 'label' => $titulo, 'tab' => Controls_Manager::TAB_CONTENT ) );
	}

	protected function cerrar(): void {
		$this->end_controls_section();
	}

	/** Campo de texto (text, textarea o wysiwyg). En títulos, *texto* se resalta en verde. */
	protected function texto( string $id, string $etq, string $def = '', string $tipo = 'text', array $mas = array() ): void {
		$t = array( 'text' => Controls_Manager::TEXT, 'textarea' => Controls_Manager::TEXTAREA, 'wysiwyg' => Controls_Manager::WYSIWYG );
		$this->add_control( $id, $mas + array( 'label' => $etq, 'type' => $t[ $tipo ], 'default' => $def, 'label_block' => true, 'dynamic' => array( 'active' => true ) ) );
	}

	protected function enlace( string $id, string $etq, string $def = '' ): void {
		$this->add_control( $id, array( 'label' => $etq, 'type' => Controls_Manager::URL, 'default' => fcc_url( $def ), 'dynamic' => array( 'active' => true ) ) );
	}

	protected function imagen( string $id, string $etq, string $archivo = '' ): void {
		$this->add_control( $id, array( 'label' => $etq, 'type' => Controls_Manager::MEDIA, 'default' => $archivo ? fcc_media_tema( $archivo ) : array() ) );
	}

	protected function nota( string $id, string $html ): void {
		$this->add_control( $id, array( 'type' => Controls_Manager::RAW_HTML, 'raw' => $html, 'content_classes' => 'elementor-descriptor' ) );
	}

	protected function icono( string $id, string $etq, string $def = 'check' ): void {
		$this->add_control( $id, array( 'label' => $etq, 'type' => Controls_Manager::SELECT, 'options' => fcc_iconos(), 'default' => $def ) );
	}

	protected function interruptor( string $id, string $etq, bool $def = true, string $desc = '' ): void {
		$this->add_control( $id, array( 'label' => $etq, 'type' => Controls_Manager::SWITCHER, 'default' => $def ? 'yes' : '', 'description' => $desc ) );
	}

	/**
	 * Repetidor sencillo. $campos = [ id => [ tipo, etiqueta, defecto ] ] con tipo text, textarea, icono, media,
	 * url o switch.
	 */
	protected function lista( string $id, string $etq, array $campos, array $defecto, string $titulo = '' ): void {
		$r = new Repeater();
		foreach ( $campos as $k => $c ) {
			$tipo = $c[0];
			$e    = $c[1];
			$d    = $c[2] ?? '';
			if ( $tipo === 'icono' ) {
				$r->add_control( $k, array( 'label' => $e, 'type' => Controls_Manager::SELECT, 'options' => fcc_iconos(), 'default' => $d ?: 'check' ) );
			} elseif ( $tipo === 'media' ) {
				$r->add_control( $k, array( 'label' => $e, 'type' => Controls_Manager::MEDIA, 'default' => is_array( $d ) && $d ? $d : fcc_media_nueva() ) );
			} elseif ( $tipo === 'url' ) {
				$r->add_control( $k, array( 'label' => $e, 'type' => Controls_Manager::URL, 'default' => fcc_url( (string) $d ) ) );
			} elseif ( $tipo === 'switch' ) {
				$r->add_control( $k, array( 'label' => $e, 'type' => Controls_Manager::SWITCHER, 'default' => $d ) );
			} else {
				/* tarjeta nueva: los campos principales vacíos muestran un ejemplo para reemplazar */
				$ejemplo = array( 'titulo' => 'Título', 'texto' => 'Texto', 'pregunta' => 'Nueva pregunta', 'respuesta' => 'Respuesta.' );
				if ( $d === '' && isset( $ejemplo[ $k ] ) ) {
					$d = $k === 'texto' && $e !== 'Texto' ? $e : $ejemplo[ $k ];
				}
				$r->add_control( $k, array( 'label' => $e, 'type' => $tipo === 'textarea' ? Controls_Manager::TEXTAREA : Controls_Manager::TEXT, 'default' => $d, 'label_block' => true ) );
			}
		}
		$t = $titulo ?: '{{{ ' . array_keys( $campos )[0] . ' }}}';
		$this->add_control( $id, array( 'label' => $etq, 'type' => Controls_Manager::REPEATER, 'fields' => $r->get_controls(), 'title_field' => $t, 'default' => $defecto ) );
	}

	/* ---------------------------------------------------------------- cifras y respaldo (Inicio y Conócenos) */
	protected function controles_datos(): void {
		$this->abrir( 'sec_cifras', 'Cifras y respaldo' );
		$this->interruptor( 'con_cifras', 'Mostrar cifras y respaldo' );
		$this->lista( 'cifras', 'Cifras', array(
			'antes'   => array( 'text', 'Antes del número', '+' ),
			'numero'  => array( 'text', 'Número', '100' ),
			'despues' => array( 'text', 'Después del número', '' ),
			'texto'   => array( 'text', 'Descripción', '' ),
		), array(
			array( 'antes' => '+ S/', 'numero' => '300', 'despues' => 'M', 'texto' => 'en desembolsos de facturas' ),
			array( 'antes' => '+', 'numero' => '150', 'despues' => '', 'texto' => 'mypes atendidas en todo el país' ),
			array( 'antes' => '+', 'numero' => '3', 'despues' => 'años', 'texto' => 'de operaciones en el mercado peruano' ),
		), '{{{ antes }}}{{{ numero }}} {{{ despues }}}' );
		$this->nota( 'nota_cifras', 'Las cifras deben estar validadas por Falcon Capital antes de publicar.' );
		$g = new Repeater();
		$g->add_control( 'logo', array( 'label' => 'Logo', 'type' => Controls_Manager::MEDIA ) );
		$g->add_control( 'titulo', array( 'label' => 'Título', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$g->add_control( 'texto', array( 'label' => 'Texto', 'type' => Controls_Manager::TEXT, 'default' => '', 'label_block' => true ) );
		$g->add_control( 'clase', array( 'label' => 'Tamaño del logo', 'type' => Controls_Manager::SELECT, 'default' => 'lg-on',
			'options' => array( 'lg-on' => 'Ancho (como ON Empresas)', 'lg-apefac' => 'Compacto (como APEFAC)' ) ) );
		$this->add_control( 'grupo', array( 'label' => 'Respaldo', 'type' => Controls_Manager::REPEATER, 'fields' => $g->get_controls(), 'title_field' => '{{{ titulo }}}',
			'default' => array(
				array( 'logo' => fcc_media_tema( 'on-empresas-dark.png' ), 'titulo' => 'Grupo ON Empresas', 'texto' => 'Falcon Capital es parte del grupo económico ON Empresas.', 'clase' => 'lg-on' ),
				array( 'logo' => fcc_media_tema( 'logo-apefac.png' ), 'titulo' => 'Miembros de APEFAC', 'texto' => 'Asociación Peruana de Empresas de Factoring.', 'clase' => 'lg-apefac' ),
			) ) );
		$this->cerrar();
	}

	protected function render_datos( array $s ): void {
		if ( ( $s['con_cifras'] ?? 'yes' ) !== 'yes' ) {
			return;
		}
		echo '<div class="b-wrap" data-sec="datos"><ul class="b-stats">';
		foreach ( (array) ( $s['cifras'] ?? array() ) as $c ) {
			$n = preg_replace( '/[^\d.]/', '', (string) ( $c['numero'] ?? '' ) );
			echo '<li data-r="up"><b>';
			if ( ( $c['antes'] ?? '' ) !== '' ) {
				echo '<small>' . esc_html( $c['antes'] ) . '</small>';
			}
			echo '<span data-count="' . esc_attr( $n ) . '">' . esc_html( $n ) . '</span>';
			if ( ( $c['despues'] ?? '' ) !== '' ) {
				echo '<small>' . esc_html( $c['despues'] ) . '</small>';
			}
			echo '</b><span>' . esc_html( $c['texto'] ?? '' ) . '</span></li>';
		}
		echo '</ul><div class="b-group">';
		foreach ( (array) ( $s['grupo'] ?? array() ) as $g ) {
			echo '<div class="b-group-i" data-r="up"><span class="b-plate"><img class="' . esc_attr( $g['clase'] ?? 'lg-on' ) . '" src="' . esc_url( fcc_img( $g['logo'] ?? array() ) ) . '" alt="' . esc_attr( $g['titulo'] ?? '' ) . '" loading="lazy"></span><p><b>' . esc_html( $g['titulo'] ?? '' ) . '</b><span>' . esc_html( $g['texto'] ?? '' ) . '</span></p></div>';
		}
		echo '</div></div>';
	}

	/* ---------------------------------------------------------------- botones y migas de pan */
	protected function controles_botones( string $b1 = '', string $u1 = '', string $b2 = '', string $u2 = '' ): void {
		$this->texto( 'b1', 'Botón principal', $b1 );
		$this->enlace( 'b1_url', 'Destino del botón principal', $u1 );
		$this->texto( 'b2', 'Botón secundario', $b2 );
		$this->enlace( 'b2_url', 'Destino del botón secundario', $u2 );
	}

	protected function botones( string $clase, array $s, string $extra = '' ): string {
		$h = '';
		if ( ! empty( $s['b1'] ) ) {
			$h .= '<a class="b-btn b-btn-em b-btn-lg" ' . fcc_href( $s['b1_url'] ?? '' ) . '>' . esc_html( $s['b1'] ) . ' ' . fcc_icono( 'flecha' ) . '</a>';
		}
		if ( ! empty( $s['b2'] ) ) {
			$h .= '<a class="b-btn b-btn-ghost b-btn-lg" ' . fcc_href( $s['b2_url'] ?? '' ) . '>' . esc_html( $s['b2'] ) . '</a>';
		}
		return $h ? '<div class="' . esc_attr( $clase ) . '"' . $extra . '>' . $h . '</div>' : '';
	}

	/** Migas de pan: Inicio / [intermedio] / actual (si está vacío, el título de la página). */
	protected function migas( string $intermedio, string $actual ): string {
		$h = '<nav class="b-crumbs" aria-label="Ruta"><a href="' . esc_url( home_url( '/' ) ) . '">Inicio</a><span>/</span>';
		if ( $intermedio !== '' ) {
			$h .= '<span>' . esc_html( $intermedio ) . '</span><span>/</span>';
		}
		return $h . '<b>' . esc_html( $actual !== '' ? $actual : get_the_title() ) . '</b></nav>';
	}

	/** Lista con ícono por renglón (b-facts). */
	protected function render_datos_cortos( array $items, string $clase = 'b-facts' ): string {
		if ( ! $items ) {
			return '';
		}
		$h = '<ul class="' . esc_attr( $clase ) . '" data-r="up">';
		foreach ( $items as $it ) {
			$h .= '<li>' . fcc_icono( $it['icono'] ?? 'check' ) . '<span>' . esc_html( $it['texto'] ?? '' ) . '</span></li>';
		}
		return $h . '</ul>';
	}
}
