<?php
/**
 * «Falcon Capital en la actualidad»: carrusel de noticias y eventos.
 */
defined( 'ABSPATH' ) || exit;

use Elementor\Controls_Manager;
use Elementor\Repeater;

class FCC_Actualidad extends FCC_Widget {

	public function get_name() { return 'fc-actualidad'; }
	public function get_title() { return 'Noticias (actualidad)'; }
	public function get_icon() { return 'eicon-carousel'; }

	private static function n( string $img, string $tag, string $sub, string $tit, string $txt ): array {
		return array( 'foto' => fcc_media_tema( $img ), 'tag' => $tag, 'sub' => $sub, 'titulo' => $tit, 'texto' => $txt );
	}

	protected function register_controls() {
		$this->abrir( 'sec', 'Encabezado' );
		$this->texto( 'kicker', 'Rótulo', 'Falcon Capital en la actualidad' );
		$this->texto( 'titulo', 'Título', 'Impulsando el futuro del factoring en el Perú', 'textarea' );
		$this->cerrar();

		$this->abrir( 'sec_items', 'Noticias' );
		$r = new Repeater();
		$r->add_control( 'foto', array( 'label' => 'Foto', 'type' => Controls_Manager::MEDIA ) );
		$r->add_control( 'tag', array( 'label' => 'Etiqueta', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$r->add_control( 'sub', array( 'label' => 'Antetítulo', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$r->add_control( 'titulo', array( 'label' => 'Título', 'type' => Controls_Manager::TEXT, 'default' => '' ) );
		$r->add_control( 'texto', array( 'label' => 'Texto', 'type' => Controls_Manager::TEXTAREA, 'rows' => 4, 'default' => '' ) );
		$this->add_control( 'items', array( 'label' => 'Noticias', 'type' => Controls_Manager::REPEATER, 'fields' => $r->get_controls(), 'title_field' => '{{{ titulo }}}',
			'default' => array(
				self::n( 'act-1.jpg', 'APEFAC', 'Asociación importante como compañía', 'Ahora formamos parte del APEFAC', 'Desde el 2025 somos parte de la Asociación Peruana de Empresas de Factoring (APEFAC), fortaleciendo nuestros procesos internos para brindar un servicio más seguro, ágil y eficiente a nuestros clientes.' ),
				self::n( 'act-2.jpg', 'Expopyme', 'Evento financiero de gran alcance', 'Presentes en la XXVI Expopyme 2025', 'Bruno Cárdenas, Coordinador de Gestión de Riesgos de Falcon Capital, con su ponencia «Gestión de Riesgos en la Era Digital: Fraude, cumplimiento y modelos predictivos», destacó el valor de la analítica y la inteligencia artificial en la toma de decisiones financieras.' ),
				self::n( 'act-3.jpg', 'Congreso', 'Celebramos 10 años de Factoring en el Perú', 'Participamos en el 5° Congreso Nacional de Factoring', 'Nuestra participación reafirma el compromiso de seguir promoviendo soluciones financieras ágiles, transparentes y confiables, que fortalezcan la liquidez y el crecimiento sostenible de las empresas peruanas.' ),
				self::n( 'act-4.jpg', 'Rueda de negocio', 'Asociación estratégica', 'Participamos en la rueda de negocios del Club Terrazas', 'Fuimos parte de este espacio que conecta a empresas y líderes, fortaleciendo relaciones y generando nuevas oportunidades de crecimiento.' ),
				self::n( 'act-5.jpg', 'Seminario', 'Espacios clave del sector', 'Conectando ideas en el Factoring Road Show Lima 2026', 'Participamos de este importante seminario que reúne a expertos del Perú y la región, donde profundizamos en las tendencias del confirming y el financiamiento, fortaleciendo nuestro conocimiento en el sector.' ),
				self::n( 'act-expocobre.jpg', 'Expocobre', 'Oportunidades en sectores estratégicos', 'Estamos presentes en el Expocobre 2026', 'Participamos en uno de los principales encuentros del sector minero, conectando con empresas y ofreciendo soluciones financieras ágiles que impulsan su crecimiento y liquidez.' ),
				self::n( 'act-expoindustria.jpg', 'Expo Industria', 'Conectados con el crecimiento industrial', 'Falcon Capital presente en el Expo Industria 2026', 'Acompañamos a las industrias con soluciones financieras ágiles para mantener su producción, optimizar su liquidez y potenciar su crecimiento.' ),
				self::n( 'act-masterclass.jpg', 'Master class', 'Estrategias para generar mejores resultados', 'Participamos en el Master Class «Tus palabras venden»', 'Esta capacitación nos permitió fortalecer nuestras habilidades para estructurar mensajes que generan decisiones, influir de manera efectiva y negociar sin perder valor, logrando cierres más sólidos y estratégicos.' ),
				self::n( 'act-copa-apefac.jpg', 'Copa APEFAC', 'Juntos, dentro y fuera de la cancha', '¡Debutamos con triunfo en la Copa APEFAC 2026!', 'Nuestro equipo inició el campeonato de fútbol con una gran victoria, demostrando compromiso, unión y trabajo en equipo dentro y fuera de la cancha.' ),
				self::n( 'act-factrack.jpg', 'Aniversario', '10 años conectando oportunidades', 'Impulsando juntos el futuro del factoring en el Perú', 'Falcon Capital, representado por nuestro Gerente General, Julio Sebastiani, participó en la celebración por los 10 años de Factrack, un encuentro que reunió a referentes del sector para compartir perspectivas sobre la evolución y futuro del factoring en el Perú.' ),
			) ) );
		$this->cerrar();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		?>
<section class="b-sec b-act" id="b-actualidad" data-sec="actualidad">
	<div class="b-wrap"><div class="b-head b-head-row"><div><span class="b-kicker" data-r="up"><?php echo esc_html( $s['kicker'] ); ?></span><h2 data-r="up"><?php echo fcc_txt( $s['titulo'] ); ?></h2></div><div class="b-rail-nav"><button type="button" data-rail-prev aria-label="Anterior"><?php echo fcc_icono( 'flecha-izq' ); ?></button><button type="button" data-rail-next aria-label="Siguiente"><?php echo fcc_icono( 'flecha' ); ?></button></div></div></div>
	<div class="b-rail" data-rail tabindex="0" aria-label="Noticias de Falcon Capital">
		<?php foreach ( (array) $s['items'] as $it ) : ?>
		<article class="b-news">
			<img src="<?php echo esc_url( fcc_img( $it['foto'] ) ); ?>" alt="" loading="lazy">
			<div class="b-news-body"><?php if ( $it['tag'] ) : ?><span class="b-tag"><?php echo esc_html( $it['tag'] ); ?></span><?php endif; ?><?php if ( $it['sub'] ) : ?><small><?php echo esc_html( $it['sub'] ); ?></small><?php endif; ?><h3><?php echo esc_html( $it['titulo'] ); ?></h3><p><?php echo esc_html( $it['texto'] ); ?></p></div>
		</article>
		<?php endforeach; ?>
	</div>
	<div class="b-wrap"><div class="b-rail-bar"><i data-rail-bar></i></div></div>
</section>
		<?php
	}
}
