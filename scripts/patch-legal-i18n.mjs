/**
 * @deprecated Use `npm run sync:legal-i18n` (scripts/sync-legal-i18n.mjs) instead.
 * Kept for reference; do not run after story 9-7 without updating keys below.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const legal = {
  common: {
    eyebrow: 'Documentos legales',
    contents: 'Contenidos',
    meta: {
      updated_label: 'Última actualización:',
      updated_date: '18 de mayo de 2026',
      effective_label: 'Vigente desde el',
      effective_date: '18 de mayo de 2026',
    },
    footer: {
      description:
        'Redistribuye lo que no necesitas. Donación de objetos entre personas, sin dinero ni trueque. España.',
      contact_label: 'Contacto',
      copy: '© 2026 Regálalo · Todos los derechos reservados',
      motto: 'Todo lo que se da, vuelve.',
    },
  },
  privacy: {
    title: 'Política de privacidad',
    info: {
      part1: 'Esta política explica qué datos personales recoge ',
      brand: 'Regálalo',
      part2: ', con qué finalidad, durante cuánto tiempo los conservamos y qué derechos tienes sobre ellos. Nos ajustamos al ',
      rgpd: 'Reglamento General de Protección de Datos (RGPD)',
      part3:
        ' y a la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).',
    },
    toc: {
      controller: 'Responsable del tratamiento',
      data: 'Datos que recogemos',
      purpose: 'Finalidad y base legal',
      retention: 'Conservación de datos',
      recipients: 'Destinatarios y transferencias',
      rights: 'Tus derechos',
      minors: 'Menores de edad',
      changes: 'Cambios en esta política',
      contact: 'Contacto',
    },
    sections: {
      controller: {
        title: 'Responsable del tratamiento',
        rows: {
          company_label: 'Denominación social',
          company_value: 'Regálalo S.L. (en constitución)',
          address_label: 'Domicilio',
          address_value: 'España (MVP — mercado español)',
          email_label: 'Correo electrónico de contacto',
          email_value: 'privacidad@regalalo.org',
        },
      },
      data: {
        title: 'Datos que recogemos',
        intro:
          'Recogemos únicamente los datos necesarios para que la plataforma funcione. A continuación se detallan las categorías de datos y su origen.',
        table: {
          headers: ['Categoría', 'Datos concretos', 'Origen'],
          rows: [
            ['Identificación', 'Dirección de correo electrónico', 'Proporcionado por el usuario al registrarse'],
            ['Localización', 'Código postal', 'Proporcionado por el usuario en el perfil'],
            [
              'Actividad',
              'Objetos publicados, solicitudes enviadas, sesiones de entrega, historial de reputación',
              'Generado por el uso de la plataforma',
            ],
            ['Imágenes', 'Fotos de objetos publicados (máx. 5 por objeto)', 'Subidas por el usuario al publicar un objeto'],
            [
              'Canal de contacto',
              'Número de teléfono o email externo para coordinar la entrega',
              'Proporcionado por el donante al seleccionar receptor',
            ],
            [
              'Técnicos',
              'Dirección IP, tipo de navegador, timestamps de acceso',
              'Recogidos automáticamente en cada petición al servidor',
            ],
          ],
        },
        not_collected_title: 'Datos que no recogemos',
        not_collected_body:
          'No pedimos nombre completo, DNI, número de teléfono en el registro, ni ningún dato de categoría especial según el artículo 9 del RGPD (salud, origen étnico, religión, opiniones políticas, etc.).',
      },
      purpose: {
        title: 'Finalidad y base legal',
        table: {
          headers: ['Finalidad', 'Base legal (RGPD art. 6)'],
          rows: [
            ['Gestionar tu cuenta y autenticación', 'Ejecución del contrato (art. 6.1.b)'],
            ['Mostrar objetos dentro del radio geográfico de 50 km', 'Ejecución del contrato (art. 6.1.b)'],
            [
              'Calcular la reputación y el puesto en la lista de candidatos',
              'Ejecución del contrato (art. 6.1.b)',
            ],
            [
              'Enviar notificaciones por email relacionadas con tus objetos o solicitudes',
              'Ejecución del contrato (art. 6.1.b)',
            ],
            [
              'Detectar si alguien solo recibe sin aportar a la comunidad, para ajustar su visibilidad en la lista',
              'Interés legítimo (art. 6.1.f) — equilibrio de la comunidad',
            ],
            ['Prevención de fraude y seguridad técnica', 'Interés legítimo (art. 6.1.f)'],
          ],
        },
        footer:
          'No usamos tus datos para publicidad, perfiles comerciales, ni los cedemos a terceros con fines de marketing.',
      },
      retention: {
        title: 'Conservación de datos',
        intro:
          'Conservamos tus datos el tiempo mínimo necesario para cumplir la finalidad para la que fueron recogidos.',
        table: {
          headers: ['Dato', 'Plazo de conservación'],
          rows: [
            [
              'Cuenta y datos de perfil',
              'Mientras la cuenta esté activa. Tras solicitud de baja: 30 días para poder reactivarla, y eliminación definitiva transcurrido ese plazo',
            ],
            [
              'Imágenes de objetos completados o cancelados',
              '30 días desde el cambio de estado, después se eliminan automáticamente',
            ],
            [
              'Canal de contacto de la sesión de entrega',
              'Se purga (sobrescrito con NULL) a los 7 días de que la sesión alcance estado completada, cancelada o expirada',
            ],
            ['Logs técnicos (IP, timestamps)', '90 días'],
            ['Historial de reputación', 'Asociado a la cuenta activa; se elimina con la cuenta'],
          ],
        },
      },
      recipients: {
        title: 'Destinatarios y transferencias',
        intro:
          'No vendemos tus datos ni los compartimos con terceros con fines comerciales. Podemos compartirlos únicamente con proveedores de servicios que actúan como encargados del tratamiento y con quienes mantenemos los contratos de encargo exigidos por el RGPD.',
        table: {
          headers: ['Proveedor', 'Servicio', 'Ubicación'],
          rows: [
            ['Proveedor de infraestructura cloud', 'Alojamiento de la aplicación y base de datos', 'Unión Europea'],
            [
              'Proveedor de envío de emails transaccionales',
              'Notificaciones de la plataforma',
              'Unión Europea o con garantías equivalentes',
            ],
          ],
        },
        footer:
          'No realizamos transferencias internacionales de datos fuera del Espacio Económico Europeo sin las garantías adecuadas previstas en el RGPD (arts. 44 a 49).',
      },
      rights: {
        title: 'Tus derechos',
        intro_before:
          'Como titular de los datos, puedes ejercer los siguientes derechos en cualquier momento escribiéndonos a ',
        intro_email: 'privacidad@regalalo.org',
        intro_after: '. Responderemos en el plazo máximo de un mes.',
        cards: [
          { tag: 'Art. 15', label: 'Acceso', desc: 'Saber qué datos tuyos tratamos y obtener una copia.' },
          { tag: 'Art. 16', label: 'Rectificación', desc: 'Corregir datos inexactos o incompletos.' },
          { tag: 'Art. 17', label: 'Supresión', desc: 'Solicitar que eliminemos tus datos ("derecho al olvido").' },
          {
            tag: 'Art. 18',
            label: 'Limitación',
            desc: 'Pedir que suspendamos el tratamiento mientras revisamos una reclamación.',
          },
          { tag: 'Art. 20', label: 'Portabilidad', desc: 'Recibir tus datos en formato estructurado y legible por máquina.' },
          { tag: 'Art. 21', label: 'Oposición', desc: 'Oponerte al tratamiento basado en interés legítimo.' },
        ],
        aepd_before:
          'Si consideras que el tratamiento de tus datos no es correcto, puedes presentar una reclamación ante la ',
        aepd_link: 'Agencia Española de Protección de Datos (AEPD)',
        aepd_after: ' en www.aepd.es.',
      },
      minors: {
        title: 'Menores de edad',
        paragraphs: [
          'La plataforma está dirigida a personas mayores de 18 años. No recogemos conscientemente datos de menores. Si detectamos que un usuario es menor de 18 años, eliminaremos su cuenta y datos asociados.',
          'Si eres padre, madre o tutor y crees que un menor ha creado una cuenta, escríbenos a privacidad@regalalo.org.',
        ],
      },
      changes: {
        title: 'Cambios en esta política',
        paragraphs: [
          'Podemos actualizar esta política cuando sea necesario por cambios normativos o de producto. Si los cambios son relevantes, te lo notificaremos por email con al menos 15 días de antelación. La fecha de "última actualización" en el encabezado refleja siempre la versión vigente.',
          'El uso continuado de la plataforma tras la entrada en vigor de los cambios implica su aceptación.',
        ],
      },
      contact: {
        title: 'Contacto',
        intro: 'Para cualquier consulta sobre esta política o para ejercer tus derechos, contacta con nosotros:',
        rows: {
          email_label: 'Email de privacidad',
          email_value: 'privacidad@regalalo.org',
          response_label: 'Plazo de respuesta',
          response_value: 'Máximo 30 días desde la recepción de tu solicitud',
        },
      },
    },
  },
  cookies: {
    title: 'Política de cookies',
    info: {
      part1: 'Esta política explica qué cookies y tecnologías similares usa ',
      brand: 'Regálalo',
      part2: ', para qué sirven y cómo puedes gestionarlas. Cumplimos con la ',
      lssi: 'Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI)',
      part3: ' y el RGPD.',
    },
    toc: {
      what: 'Qué son las cookies',
      types: 'Tipos de cookies que usamos',
      table: 'Tabla de cookies',
      consent: 'Consentimiento y banner',
      manage: 'Gestionar tus preferencias',
      third_party: 'Cookies de terceros',
      changes: 'Cambios en esta política',
      contact: 'Contacto',
    },
    sections: {
      what: {
        title: 'Qué son las cookies',
        paragraphs: {
          p0: 'Las cookies son pequeños archivos de texto que un sitio web almacena en tu navegador cuando lo visitas. Sirven para que la aplicación recuerde información entre páginas y sesiones: que estás autenticado, tus preferencias de visualización o el radio de búsqueda que usaste la última vez.',
          p1_before: 'Además de cookies, usamos ',
          p1_strong: 'almacenamiento local (localStorage)',
          p1_after:
            ' del navegador, que funciona de forma similar pero sin enviar datos al servidor en cada petición. En esta política, cuando decimos "cookies" nos referimos a ambas tecnologías salvo que se indique lo contrario.',
        },
      },
      types: {
        title: 'Tipos de cookies que usamos',
        footer: 'No usamos cookies de publicidad ni de rastreo entre sitios web. Nunca.',
        cards: {
          necessary: {
            name: 'Técnicas (estrictamente necesarias)',
            pill: 'Siempre activas',
            desc: 'Imprescindibles para que la aplicación funcione. Incluyen la cookie de sesión autenticada, el token CSRF y las preferencias mínimas de interfaz. Sin ellas la plataforma no puede operar. No requieren tu consentimiento previo según la LSSI.',
          },
          analytics: {
            name: 'Analíticas',
            pill: 'Opcionales',
            desc: 'Nos ayudan a entender cómo se usa la plataforma de forma agregada y anónima: páginas más visitadas, errores encontrados, tiempos de sesión. Nunca identifican a personas concretas. Solo se activan con tu consentimiento.',
          },
          marketing: {
            name: 'Marketing',
            pill: 'Opcionales',
            desc: 'Categoría disponible en el panel de preferencias para futuras funciones promocionales. En la versión actual no instalamos cookies de marketing ni píxeles de terceros.',
          },
          preferences: {
            name: 'Preferencias',
            pill: 'Opcionales',
            desc: 'Recuerdan ajustes que tú has elegido explícitamente: radio de búsqueda, orden de visualización de objetos, estado de filtros. Mejoran la experiencia sin ser necesarias para el funcionamiento básico.',
          },
        },
      },
      table: {
        title: 'Tabla de cookies',
        intro: 'Estas son las cookies concretas que puede instalar la plataforma en su versión actual.',
        headers: ['Nombre', 'Tipo', 'Finalidad', 'Duración'],
        rows: [
          ['rgl_session', 'Técnica', 'Mantiene la sesión autenticada del usuario', 'Sesión'],
          ['rgl_csrf', 'Técnica', 'Token de protección contra peticiones falsificadas (CSRF)', 'Sesión'],
          [
            'rgl_cookie_consent_snapshot',
            'Técnica (localStorage)',
            'Guarda el snapshot de preferencias de cookies para no mostrar el banner en cada visita',
            '12 meses',
          ],
          ['rgl_prefs', 'Preferencias', 'Recuerda ajustes de interfaz (radio de búsqueda, orden de listado)', '6 meses'],
          ['_rgl_analytics', 'Analítica', 'Identificador anónimo para medir el uso agregado de la plataforma', '12 meses'],
        ],
        footer:
          'Esta tabla se actualiza cada vez que modificamos las cookies utilizadas. La fecha en el encabezado de esta página refleja siempre la versión más reciente.',
      },
      consent: {
        title: 'Consentimiento y banner',
        intro:
          'La primera vez que accedes a la plataforma verás un banner de cookies. Solo instalamos cookies opcionales si las aceptas expresamente. Las técnicas se instalan siempre porque son imprescindibles para que la sesión funcione.',
        preview_label: 'Vista previa',
        preview_suffix: '— Así se ve el banner en la plataforma',
        banner_lead: 'Usamos cookies.',
        banner_body:
          ' Solo las estrictamente necesarias para que la plataforma funcione, más algunas opcionales que mejoran tu experiencia. Puedes elegir qué aceptas.',
        banner_accept: 'Aceptar todas',
        banner_basic: 'Solo las necesarias',
        banner_config: 'Configurar',
        footer_before: 'Si pulsas ',
        footer_strong: 'Configurar',
        footer_mid:
          ', puedes activar o desactivar cada categoría opcional de forma individual antes de confirmar. Tu elección se guarda durante 12 meses en ',
        footer_cookie: 'rgl_cookie_consent_snapshot',
        footer_after: ' (localStorage).',
      },
      manage: {
        title: 'Gestionar tus preferencias',
        intro_before: 'Puedes revisar y cambiar tus preferencias en cualquier momento desde la sección ',
        intro_strong: 'Privacidad',
        intro_after: ' de tu perfil. Las categorías opcionales están desactivadas por defecto.',
        toggles: {
          necessary: {
            name: 'Cookies técnicas',
            desc: 'Necesarias para el funcionamiento de la plataforma. No se pueden desactivar.',
            aria: 'Siempre activas',
          },
          analytics: {
            name: 'Cookies analíticas',
            desc: 'Medición anónima y agregada del uso de la plataforma.',
            aria: 'Desactivadas por defecto',
          },
          marketing: {
            name: 'Cookies de marketing',
            desc: 'Medición de campañas y contenido promocional cuando exista. En el MVP no hay cookies de marketing activas.',
            aria: 'Desactivadas por defecto',
          },
          preferences: {
            name: 'Cookies de preferencias',
            desc: 'Recuerdan tus ajustes de búsqueda y visualización entre sesiones.',
            aria: 'Desactivadas por defecto',
          },
        },
        browser_title: 'Desde el navegador',
        browser_intro:
          'También puedes eliminar o bloquear cookies directamente desde la configuración de tu navegador. Ten en cuenta que bloquear todas las cookies puede impedir que la sesión funcione correctamente.',
        browser_table: {
          headers: ['Navegador', 'Dónde encontrar la configuración de cookies'],
          rows: [
            ['Chrome', 'Configuración → Privacidad y seguridad → Cookies y otros datos de sitios'],
            ['Firefox', 'Preferencias → Privacidad y seguridad → Cookies y datos del sitio'],
            ['Safari', 'Preferencias → Privacidad → Gestionar datos del sitio web'],
            ['Edge', 'Configuración → Privacidad, búsqueda y servicios → Cookies y permisos del sitio'],
          ],
        },
      },
      third_party: {
        title: 'Cookies de terceros',
        paragraphs: {
          p0_before: 'En la versión actual de la plataforma ',
          p0_strong: 'no integramos servicios de terceros que instalen sus propias cookies',
          p0_after: '. No hay Google Analytics, Meta Pixel ni herramientas de publicidad.',
          p1: 'Las fuentes tipográficas se cargan desde Google Fonts en modo de privacidad mejorada y no instalan cookies rastreables en tu navegador. Si en el futuro añadimos integraciones de terceros con cookies propias, actualizaremos esta política y solicitaremos de nuevo tu consentimiento si fuera necesario.',
        },
      },
      changes: {
        title: 'Cambios en esta política',
        paragraphs: [
          'Si modificamos las cookies que usamos o la forma en que gestionamos el consentimiento, actualizaremos esta página y la fecha de "última actualización" del encabezado. Si los cambios son relevantes para cookies opcionales que ya habías aceptado, te lo notificaremos por email con al menos 15 días de antelación y mostraremos de nuevo el banner de consentimiento.',
        ],
      },
      contact: {
        title: 'Contacto',
        intro: 'Si tienes dudas sobre el uso de cookies en esta plataforma, escríbenos:',
        rows: {
          email_label: 'Email de privacidad',
          email_value: 'privacidad@regalalo.org',
          related_label: 'Política relacionada',
          related_link: 'Ver política de privacidad →',
        },
      },
    },
  },
};

const esPath = path.join(root, 'public/i18n/es.json');
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
es.legal = legal;
fs.writeFileSync(esPath, `${JSON.stringify(es, null, 2)}\n`);
console.log('Patched legal i18n in', esPath);
