import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyCookiesRealityCopyCa,
  applyCookiesRealityCopyEn,
  applySpanishCorrections,
  buildLegalCa,
  buildLegalEn,
  normalizeLegalArraysForTransloco,
} from './legal-i18n/translate-locales.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const i18nDir = path.join(root, 'public/i18n');

const CMP_COPY = {
  es: {
    banner: {
      description:
        'Usamos almacenamiento local necesario para el funcionamiento. Si lo aceptas, Google Analytics puede usar cookies de terceros. En registro y acceso puede usarse reCAPTCHA de Google.',
    },
    preferences: {
      necessary: {
        description:
          'Almacenamiento local imprescindible (sesión, idioma, elección de cookies). reCAPTCHA de Google en formularios de acceso.',
      },
      analytics: {
        description:
          'Google Analytics 4 (Google). Cookies de terceros para uso agregado. Solo se carga si aceptas esta categoría.',
      },
      marketing: {
        description:
          'En la versión actual no instalamos cookies de marketing ni píxeles publicitarios.',
      },
      preferencesCategory: {
        description:
          'En la versión actual no hay cookies ni almacenamiento opcional adicional bajo esta categoría.',
      },
    },
  },
  ca: {
    banner: {
      description:
        'Fem servir emmagatzematge local necessari per al funcionament. Si ho acceptes, Google Analytics pot fer servir cookies de tercers. En registre i accés es pot fer servir reCAPTCHA de Google.',
    },
    preferences: {
      necessary: {
        description:
          'Emmagatzematge local imprescindible (sessió, idioma, elecció de cookies). reCAPTCHA de Google als formularis d\'accés.',
      },
      analytics: {
        description:
          'Google Analytics 4 (Google). Cookies de tercers per a ús agregat. Només es carrega si acceptes aquesta categoria.',
      },
      marketing: {
        description:
          'En la versió actual no instal·lem cookies de màrqueting ni píxels publicitaris.',
      },
      preferencesCategory: {
        description:
          'En la versió actual no hi ha cookies ni emmagatzematge opcional addicional en aquesta categoria.',
      },
    },
  },
  en: {
    banner: {
      description:
        'We use necessary local storage for the platform to work. If you accept, Google Analytics may use third-party cookies. Sign-up and login may use Google reCAPTCHA.',
    },
    preferences: {
      necessary: {
        description:
          'Essential local storage (session, language, consent choice). Google reCAPTCHA on access forms.',
      },
      analytics: {
        description:
          'Google Analytics 4 (Google). Third-party cookies for aggregate use. Loads only if you accept this category.',
      },
      marketing: {
        description:
          'In the current version we do not install marketing cookies or ad pixels.',
      },
      preferencesCategory: {
        description:
          'In the current version there are no additional optional cookies or storage under this category.',
      },
    },
  },
};

function patchLocale(fileName, legal) {
  const filePath = path.join(i18nDir, fileName);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.legal = legal;
  alignCookiesCmpCopy(fileName, data);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  console.log('Patched legal i18n in', filePath);
}

function alignCookiesCmpCopy(fileName, data) {
  const locale = fileName.replace('.json', '');
  const copy = CMP_COPY[locale];
  if (!copy || !data.cookies) {
    return;
  }

  data.cookies.banner.description = copy.banner.description;

  const sections = data.cookies.preferences?.sections;
  if (!sections) {
    return;
  }

  sections.necessary.description = copy.preferences.necessary.description;
  sections.analytics.description = copy.preferences.analytics.description;
  sections.marketing.description = copy.preferences.marketing.description;
  sections.preferences.description = copy.preferences.preferencesCategory.description;
}

const esPath = path.join(i18nDir, 'es.json');
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
const legalEsRaw = applySpanishCorrections(es.legal);
const legalEs = normalizeLegalArraysForTransloco(legalEsRaw);
const legalCaRaw = buildLegalCa(legalEsRaw);
applyCookiesRealityCopyCa(legalCaRaw.cookies);
const legalCa = normalizeLegalArraysForTransloco(legalCaRaw);
const legalEnRaw = buildLegalEn(legalEsRaw);
applyCookiesRealityCopyEn(legalEnRaw.cookies);
const legalEn = normalizeLegalArraysForTransloco(legalEnRaw);

patchLocale('es.json', legalEs);
patchLocale('ca.json', legalCa);
patchLocale('en.json', legalEn);
