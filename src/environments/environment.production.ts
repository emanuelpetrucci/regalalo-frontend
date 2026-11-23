/**
 * Sin site key: el frontend envía `dev-mock-recaptcha-token` y el backend lo acepta en dev.
 * Las claves de prueba universales de Google (6LeIxAcT…) son solo para reCAPTCHA v2, no v3.
 * Para probar v3 real en local: crea un par v3 en la consola de Google y añade `localhost`.
 */
export const environment = {
  production: true,
  apiUrl: '/bff',
  recaptchaSiteKey: '6LckRP8sAAAAAGiUFUHVTb93myR6kXsLIlGstpiJ',
  siteUrl: 'https://regalalo.org',
  googleAnalyticsId: 'G-58JC8N8SBE',
  ogImagePath: '/og-image.png',
};
