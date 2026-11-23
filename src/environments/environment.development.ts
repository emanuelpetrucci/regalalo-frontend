/**
 * Sin site key: el frontend envía `dev-mock-recaptcha-token` y el backend lo acepta en dev.
 * Las claves de prueba universales de Google (6LeIxAcT…) son solo para reCAPTCHA v2, no v3.
 * Para probar v3 real en local: crea un par v3 en la consola de Google y añade `localhost`.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  recaptchaSiteKey: '6LehTP8sAAAAAKFX8lwnxrwg8A71ua8egLPN3NEU',
  siteUrl: 'https://regalalo.org',
  googleAnalyticsId: 'G-58JC8N8SBE',
  ogImagePath: '/og-image.png',
};
