<?php
/** Íconos del diseño (trazos del prototipo). */
defined( 'ABSPATH' ) || exit;

function fc_icono( string $n, string $extra = '' ): string {
	static $i = array(
		'chevron' => '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
		'flecha' => '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
		'flecha-izq' => '<svg viewBox="0 0 24 24"><path d="M19 12H6M11 6l-6 6 6 6"/></svg>',
		'externo' => '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>',
		'check' => '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.2 4.2L19 7"/></svg>',
		'cerrar' => '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
		'play' => '<svg class="g" viewBox="0 0 24 24"><path d="M8.5 5.8v12.4L18.6 12z"/></svg>',
		'factoring' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="m12.5 10.5-2.5 4h3l-2.5 4"/></svg>',
		'confirming' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h14l-3.5-3.5"/><path d="M20 16H6l3.5 3.5"/></svg>',
		'capital' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"/><path d="M6 16v-3M10.5 16v-6M15 16V7.5"/><path d="M5 10.5 10 6l3.5 2.5 6-5"/><path d="M15.5 3.5h4v4"/></svg>',
		'escudo' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z"/><path d="m9 12 2 2 4-4"/></svg>',
		'rayo' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
		'asesor' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M19 20c0 1.1-1.3 2-3 2h-3"/></svg>',
		'balanza' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M7.5 21h9M5 7h14"/><path d="m5 7-3 6a3 3 0 0 0 6 0z"/><path d="m19 7-3 6a3 3 0 0 0 6 0z"/></svg>',
		'ubicacion' => '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
		'facebook' => '<svg class="g" viewBox="0 0 24 24"><path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.5-1.5h1.7V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V11H7.6v3h2.7v8z"/></svg>',
		'linkedin' => '<svg class="g" viewBox="0 0 24 24"><path d="M6.9 8.8H3.8V20h3.1zM5.3 3.5A1.8 1.8 0 1 0 5.3 7a1.8 1.8 0 0 0 0-3.5M20.2 20h-3.1v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20H10V8.8h3v1.5h.1c.4-.8 1.4-1.7 3-1.7 3.2 0 3.8 2.1 3.8 4.9z"/></svg>',
		'instagram' => '<svg class="g" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.8-.1zm0 3.4A6.4 6.4 0 1 0 18.4 12 6.4 6.4 0 0 0 12 5.6zm0 10.5A4.1 4.1 0 1 1 16.1 12 4.1 4.1 0 0 1 12 16.1zm6.6-10.8a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z"/></svg>',
		'whatsapp' => '<svg class="g" viewBox="0 0 24 24"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z"/></svg>',
		'libro' => '<svg viewBox="0 0 24 24"><path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11M9 8.5h6"/></svg>',
		'correo' => '<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M3 7l9 6 9-6"/></svg>',
		'reloj' => '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.2"/><path d="M12 6.5V12l3.6 2.4"/></svg>',
		'tendencia' => '<svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
		'capas' => '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5"/></svg>',
		'chat' => '<svg viewBox="0 0 24 24"><path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.1A8.5 8.5 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg>',
		'maletin' => '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12.5h18"/></svg>',
		'billete' => '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/></svg>',
		'caja' => '<svg viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
		'documento' => '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
		'subir' => '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M12 17v-6M9.5 13.5 12 11l2.5 2.5"/></svg>',
		'candado' => '<svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
		'calendario' => '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/></svg>',
		'acuerdo' => '<svg viewBox="0 0 24 24"><path d="m11 17 2 2a1.4 1.4 0 0 0 2-2"/><path d="m14 14 2.5 2.5a1.4 1.4 0 0 0 2-2l-3-3.1"/><path d="m21 3-6.5 6.5L13 8 9.5 11.5a1.4 1.4 0 0 0 2 2L14 11"/><path d="M3 3l6.5 6.5M3 13l4 4"/></svg>',
		'enlace' => '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/></svg>',
		'fabrica' => '<svg viewBox="0 0 24 24"><path d="M3 21V10l6 3.5V10l6 3.5V6l6 3v12z"/><path d="M7 17h2M12 17h2M17 17h2"/></svg>',
		'tienda' => '<svg viewBox="0 0 24 24"><path d="M4 10v10h16V10"/><path d="M3 10l1.6-5h14.8L21 10"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M10 20v-5h4v5"/></svg>',
		'billetera' => '<svg viewBox="0 0 24 24"><path d="M19 9V6a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V7"/><circle cx="16.5" cy="14.5" r="1.3"/></svg>',
		'portapapeles' => '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="m9 13 2 2 4-4"/></svg>',
		'etiqueta' => '<svg viewBox="0 0 24 24"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/></svg>',
		'candado-llave' => '<svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><path d="M12 15v2"/></svg>',
		'cuadricula' => '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
		'barras' => '<svg viewBox="0 0 24 24"><path d="M5 20V11M12 20V5M19 20v-7"/></svg>',
	);
	$s = $i[ $n ] ?? '';
	return $extra && $s ? preg_replace( '/^<svg/', '<svg ' . $extra, $s ) : $s;
}

/** Íconos que se pueden elegir en los widgets (nombre → etiqueta). */
function fc_iconos_opciones(): array {
	return array(
		'check' => 'Check', 'escudo' => 'Escudo', 'rayo' => 'Rayo', 'asesor' => 'Asesor (audífonos)', 'balanza' => 'Balanza',
		'factoring' => 'Factura', 'confirming' => 'Flechas', 'capital' => 'Gráfico de crecimiento', 'tendencia' => 'Tendencia',
		'capas' => 'Capas', 'chat' => 'Conversación', 'maletin' => 'Maletín', 'billete' => 'Billete', 'caja' => 'Caja',
		'documento' => 'Documento', 'subir' => 'Subir documento', 'candado' => 'Candado', 'candado-llave' => 'Candado con llave',
		'calendario' => 'Calendario', 'acuerdo' => 'Acuerdo (apretón de manos)', 'enlace' => 'Enlace', 'fabrica' => 'Fábrica',
		'tienda' => 'Tienda', 'billetera' => 'Billetera', 'portapapeles' => 'Portapapeles', 'etiqueta' => 'Etiqueta',
		'cuadricula' => 'Cuadrícula', 'barras' => 'Barras', 'reloj' => 'Reloj', 'correo' => 'Correo', 'whatsapp' => 'WhatsApp',
		'ubicacion' => 'Ubicación',
	);
}
