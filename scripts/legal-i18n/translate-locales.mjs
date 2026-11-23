/** Builds full legal.* trees for ca/en from the Spanish source tree. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readPolicyVersion() {
  const configPath = path.join(__dirname, '../../src/app/core/config/cookie-consent.config.ts');
  const source = fs.readFileSync(configPath, 'utf8');
  const match = source.match(/COOKIE_CONSENT_POLICY_VERSION = '([^']+)'/);
  if (!match) {
    throw new Error('COOKIE_CONSENT_POLICY_VERSION not found in cookie-consent.config.ts');
  }
  return match[1];
}

const POLICY_VERSION = readPolicyVersion();

function clone(value) {
  return structuredClone(value);
}

function translateCommonEsToCa(common) {
  return {
    ...common,
    eyebrow: 'Documentació legal',
    contents: 'Contingut',
    policy_version: common.policy_version,
    policy_version_label: 'Versió de la política de cookies:',
    meta: {
      updated_label: 'Darrera actualització:',
      updated_date: '28 de maig de 2026',
      effective_label: 'Vigent des del',
      effective_date: '28 de maig de 2026',
    },
    footer: {
      description:
        'Redistribueix el que no necessites. Donació d\'objectes entre persones, sense diners ni bescanvi. Espanya.',
      contact_label: 'Contacte',
      copy: '© 2026 Regálalo · Tots els drets reservats',
      motto: 'Tot el que es dona, torna.',
    },
  };
}

function translateCommonEsToEn(common) {
  return {
    ...common,
    eyebrow: 'Legal documents',
    contents: 'Contents',
    policy_version: common.policy_version,
    policy_version_label: 'Cookie policy version:',
    meta: {
      updated_label: 'Last updated:',
      updated_date: '28 May 2026',
      effective_label: 'Effective from',
      effective_date: '28 May 2026',
    },
    footer: {
      description:
        'Redistribute what you no longer need. Donation of objects between people, with no money or barter. Spain.',
      contact_label: 'Contact',
      copy: '© 2026 Regálalo · All rights reserved',
      motto: 'Everything that is given, comes back.',
    },
  };
}

function translatePrivacyEsToCa(privacy) {
  return {
    title: 'Política de privacitat',
    info: {
      part1: 'Aquesta política explica quines dades personals recull ',
      brand: privacy.info.brand,
      part2: ', amb quina finalitat, durant quant de temps les conservem i quins drets tens sobre elles. Ens ajustem al ',
      rgpd: 'Reglament General de Protecció de Dades (RGPD)',
      part3:
        ' i a la Llei Orgànica 3/2018 de protecció de dades personals i garantia dels drets digitals (LOPDGDD).',
    },
    toc: {
      controller: 'Responsable del tractament',
      data: 'Dades que recollim',
      purpose: 'Finalitat i base legal',
      retention: 'Conservació de dades',
      recipients: 'Destinataris i transferències',
      rights: 'Els teus drets',
      minors: 'Menors d\'edat',
      changes: 'Canvis en aquesta política',
      contact: 'Contacte',
    },
    sections: {
      controller: {
        title: 'Responsable del tractament',
        rows: {
          company_label: 'Denominació social',
          company_value: privacy.sections.controller.rows.company_value,
          address_label: 'Domicili',
          address_value: 'Espanya (MVP — mercat espanyol)',
          email_label: 'Correu electrònic de contacte',
          email_value: privacy.sections.controller.rows.email_value,
        },
      },
      data: {
        title: 'Dades que recollim',
        intro:
          'Recollim únicament les dades necessàries perquè la plataforma funcioni. A continuació es detallen les categories de dades i el seu origen.',
        table: {
          headers: ['Categoria', 'Dades concretes', 'Origen'],
          rows: [
            ['Identificació', 'Adreça de correu electrònic', 'Proporcionada per l\'usuari en registrar-se'],
            ['Localització', 'Codi postal', 'Proporcionat per l\'usuari al perfil'],
            [
              'Activitat',
              'Objectes publicats, sol·licituds enviades, sessions d\'entrega, historial de reputació',
              'Generat per l\'ús de la plataforma',
            ],
            ['Imatges', 'Fotos d\'objectes publicats (màx. 5 per objecte)', 'Pujades per l\'usuari en publicar un objecte'],
            [
              'Canal de contacte',
              'Número de telèfon o correu extern per coordinar l\'entrega',
              'Proporcionat pel donant en seleccionar receptor',
            ],
            [
              'Tècniques',
              'Adreça IP, tipus de navegador, timestamps d\'accés',
              'Recollits automàticament en cada petició al servidor',
            ],
          ],
        },
        not_collected_title: 'Dades que no recollim',
        not_collected_body:
          'No demanem nom complet, DNI, número de telèfon en el registre, ni cap dada de categoria especial segons l\'article 9 del RGPD (salut, origen ètnic, religió, opinions polítiques, etc.).',
      },
      purpose: {
        title: 'Finalitat i base legal',
        table: {
          headers: ['Finalitat', 'Base legal (RGPD art. 6)'],
          rows: [
            ['Gestionar el teu compte i autenticació', 'Execució del contracte (art. 6.1.b)'],
            ['Mostrar objectes dins del radi geogràfic de 50 km', 'Execució del contracte (art. 6.1.b)'],
            [
              'Calcular la reputació i el lloc a la llista de candidats',
              'Execució del contracte (art. 6.1.b)',
            ],
            [
              'Enviar notificacions per correu relacionades amb els teus objectes o sol·licituds',
              'Execució del contracte (art. 6.1.b)',
            ],
            [
              'Detectar si algú només rep sense aportar a la comunitat, per ajustar la seva visibilitat a la llista',
              'Interès legítim (art. 6.1.f) — equilibri de la comunitat',
            ],
            ['Prevenció de frau i seguretat tècnica', 'Interès legítim (art. 6.1.f)'],
          ],
        },
        footer:
          'No fem servir les teves dades per a publicitat, perfils comercials, ni les cedim a tercers amb finalitats de màrqueting.',
      },
      retention: {
        title: 'Conservació de dades',
        intro:
          'Conservem les teves dades el temps mínim necessari per complir la finalitat per a la qual van ser recollides.',
        table: {
          headers: ['Dada', 'Termini de conservació'],
          rows: [
            [
              'Compte i dades de perfil',
              'Mentre el compte estigui actiu. Després de la baixa: 30 dies per poder reactivar-lo, i eliminació definitiva transcorregut aquest termini',
            ],
            [
              'Imatges d\'objectes completats o cancel·lats',
              '30 dies des del canvi d\'estat; després s\'eliminen automàticament',
            ],
            [
              'Canal de contacte de la sessió d\'entrega',
              'Es purga (sobrescrit amb NULL) als 7 dies d\'assolir estat completada, cancel·lada o expirada',
            ],
            ['Registres tècnics (IP, timestamps)', '90 dies'],
            ['Historial de reputació', 'Associat al compte actiu; s\'elimina amb el compte'],
          ],
        },
      },
      recipients: {
        title: 'Destinataris i transferències',
        intro:
          'No venem les teves dades ni les compartim amb tercers amb finalitats comercials. Només les podem compartir amb proveïdors de serveis que actuen com encarregats del tractament i amb qui mantenim els contractes d\'encàrrec exigits pel RGPD.',
        table: {
          headers: ['Proveïdor', 'Servei', 'Ubicació'],
          rows: [
            ['Proveïdor d\'infraestructura cloud', 'Allotjament de l\'aplicació i base de dades', 'Unió Europea'],
            [
              'Proveïdor d\'enviament de correus transaccionals',
              'Notificacions de la plataforma',
              'Unió Europea o amb garanties equivalents',
            ],
          ],
        },
        footer:
          'No realitzem transferències internacionals de dades fora de l\'Espai Econòmic Europeu sense les garanties adequades previstes al RGPD (arts. 44 a 49).',
      },
      rights: {
        title: 'Els teus drets',
        intro_before:
          'Com a titular de les dades, pots exercir els drets següents en qualsevol moment escrivint-nos a ',
        intro_email: privacy.sections.rights.intro_email,
        intro_after: '. Respondrem en el termini màxim d\'un mes.',
        cards: [
          { tag: 'Art. 15', label: 'Accés', desc: 'Saber quines dades teves tractem i obtenir-hi una còpia.' },
          { tag: 'Art. 16', label: 'Rectificació', desc: 'Corregir dades inexactes o incompletes.' },
          { tag: 'Art. 17', label: 'Supressió', desc: 'Sol·licitar que eliminem les teves dades («dret a l\'oblit»).' },
          {
            tag: 'Art. 18',
            label: 'Limitació',
            desc: 'Demanar que suspendrem el tractament mentre revisem una reclamació.',
          },
          { tag: 'Art. 20', label: 'Portabilitat', desc: 'Rebre les teves dades en format estructurat i llegible per màquina.' },
          { tag: 'Art. 21', label: 'Oposició', desc: 'Oposar-te al tractament basat en interès legítim.' },
        ],
        aepd_before:
          'Si consideres que el tractament de les teves dades no és correcte, pots presentar una reclamació davant l\'',
        aepd_link: 'Agència Espanyola de Protecció de Dades (AEPD)',
        aepd_after: ' a www.aepd.es.',
      },
      minors: {
        title: 'Menors d\'edat',
        paragraphs: [
          'La plataforma està dirigida a persones majors de 18 anys. No recollim conscientment dades de menors. Si detectem que un usuari és menor de 18 anys, eliminarem el seu compte i dades associades.',
          'Si ets pare, mare o tutor i creus que un menor ha creat un compte, escriu-nos a privacidad@regalalo.org.',
        ],
      },
      changes: {
        title: 'Canvis en aquesta política',
        paragraphs: [
          'Podem actualitzar aquesta política quan sigui necessari per canvis normatius o de producte. Si els canvis són rellevants, t\'ho notificarem per correu amb almenys 15 dies d\'antelació. La data de «darrera actualització» a la capçalera reflecteix sempre la versió vigent.',
          'L\'ús continuat de la plataforma després de l\'entrada en vigor dels canvis implica la seva acceptació.',
        ],
      },
      contact: {
        title: 'Contacte',
        intro: 'Per a qualsevol consulta sobre aquesta política o per exercir els teus drets, contacta amb nosaltres:',
        rows: {
          email_label: 'Correu de privacitat',
          email_value: privacy.sections.contact.rows.email_value,
          response_label: 'Termini de resposta',
          response_value: 'Màxim 30 dies des de la recepció de la teva sol·licitud',
        },
      },
    },
  };
}

function translatePrivacyEsToEn(privacy) {
  return {
    title: 'Privacy policy',
    info: {
      part1: 'This policy explains what personal data ',
      brand: privacy.info.brand,
      part2: ' collects, for what purpose, how long we keep it, and what rights you have. We comply with the ',
      rgpd: 'General Data Protection Regulation (GDPR)',
      part3: ' and applicable Spanish data protection law (LOPDGDD).',
    },
    toc: {
      controller: 'Data controller',
      data: 'Data we collect',
      purpose: 'Purpose and legal basis',
      retention: 'Data retention',
      recipients: 'Recipients and transfers',
      rights: 'Your rights',
      minors: 'Minors',
      changes: 'Changes to this policy',
      contact: 'Contact',
    },
    sections: {
      controller: {
        title: 'Data controller',
        rows: {
          company_label: 'Legal name',
          company_value: privacy.sections.controller.rows.company_value,
          address_label: 'Address',
          address_value: 'Spain (MVP — Spanish market)',
          email_label: 'Contact email',
          email_value: privacy.sections.controller.rows.email_value,
        },
      },
      data: {
        title: 'Data we collect',
        intro:
          'We collect only the data needed for the platform to work. Below are the categories of data and their source.',
        table: {
          headers: ['Category', 'Specific data', 'Source'],
          rows: [
            ['Identification', 'Email address', 'Provided by the user at registration'],
            ['Location', 'Postal code', 'Provided by the user in their profile'],
            [
              'Activity',
              'Published items, requests sent, delivery sessions, reputation history',
              'Generated through use of the platform',
            ],
            ['Images', 'Photos of published items (max. 5 per item)', 'Uploaded by the user when publishing'],
            [
              'Contact channel',
              'Phone number or external email to coordinate delivery',
              'Provided by the donor when selecting a recipient',
            ],
            [
              'Technical',
              'IP address, browser type, access timestamps',
              'Collected automatically on each server request',
            ],
          ],
        },
        not_collected_title: 'Data we do not collect',
        not_collected_body:
          'We do not ask for full name, national ID, phone number at registration, or any special category data under GDPR Article 9 (health, ethnic origin, religion, political opinions, etc.).',
      },
      purpose: {
        title: 'Purpose and legal basis',
        table: {
          headers: ['Purpose', 'Legal basis (GDPR Art. 6)'],
          rows: [
            ['Manage your account and authentication', 'Contract performance (Art. 6.1.b)'],
            ['Show items within a 50 km geographic radius', 'Contract performance (Art. 6.1.b)'],
            [
              'Calculate reputation and placement on the candidate list',
              'Contract performance (Art. 6.1.b)',
            ],
            [
              'Send email notifications related to your items or requests',
              'Contract performance (Art. 6.1.b)',
            ],
            [
              'Detect when someone mostly receives without contributing, to adjust their visibility on the list',
              'Legitimate interest (Art. 6.1.f) — community balance',
            ],
            ['Fraud prevention and technical security', 'Legitimate interest (Art. 6.1.f)'],
          ],
        },
        footer:
          'We do not use your data for advertising, commercial profiling, or share it with third parties for marketing purposes.',
      },
      retention: {
        title: 'Data retention',
        intro: 'We keep your data for the minimum time needed to fulfil the purpose for which it was collected.',
        table: {
          headers: ['Data', 'Retention period'],
          rows: [
            [
              'Account and profile data',
              'While the account is active. After deletion request: 30 days to reactivate, then permanent deletion',
            ],
            [
              'Images of completed or cancelled items',
              '30 days from status change, then automatically deleted',
            ],
            [
              'Delivery session contact channel',
              'Purged (overwritten with NULL) 7 days after the session reaches completed, cancelled, or expired status',
            ],
            ['Technical logs (IP, timestamps)', '90 days'],
            ['Reputation history', 'Linked to the active account; deleted with the account'],
          ],
        },
      },
      recipients: {
        title: 'Recipients and transfers',
        intro:
          'We do not sell your data or share it with third parties for commercial purposes. We may share it only with service providers acting as processors under GDPR-required agreements.',
        table: {
          headers: ['Provider', 'Service', 'Location'],
          rows: [
            ['Cloud infrastructure provider', 'Application and database hosting', 'European Union'],
            [
              'Transactional email provider',
              'Platform notifications',
              'European Union or equivalent safeguards',
            ],
          ],
        },
        footer:
          'We do not transfer data internationally outside the European Economic Area without appropriate GDPR safeguards (Arts. 44–49).',
      },
      rights: {
        title: 'Your rights',
        intro_before: 'As the data subject, you may exercise the following rights at any time by writing to ',
        intro_email: privacy.sections.rights.intro_email,
        intro_after: '. We will respond within one month.',
        cards: [
          { tag: 'Art. 15', label: 'Access', desc: 'Know what data we process about you and obtain a copy.' },
          { tag: 'Art. 16', label: 'Rectification', desc: 'Correct inaccurate or incomplete data.' },
          { tag: 'Art. 17', label: 'Erasure', desc: 'Request deletion of your data ("right to be forgotten").' },
          {
            tag: 'Art. 18',
            label: 'Restriction',
            desc: 'Ask us to suspend processing while we review a claim.',
          },
          { tag: 'Art. 20', label: 'Portability', desc: 'Receive your data in a structured, machine-readable format.' },
          { tag: 'Art. 21', label: 'Objection', desc: 'Object to processing based on legitimate interest.' },
        ],
        aepd_before:
          'If you believe your data is processed incorrectly, you may file a complaint with the ',
        aepd_link: 'Spanish Data Protection Agency (AEPD)',
        aepd_after: ' at www.aepd.es.',
      },
      minors: {
        title: 'Minors',
        paragraphs: [
          'The platform is intended for people aged 18 and over. We do not knowingly collect data from minors. If we detect a user under 18, we will delete their account and associated data.',
          'If you are a parent or guardian and believe a minor created an account, write to privacidad@regalalo.org.',
        ],
      },
      changes: {
        title: 'Changes to this policy',
        paragraphs: [
          'We may update this policy when required by regulatory or product changes. For material changes, we will notify you by email at least 15 days in advance. The "last updated" date in the header always reflects the current version.',
          'Continued use of the platform after changes take effect implies acceptance.',
        ],
      },
      contact: {
        title: 'Contact',
        intro: 'For any questions about this policy or to exercise your rights, contact us:',
        rows: {
          email_label: 'Privacy email',
          email_value: privacy.sections.contact.rows.email_value,
          response_label: 'Response time',
          response_value: 'Maximum 30 days from receipt of your request',
        },
      },
    },
  };
}

function translateCookiesEsToCa(cookies) {
  return {
    title: 'Política de cookies',
    info: {
      part1: 'Aquesta política explica quines cookies i tecnologies similars fa servir ',
      brand: cookies.info.brand,
      part2: ', per a què serveixen i com pots gestionar-les. Complim la ',
      lssi: 'Llei 34/2002 de serveis de la societat de la informació (LSSI)',
      part3: ' i el RGPD.',
    },
    toc: {
      what: 'Què són les cookies',
      types: 'Tipus de cookies que fem servir',
      table: 'Taula de cookies',
      consent: 'Consentiment i banner',
      manage: 'Gestionar les teves preferències',
      third_party: 'Cookies de tercers',
      changes: 'Canvis en aquesta política',
      contact: 'Contacte',
    },
    sections: {
      what: {
        title: 'Què són les cookies',
        paragraphs: {
          p0: 'Les cookies són petits fitxers de text que un lloc web emmagatzema al teu navegador quan el visites. Serveixen perquè l\'aplicació recordi informació entre pàgines i sessions: que estàs autenticat, les teves preferències de visualització o el radi de cerca que vas fer servir l\'última vegada.',
          p1_before: 'A més de cookies, fem servir ',
          p1_strong: 'emmagatzematge local (localStorage)',
          p1_after:
            ' del navegador, que funciona de manera similar però sense enviar dades al servidor en cada petició. En aquesta política, quan diem «cookies» ens referim a ambdues tecnologies llevat que s\'indiqui el contrari.',
        },
      },
      types: {
        title: 'Tipus de cookies que fem servir',
        footer: 'No fem servir cookies de publicitat ni de rastreig entre llocs web. Mai.',
        cards: {
          necessary: {
            name: 'Tècniques (estrictament necessàries)',
            pill: 'Sempre actives',
            desc: 'Imprescindibles perquè l\'aplicació funcioni. Inclouen la cookie de sessió autenticada, el token CSRF i les preferències mínimes d\'interfície. Sense elles la plataforma no pot operar. No requereixen el teu consentiment previ segons la LSSI.',
          },
          analytics: {
            name: 'Analítiques',
            pill: 'Opcionals',
            desc: 'Ens ajuden a entendre com s\'usa la plataforma de forma agregada i anònima: pàgines més visitades, errors trobats, temps de sessió. Mai identifiquen persones concretes. Només s\'activen amb el teu consentiment.',
          },
          marketing: {
            name: 'Màrqueting',
            pill: 'Opcionals',
            desc: 'Categoria disponible al panell de preferències per a futures funcions promocionals. En la versió actual no instal·lem cookies de màrqueting ni píxels de tercers.',
          },
          preferences: {
            name: 'Preferències',
            pill: 'Opcionals',
            desc: 'Recorden ajustos que has triat explícitament: radi de cerca, ordre de visualització d\'objectes, estat de filtres. Milloren l\'experiència sense ser necessàries per al funcionament bàsic.',
          },
        },
      },
      table: {
        title: 'Taula de cookies',
        intro: 'Aquestes són les cookies concretes que pot instal·lar la plataforma en la seva versió actual.',
        headers: ['Nom', 'Tipus', 'Finalitat', 'Durada'],
        rows: [
          ['rgl_session', 'Tècnica', 'Manté la sessió autenticada de l\'usuari', 'Sessió'],
          ['rgl_csrf', 'Tècnica', 'Token de protecció contra peticions falsificades (CSRF)', 'Sessió'],
          [
            'rgl_cookie_consent_snapshot',
            'Tècnica (localStorage)',
            'Desa el snapshot de preferències de cookies per no mostrar el banner en cada visita',
            '12 mesos',
          ],
          ['rgl_prefs', 'Preferències', 'Recorda ajustos d\'interfície (radi de cerca, ordre de llistat)', '6 mesos'],
          [
            '_rgl_analytics',
            'Analítica',
            'Identificador anònim per mesurar l\'ús agregat de la plataforma',
            '12 mesos',
          ],
        ],
        footer:
          'Aquesta taula s\'actualitza cada vegada que modifiquem les cookies utilitzades. La data a la capçalera d\'aquesta pàgina reflecteix sempre la versió més recent.',
      },
      consent: {
        title: 'Consentiment i banner',
        intro:
          'La primera vegada que accedeixes a la plataforma veuràs un banner de cookies. Només instal·lem cookies opcionals si les acceptes expressament. Les tècniques s\'instal·len sempre perquè són imprescindibles perquè la sessió funcioni.',
        preview_label: 'Vista prèvia',
        preview_suffix: '— Així es veu el banner a la plataforma',
        banner_lead: 'Fem servir cookies.',
        banner_body:
          ' Només les estrictament necessàries perquè la plataforma funcioni, més algunes opcionals (analítica, màrqueting i preferències) que milloren la teva experiència. Pots triar què acceptes.',
        banner_accept: 'Acceptar totes',
        banner_basic: 'Només les necessàries',
        banner_config: 'Configurar',
        footer_before: 'Si prems ',
        footer_strong: 'Configurar',
        footer_mid:
          ', pots activar o desactivar cada categoria opcional de forma individual abans de confirmar. La teva elecció es desa durant 12 mesos a ',
        footer_cookie: 'rgl_cookie_consent_snapshot',
        footer_after: ' (localStorage).',
      },
      manage: {
        title: 'Gestionar les teves preferències',
        intro_before: 'Pots revisar i canviar les teves preferències en qualsevol moment des de la secció ',
        intro_strong: 'Privacitat',
        intro_after:
          ' del teu perfil o des del peu de pàgina legal. Les categories opcionals (analítica, màrqueting i preferències) estan desactivades per defecte.',
        toggles: {
          necessary: {
            name: 'Cookies tècniques',
            desc: 'Necessàries per al funcionament de la plataforma. No es poden desactivar.',
            aria: 'Sempre actives',
          },
          analytics: {
            name: 'Cookies analítiques',
            desc: 'Mesura anònima i agregada de l\'ús de la plataforma.',
            aria: 'Desactivades per defecte',
          },
          marketing: {
            name: 'Cookies de màrqueting',
            desc: 'Mesura de campanyes i contingut promocional quan existeixi. En el MVP no hi ha cookies de màrqueting actives.',
            aria: 'Desactivades per defecte',
          },
          preferences: {
            name: 'Cookies de preferències',
            desc: 'Recorden els teus ajustos de cerca i visualització entre sessions.',
            aria: 'Desactivades per defecte',
          },
        },
        browser_title: 'Des del navegador',
        browser_intro:
          'També pots eliminar o bloquejar cookies directament des de la configuració del teu navegador. Tingues en compte que bloquejar totes les cookies pot impedir que la sessió funcioni correctament.',
        browser_table: {
          headers: ['Navegador', 'On trobar la configuració de cookies'],
          rows: [
            ['Chrome', 'Configuració → Privadesa i seguretat → Cookies i altres dades de llocs'],
            ['Firefox', 'Preferències → Privadesa i seguretat → Cookies i dades del lloc'],
            ['Safari', 'Preferències → Privadesa → Gestionar dades del lloc web'],
            ['Edge', 'Configuració → Privadesa, cerca i serveis → Cookies i permisos del lloc'],
          ],
        },
      },
      third_party: {
        title: 'Cookies de tercers',
        paragraphs: {
          p0_before: 'En la versió actual de la plataforma ',
          p0_strong: 'no integrem serveis de tercers que instal·lin les seves pròpies cookies',
          p0_after: '. No hi ha Google Analytics, Meta Pixel ni eines de publicitat.',
          p1: 'Les fonts tipogràfiques es carreguen des de Google Fonts en mode de privadesa millorada i no instal·len cookies rastrejables al teu navegador. Si en el futur afegim integracions de tercers amb cookies pròpies, actualitzarem aquesta política i sol·licitarem de nou el teu consentiment si cal.',
        },
      },
      changes: {
        title: 'Canvis en aquesta política',
        paragraphs: [
          'Si modifiquem les cookies que fem servir o la forma en què gestionem el consentiment, actualitzarem aquesta pàgina i la data de «darrera actualització» de la capçalera. Si els canvis són rellevants per a cookies opcionals que ja havies acceptat, mostrarem de nou el banner de consentiment perquè puguis revisar la teva elecció.',
        ],
      },
      contact: {
        title: 'Contacte',
        intro: 'Si tens dubtes sobre l\'ús de cookies en aquesta plataforma, escriu-nos:',
        rows: {
          email_label: 'Correu de privacitat',
          email_value: cookies.sections.contact.rows.email_value,
          related_label: 'Política relacionada',
          related_link: 'Veure política de privacitat →',
        },
      },
    },
  };
}

function translateCookiesEsToEn(cookies) {
  return {
    title: 'Cookie policy',
    info: {
      part1: 'This policy explains what cookies and similar technologies ',
      brand: cookies.info.brand,
      part2: ' uses, what they are for, and how you can manage them. We comply with the ',
      lssi: 'Spanish Information Society Services Act (LSSI)',
      part3: ' and the GDPR.',
    },
    toc: {
      what: 'What cookies are',
      types: 'Types of cookies we use',
      table: 'Cookie table',
      consent: 'Consent and banner',
      manage: 'Manage your preferences',
      third_party: 'Third-party cookies',
      changes: 'Changes to this policy',
      contact: 'Contact',
    },
    sections: {
      what: {
        title: 'What cookies are',
        paragraphs: {
          p0: 'Cookies are small text files a website stores in your browser when you visit it. They let the application remember information between pages and sessions: that you are signed in, your display preferences, or the search radius you used last time.',
          p1_before: 'In addition to cookies, we use ',
          p1_strong: 'local storage (localStorage)',
          p1_after:
            ' in the browser, which works similarly but without sending data to the server on every request. In this policy, when we say "cookies" we mean both technologies unless stated otherwise.',
        },
      },
      types: {
        title: 'Types of cookies we use',
        footer: 'We do not use advertising or cross-site tracking cookies. Ever.',
        cards: {
          necessary: {
            name: 'Technical (strictly necessary)',
            pill: 'Always active',
            desc: 'Essential for the application to work. They include the authenticated session cookie, CSRF token, and minimum interface preferences. Without them the platform cannot operate. They do not require prior consent under LSSI.',
          },
          analytics: {
            name: 'Analytics',
            pill: 'Optional',
            desc: 'They help us understand how the platform is used in aggregate and anonymous form: most visited pages, errors found, session duration. They never identify specific individuals. They are only enabled with your consent.',
          },
          marketing: {
            name: 'Marketing',
            pill: 'Optional',
            desc: 'Category available in the preferences panel for future promotional features. In the current version we do not install marketing cookies or third-party pixels.',
          },
          preferences: {
            name: 'Preferences',
            pill: 'Optional',
            desc: 'They remember settings you explicitly chose: search radius, item display order, filter state. They improve the experience without being required for basic operation.',
          },
        },
      },
      table: {
        title: 'Cookie table',
        intro: 'These are the specific cookies the platform may install in its current version.',
        headers: ['Name', 'Type', 'Purpose', 'Duration'],
        rows: [
          ['rgl_session', 'Technical', 'Maintains the user authenticated session', 'Session'],
          ['rgl_csrf', 'Technical', 'Protection token against forged requests (CSRF)', 'Session'],
          [
            'rgl_cookie_consent_snapshot',
            'Technical (localStorage)',
            'Stores the cookie preferences snapshot so the banner is not shown on every visit',
            '12 months',
          ],
          ['rgl_prefs', 'Preferences', 'Remembers interface settings (search radius, list order)', '6 months'],
          [
            '_rgl_analytics',
            'Analytics',
            'Anonymous identifier to measure aggregate platform usage',
            '12 months',
          ],
        ],
        footer:
          'This table is updated whenever we change the cookies used. The date in the header of this page always reflects the latest version.',
      },
      consent: {
        title: 'Consent and banner',
        intro:
          'The first time you access the platform you will see a cookie banner. We only install optional cookies if you expressly accept them. Technical cookies are always installed because they are essential for the session to work.',
        preview_label: 'Preview',
        preview_suffix: '— This is how the banner looks on the platform',
        banner_lead: 'We use cookies.',
        banner_body:
          ' Only those strictly necessary for the platform to work, plus some optional ones (analytics, marketing, and preferences) that improve your experience. You can choose what to accept.',
        banner_accept: 'Accept all',
        banner_basic: 'Necessary only',
        banner_config: 'Configure',
        footer_before: 'If you click ',
        footer_strong: 'Configure',
        footer_mid:
          ', you can enable or disable each optional category individually before confirming. Your choice is stored for 12 months in ',
        footer_cookie: 'rgl_cookie_consent_snapshot',
        footer_after: ' (localStorage).',
      },
      manage: {
        title: 'Manage your preferences',
        intro_before: 'You can review and change your preferences at any time from the ',
        intro_strong: 'Privacy',
        intro_after:
          ' section in your profile or from the legal footer. Optional categories (analytics, marketing, and preferences) are disabled by default.',
        toggles: {
          necessary: {
            name: 'Technical cookies',
            desc: 'Required for the platform to work. They cannot be disabled.',
            aria: 'Always active',
          },
          analytics: {
            name: 'Analytics cookies',
            desc: 'Anonymous, aggregate measurement of platform usage.',
            aria: 'Disabled by default',
          },
          marketing: {
            name: 'Marketing cookies',
            desc: 'Campaign measurement and promotional content when applicable. In the MVP no marketing cookies are active.',
            aria: 'Disabled by default',
          },
          preferences: {
            name: 'Preference cookies',
            desc: 'Remember your search and display settings between sessions.',
            aria: 'Disabled by default',
          },
        },
        browser_title: 'From your browser',
        browser_intro:
          'You can also delete or block cookies directly from your browser settings. Note that blocking all cookies may prevent the session from working correctly.',
        browser_table: {
          headers: ['Browser', 'Where to find cookie settings'],
          rows: [
            ['Chrome', 'Settings → Privacy and security → Cookies and other site data'],
            ['Firefox', 'Preferences → Privacy & Security → Cookies and Site Data'],
            ['Safari', 'Preferences → Privacy → Manage Website Data'],
            ['Edge', 'Settings → Privacy, search, and services → Cookies and site permissions'],
          ],
        },
      },
      third_party: {
        title: 'Third-party cookies',
        paragraphs: {
          p0_before: 'In the current version of the platform ',
          p0_strong: 'we do not integrate third-party services that install their own cookies',
          p0_after: '. There is no Google Analytics, Meta Pixel, or advertising tools.',
          p1: 'Fonts are loaded from Google Fonts in enhanced privacy mode and do not install trackable cookies in your browser. If we add third-party integrations with their own cookies in the future, we will update this policy and request your consent again if required.',
        },
      },
      changes: {
        title: 'Changes to this policy',
        paragraphs: [
          'If we change the cookies we use or how we manage consent, we will update this page and the "last updated" date in the header. For material changes to optional cookies you had already accepted, we will show the consent banner again so you can review your choice.',
        ],
      },
      contact: {
        title: 'Contact',
        intro: 'If you have questions about cookie use on this platform, write to us:',
        rows: {
          email_label: 'Privacy email',
          email_value: cookies.sections.contact.rows.email_value,
          related_label: 'Related policy',
          related_link: 'View privacy policy →',
        },
      },
    },
  };
}

export function buildLegalCa(legalEs) {
  return {
    common: translateCommonEsToCa(legalEs.common),
    privacy: translatePrivacyEsToCa(legalEs.privacy),
    cookies: translateCookiesEsToCa(legalEs.cookies),
  };
}

export function buildLegalEn(legalEs) {
  return {
    common: translateCommonEsToEn(legalEs.common),
    privacy: translatePrivacyEsToEn(legalEs.privacy),
    cookies: translateCookiesEsToEn(legalEs.cookies),
  };
}

function renameLegalCookieKeys(next) {
  const cards = next.cookies.sections.types.cards;
  if (cards.preference && !cards.preferences) {
    cards.preferences = cards.preference;
    delete cards.preference;
  }

  const toggles = next.cookies.sections.manage.toggles;
  if (toggles.technical && !toggles.necessary) {
    toggles.necessary = toggles.technical;
    delete toggles.technical;
  }
}

/** Transloco cannot resolve `t('foo.0')` when `foo` is a JSON array — use indexed objects. */
export function normalizeLegalArraysForTransloco(node) {
  if (Array.isArray(node)) {
    const out = {};
    for (let index = 0; index < node.length; index++) {
      out[String(index)] = normalizeLegalArraysForTransloco(node[index]);
    }
    return out;
  }
  if (node !== null && typeof node === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      out[key] = normalizeLegalArraysForTransloco(value);
    }
    return out;
  }
  return node;
}

/** Legal + CMP copy aligned with real frontend behaviour (localStorage + third-party GA/reCAPTCHA). */
function applyCookiesRealityCopyEs(cookies) {
  cookies.info.part1 =
    'Esta política explica qué tecnologías de almacenamiento y qué servicios de terceros utiliza ';
  cookies.info.part3 =
    ' y el RGPD. En la versión actual no instalamos cookies HTTP propias (first-party); usamos almacenamiento local del navegador y, en su caso, cookies de proveedores externos.';

  const what = cookies.sections.what.paragraphs;
  what.p0 =
    'Las cookies son pequeños archivos que un sitio puede guardar en tu navegador. En Regálalo la sesión y la configuración esencial se guardan principalmente en almacenamiento local (localStorage), no mediante cookies con nombre propio.';
  what.p1_after =
    ' del navegador. Solo los servicios de terceros integrados (p. ej. Google Analytics o reCAPTCHA) pueden instalar cookies en tu dispositivo cuando corresponda.';

  const types = cookies.sections.types;
  types.footer =
    'No usamos cookies publicitarias propias ni píxeles de seguimiento entre sitios. La analítica opcional la presta Google.';
  types.cards.necessary.desc =
    'Almacenamiento local imprescindible (sesión con token, idioma, registro de tu elección de cookies). En registro e inicio de sesión se carga reCAPTCHA de Google (antifraude). No requieren consentimiento de cookies opcionales según la LSSI para lo estrictamente necesario.';
  types.cards.analytics.desc =
    'Google Analytics 4 (Google). Puede instalar cookies de terceros (_ga, _gid, etc.) para medir el uso de forma agregada. El script solo se carga si aceptas esta categoría en el banner.';
  types.cards.preferences.desc =
    'Categoría reservada en el panel de consentimiento. En la versión actual no activamos cookies ni almacenamiento opcional adicional distinto de la analítica de Google.';
  types.cards.marketing.desc =
    'Categoría disponible en el panel de preferencias para futuras funciones. En la versión actual no instalamos cookies de marketing ni píxeles publicitarios.';

  const table = cookies.sections.table;
  table.title = 'Tecnologías de almacenamiento y cookies de terceros';
  table.intro =
    'Tabla de elementos reales en la versión actual. Las claves en localStorage no son cookies HTTP; las filas de Google solo aplican cuando el servicio correspondiente está activo.';
  table.rows = [
    [
      'rgl_auth_token',
      'localStorage (propio)',
      'Mantiene la sesión iniciada (token JWT en el navegador)',
      'Hasta cerrar sesión o caducar el token',
    ],
    [
      'rgl_cookie_consent_snapshot',
      'localStorage (propio)',
      'Guarda tu elección de consentimiento y evita mostrar el banner en cada visita',
      'Hasta que borres datos del sitio',
    ],
    [
      'rgl_locale',
      'localStorage (propio)',
      'Recuerda el idioma de la interfaz',
      'Hasta que borres datos del sitio',
    ],
    [
      '_ga / _gid (Google Analytics)',
      'Cookie de terceros',
      'Medición agregada del uso del sitio',
      'Solo si aceptas analítica; según política de Google',
    ],
    [
      'reCAPTCHA (Google)',
      'Cookie/script de terceros',
      'Protección antifraude en registro e inicio de sesión',
      'Según política de Google al usar esos formularios',
    ],
  ];
  table.footer =
    'Actualizamos esta tabla cuando cambien las integraciones. La fecha del encabezado refleja la versión vigente de esta política.';

  const consent = cookies.sections.consent;
  consent.intro =
    'Al entrar verás un banner para gestionar la analítica opcional (Google Analytics). El almacenamiento local esencial y reCAPTCHA en acceso no dependen de ese banner, pero puedes revisar los detalles aquí.';
  consent.banner_lead = 'Privacidad y medición.';
  consent.banner_body =
    ' Usamos almacenamiento local necesario para que la plataforma funcione. Si lo aceptas, cargamos Google Analytics (cookies de terceros). En registro y acceso puede usarse reCAPTCHA de Google.';
  consent.footer_mid =
    ', puedes activar o desactivar la analítica antes de confirmar. Tu elección se guarda en ';

  const third = cookies.sections.third_party.paragraphs;
  third.p0_strong = 'Google Analytics (opcional, con tu consentimiento) y Google reCAPTCHA v3';
  third.p0_after =
    ' en formularios de registro y acceso. No usamos Meta Pixel ni otras redes publicitarias.';
  third.p1 =
    'Las tipografías se cargan desde Google Fonts; en modo habitual no instalan cookies de seguimiento en tu navegador. Si añadimos otros proveedores con cookies propias, actualizaremos esta política y, si procede, pediremos consentimiento.';

  const manage = cookies.sections.manage;
  manage.browser_intro =
    'Puedes borrar cookies y datos del sitio desde tu navegador. Si bloqueas todo, la sesión o reCAPTCHA pueden dejar de funcionar.';
  manage.toggles.necessary.desc =
    'Almacenamiento local de sesión, idioma y consentimiento; reCAPTCHA en acceso cuando usas esos formularios.';
  manage.toggles.analytics.desc =
    'Google Analytics 4. Cookies de terceros solo si aceptas esta categoría.';
  manage.toggles.preferences.desc =
    'Sin cookies ni almacenamiento opcional adicional en la versión actual.';
  manage.toggles.marketing.desc =
    'Sin cookies de marketing en la versión actual.';

  cookies.sections.changes.paragraphs = [
    'Si cambiamos las integraciones de terceros o el uso de almacenamiento local, actualizaremos esta página y la fecha de «última actualización». Si afecta a opciones que ya habías aceptado (p. ej. analítica), mostraremos de nuevo el banner de consentimiento.',
  ];
}

export function applyCookiesRealityCopyCa(cookies) {
  cookies.info.part1 =
    'Aquesta política explica quines tecnologies d\'emmagatzematge i quins serveis de tercers fa servir ';
  cookies.info.part3 =
    ' i el RGPD. En la versió actual no instal·lem cookies HTTP pròpies (first-party); fem servir emmagatzematge local del navegador i, si escau, cookies de proveïdors externs.';

  const what = cookies.sections.what.paragraphs;
  what.p0 =
    'Les cookies són fitxers petits que un lloc pot desar al navegador. A Regálalo la sessió i la configuració essencial es guarden principalment a localStorage, no mitjançant cookies amb nom propi.';
  what.p1_after =
    ' del navegador. Només els serveis de tercers integrats (p. ex. Google Analytics o reCAPTCHA) poden instal·lar cookies al teu dispositiu quan correspongui.';

  const types = cookies.sections.types;
  types.footer =
    'No fem servir cookies publicitàries pròpies ni píxels de seguiment entre llocs. L\'analítica opcional la presta Google.';
  types.cards.necessary.desc =
    'Emmagatzematge local imprescindible (sessió amb token, idioma, elecció de cookies). En registre i inici de sessió es carrega reCAPTCHA de Google (antifrau).';
  types.cards.analytics.desc =
    'Google Analytics 4 (Google). Pot instal·lar cookies de tercers (_ga, _gid, etc.) per mesurar l\'ús de forma agregada. El script només es carrega si acceptes aquesta categoria al banner.';
  types.cards.preferences.desc =
    'Categoria reservada al panell de consentiment. En la versió actual no activem cookies ni emmagatzematge opcional addicional distint de l\'analítica de Google.';
  types.cards.marketing.desc =
    'Categoria disponible al panell de preferències per a futures funcions. En la versió actual no instal·lem cookies de màrqueting ni píxels publicitaris.';

  const table = cookies.sections.table;
  table.title = 'Tecnologies d\'emmagatzematge i cookies de tercers';
  table.intro =
    'Taula d\'elements reals a la versió actual. Les claus a localStorage no són cookies HTTP; les files de Google només s\'apliquen quan el servei corresponent està actiu.';
  table.rows = [
    ['rgl_auth_token', 'localStorage (propi)', 'Manté la sessió iniciada (token JWT al navegador)', 'Fins a tancar sessió o caducar el token'],
    [
      'rgl_cookie_consent_snapshot',
      'localStorage (propi)',
      'Desa la teva elecció de consentiment i evita mostrar el banner a cada visita',
      'Fins que esborris dades del lloc',
    ],
    ['rgl_locale', 'localStorage (propi)', 'Recorda l\'idioma de la interfície', 'Fins que esborris dades del lloc'],
    [
      '_ga / _gid (Google Analytics)',
      'Cookie de tercers',
      'Mesura agregada de l\'ús del lloc',
      'Només si acceptes analítica; segons política de Google',
    ],
    [
      'reCAPTCHA (Google)',
      'Cookie/script de tercers',
      'Protecció antifrau en registre i inici de sessió',
      'Segons política de Google en usar aquests formularis',
    ],
  ];

  const consent = cookies.sections.consent;
  consent.intro =
    'En entrar veuràs un banner per gestionar l\'analítica opcional (Google Analytics). L\'emmagatzematge local essencial i reCAPTCHA a l\'accés no depenen d\'aquest banner.';
  consent.banner_lead = 'Privacitat i mesura.';
  consent.banner_body =
    ' Fem servir emmagatzematge local necessari perquè la plataforma funcioni. Si ho acceptes, carreguem Google Analytics (cookies de tercers). En registre i accés es pot fer servir reCAPTCHA de Google.';
  consent.footer_mid =
    ', pots activar o desactivar l\'analítica abans de confirmar. La teva elecció es desa a ';

  const third = cookies.sections.third_party.paragraphs;
  third.p0_strong = 'Google Analytics (opcional, amb el teu consentiment) i Google reCAPTCHA v3';
  third.p0_after = ' als formularis de registre i accés. No fem servir Meta Pixel ni altres xarxes publicitàries.';
  third.p1 =
    'Les tipografies es carreguen des de Google Fonts; en mode habitual no instal·len cookies de seguiment. Si afegim altres proveïdors amb cookies pròpies, actualitzarem aquesta política.';

  cookies.sections.changes.paragraphs = [
    'Si canviem les integracions de tercers o l\'ús d\'emmagatzematge local, actualitzarem aquesta pàgina. Si afecta opcions que ja havies acceptat, tornarem a mostrar el banner de consentiment.',
  ];
}

export function applyCookiesRealityCopyEn(cookies) {
  cookies.info.part3 =
    ' and the GDPR. In the current version we do not set first-party HTTP cookies; we use browser local storage and, where applicable, third-party provider cookies.';

  const what = cookies.sections.what.paragraphs;
  what.p0 =
    'Cookies are small files a site may store in your browser. On Regálalo, session and essential settings are stored mainly in localStorage, not via our own named cookies.';
  what.p1_after =
    ' in the browser. Only integrated third-party services (e.g. Google Analytics or reCAPTCHA) may set cookies on your device when applicable.';

  const types = cookies.sections.types;
  types.footer =
    'We do not use our own advertising cookies or cross-site tracking pixels. Optional analytics is provided by Google.';
  types.cards.necessary.desc =
    'Essential local storage (session token, language, cookie consent choice). Google reCAPTCHA loads on sign-up and login (fraud prevention).';
  types.cards.analytics.desc =
    'Google Analytics 4 (Google). May set third-party cookies (_ga, _gid, etc.) for aggregate usage measurement. The script loads only if you accept this category in the banner.';
  types.cards.preferences.desc =
    'Reserved category in the consent panel. In the current version we do not enable additional optional cookies or storage beyond Google analytics.';
  types.cards.marketing.desc =
    'Category available in the preferences panel for future features. In the current version we do not install marketing cookies or ad pixels.';

  const table = cookies.sections.table;
  table.title = 'Storage technologies and third-party cookies';
  table.intro =
    'Real elements in the current version. localStorage keys are not HTTP cookies; Google rows apply only when the corresponding service is active.';
  table.rows = [
    ['rgl_auth_token', 'localStorage (first-party)', 'Keeps you signed in (JWT in the browser)', 'Until sign-out or token expiry'],
    [
      'rgl_cookie_consent_snapshot',
      'localStorage (first-party)',
      'Stores your consent choice and avoids showing the banner every visit',
      'Until you clear site data',
    ],
    ['rgl_locale', 'localStorage (first-party)', 'Remembers interface language', 'Until you clear site data'],
    [
      '_ga / _gid (Google Analytics)',
      'Third-party cookie',
      'Aggregate site usage measurement',
      'Only if you accept analytics; per Google policy',
    ],
    [
      'reCAPTCHA (Google)',
      'Third-party cookie/script',
      'Fraud prevention on sign-up and login',
      'Per Google policy when you use those forms',
    ],
  ];

  const consent = cookies.sections.consent;
  consent.intro =
    'On first visit you will see a banner to manage optional analytics (Google Analytics). Essential local storage and reCAPTCHA on access do not depend on that banner.';
  consent.banner_lead = 'Privacy and measurement.';
  consent.banner_body =
    ' We use necessary local storage for the platform to work. If you accept, we load Google Analytics (third-party cookies). Sign-up and login may use Google reCAPTCHA.';
  consent.footer_mid =
    ', you can enable or disable analytics before confirming. Your choice is stored in ';

  const third = cookies.sections.third_party.paragraphs;
  third.p0_strong = 'Google Analytics (optional, with your consent) and Google reCAPTCHA v3';
  third.p0_after = ' on sign-up and login forms. We do not use Meta Pixel or other ad networks.';
  third.p1 =
    'Fonts are loaded from Google Fonts; they typically do not set tracking cookies. If we add other providers with their own cookies, we will update this policy.';

  cookies.sections.changes.paragraphs = [
    'If we change third-party integrations or local storage use, we will update this page. If it affects options you already accepted, we will show the consent banner again.',
  ];
}

export function applySpanishCorrections(legal) {
  const next = clone(legal);
  renameLegalCookieKeys(next);

  next.common.policy_version = POLICY_VERSION;
  next.common.policy_version_label = 'Versión de política de cookies:';
  next.common.meta.updated_date = '28 de mayo de 2026';
  next.common.meta.effective_date = '28 de mayo de 2026';

  applyCookiesRealityCopyEs(next.cookies);

  return next;
}
