export interface LegalTocItem {
  anchor: string;
  labelKey: string;
}

export interface LegalSectionItem {
  id: string;
  num: string;
  titleKey: string;
}

export const PRIVACY_TOC: LegalTocItem[] = [
  { anchor: 'responsable', labelKey: 'legal.privacy.toc.controller' },
  { anchor: 'datos', labelKey: 'legal.privacy.toc.data' },
  { anchor: 'finalidad', labelKey: 'legal.privacy.toc.purpose' },
  { anchor: 'conservacion', labelKey: 'legal.privacy.toc.retention' },
  { anchor: 'destinatarios', labelKey: 'legal.privacy.toc.recipients' },
  { anchor: 'derechos', labelKey: 'legal.privacy.toc.rights' },
  { anchor: 'menores', labelKey: 'legal.privacy.toc.minors' },
  { anchor: 'cambios', labelKey: 'legal.privacy.toc.changes' },
  { anchor: 'contacto', labelKey: 'legal.privacy.toc.contact' },
];

export const COOKIES_TOC: LegalTocItem[] = [
  { anchor: 'que-son', labelKey: 'legal.cookies.toc.what' },
  { anchor: 'tipos', labelKey: 'legal.cookies.toc.types' },
  { anchor: 'tabla', labelKey: 'legal.cookies.toc.table' },
  { anchor: 'consentimiento', labelKey: 'legal.cookies.toc.consent' },
  { anchor: 'gestion', labelKey: 'legal.cookies.toc.manage' },
  { anchor: 'terceros', labelKey: 'legal.cookies.toc.third_party' },
  { anchor: 'cambios', labelKey: 'legal.cookies.toc.changes' },
  { anchor: 'contacto', labelKey: 'legal.cookies.toc.contact' },
];

export const PRIVACY_SECTIONS: LegalSectionItem[] = [
  { id: 'responsable', num: '01', titleKey: 'legal.privacy.sections.controller.title' },
  { id: 'datos', num: '02', titleKey: 'legal.privacy.sections.data.title' },
  { id: 'finalidad', num: '03', titleKey: 'legal.privacy.sections.purpose.title' },
  { id: 'conservacion', num: '04', titleKey: 'legal.privacy.sections.retention.title' },
  { id: 'destinatarios', num: '05', titleKey: 'legal.privacy.sections.recipients.title' },
  { id: 'derechos', num: '06', titleKey: 'legal.privacy.sections.rights.title' },
  { id: 'menores', num: '07', titleKey: 'legal.privacy.sections.minors.title' },
  { id: 'cambios', num: '08', titleKey: 'legal.privacy.sections.changes.title' },
  { id: 'contacto', num: '09', titleKey: 'legal.privacy.sections.contact.title' },
];

export const COOKIES_SECTIONS: LegalSectionItem[] = [
  { id: 'que-son', num: '01', titleKey: 'legal.cookies.sections.what.title' },
  { id: 'tipos', num: '02', titleKey: 'legal.cookies.sections.types.title' },
  { id: 'tabla', num: '03', titleKey: 'legal.cookies.sections.table.title' },
  { id: 'consentimiento', num: '04', titleKey: 'legal.cookies.sections.consent.title' },
  { id: 'gestion', num: '05', titleKey: 'legal.cookies.sections.manage.title' },
  { id: 'terceros', num: '06', titleKey: 'legal.cookies.sections.third_party.title' },
  { id: 'cambios', num: '07', titleKey: 'legal.cookies.sections.changes.title' },
  { id: 'contacto', num: '08', titleKey: 'legal.cookies.sections.contact.title' },
];

export type ContactRowIcon = 'company' | 'location' | 'email' | 'clock' | 'document';

export interface ContactRowConfig {
  icon: ContactRowIcon;
  labelKey: string;
  valueKey: string;
  /** When set, valueKey is the link label and navigation uses this route. */
  routerLink?: string;
}

export const PRIVACY_CONTROLLER_ROWS: ContactRowConfig[] = [
  // TODO: Uncomment when company and address are added to the backend
  // {
  //   icon: 'company',
  //   labelKey: 'legal.privacy.sections.controller.rows.company_label',
  //   valueKey: 'legal.privacy.sections.controller.rows.company_value',
  // },
  // {
  //   icon: 'location',
  //   labelKey: 'legal.privacy.sections.controller.rows.address_label',
  //   valueKey: 'legal.privacy.sections.controller.rows.address_value',
  // },
  {
    icon: 'email',
    labelKey: 'legal.privacy.sections.controller.rows.email_label',
    valueKey: 'legal.privacy.sections.controller.rows.email_value',
  },
];

export const PRIVACY_CONTACT_ROWS: ContactRowConfig[] = [
  {
    icon: 'email',
    labelKey: 'legal.privacy.sections.contact.rows.email_label',
    valueKey: 'legal.privacy.sections.contact.rows.email_value',
  },
  {
    icon: 'clock',
    labelKey: 'legal.privacy.sections.contact.rows.response_label',
    valueKey: 'legal.privacy.sections.contact.rows.response_value',
  },
];

export const COOKIES_CONTACT_ROWS: ContactRowConfig[] = [
  {
    icon: 'email',
    labelKey: 'legal.cookies.sections.contact.rows.email_label',
    valueKey: 'legal.cookies.sections.contact.rows.email_value',
  },
  {
    icon: 'document',
    labelKey: 'legal.cookies.sections.contact.rows.related_label',
    valueKey: 'legal.cookies.sections.contact.rows.related_link',
    routerLink: '/politica-privacidad',
  },
];

export type CookieCardVariant = 'necessary' | 'analytics' | 'marketing' | 'preferences';

export interface CookieCardConfig {
  variant: CookieCardVariant;
  nameKey: string;
  pillKey: string;
  pillClass: 'pill-necessary' | 'pill-optional';
  descKey: string;
}

export const COOKIE_TYPE_CARDS: CookieCardConfig[] = [
  {
    variant: 'necessary',
    nameKey: 'legal.cookies.sections.types.cards.necessary.name',
    pillKey: 'legal.cookies.sections.types.cards.necessary.pill',
    pillClass: 'pill-necessary',
    descKey: 'legal.cookies.sections.types.cards.necessary.desc',
  },
  {
    variant: 'analytics',
    nameKey: 'legal.cookies.sections.types.cards.analytics.name',
    pillKey: 'legal.cookies.sections.types.cards.analytics.pill',
    pillClass: 'pill-optional',
    descKey: 'legal.cookies.sections.types.cards.analytics.desc',
  },
  {
    variant: 'marketing',
    nameKey: 'legal.cookies.sections.types.cards.marketing.name',
    pillKey: 'legal.cookies.sections.types.cards.marketing.pill',
    pillClass: 'pill-optional',
    descKey: 'legal.cookies.sections.types.cards.marketing.desc',
  },
  {
    variant: 'preferences',
    nameKey: 'legal.cookies.sections.types.cards.preferences.name',
    pillKey: 'legal.cookies.sections.types.cards.preferences.pill',
    pillClass: 'pill-optional',
    descKey: 'legal.cookies.sections.types.cards.preferences.desc',
  },
];

export interface TogglePreviewRow {
  nameKey: string;
  descKey: string;
  state: 'on' | 'off';
  ariaLabelKey: string;
}

export const COOKIE_TOGGLE_PREVIEW: TogglePreviewRow[] = [
  {
    nameKey: 'legal.cookies.sections.manage.toggles.necessary.name',
    descKey: 'legal.cookies.sections.manage.toggles.necessary.desc',
    state: 'on',
    ariaLabelKey: 'legal.cookies.sections.manage.toggles.necessary.aria',
  },
  {
    nameKey: 'legal.cookies.sections.manage.toggles.analytics.name',
    descKey: 'legal.cookies.sections.manage.toggles.analytics.desc',
    state: 'off',
    ariaLabelKey: 'legal.cookies.sections.manage.toggles.analytics.aria',
  },
  {
    nameKey: 'legal.cookies.sections.manage.toggles.marketing.name',
    descKey: 'legal.cookies.sections.manage.toggles.marketing.desc',
    state: 'off',
    ariaLabelKey: 'legal.cookies.sections.manage.toggles.marketing.aria',
  },
  {
    nameKey: 'legal.cookies.sections.manage.toggles.preferences.name',
    descKey: 'legal.cookies.sections.manage.toggles.preferences.desc',
    state: 'off',
    ariaLabelKey: 'legal.cookies.sections.manage.toggles.preferences.aria',
  },
];
