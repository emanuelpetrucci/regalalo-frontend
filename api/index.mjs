/**
 * Punto de entrada serverless de Vercel para Angular SSR.
 * Enruta todas las peticiones al handler generado por @angular/ssr.
 */
const { reqHandler } = await import('../dist/regalalo/server/server.mjs');

export default reqHandler;
