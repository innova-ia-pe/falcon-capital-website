<?php
/**
 * Base de los widgets de Falcon Capital: categoría propia y atajos para declarar controles.
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;

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
}
