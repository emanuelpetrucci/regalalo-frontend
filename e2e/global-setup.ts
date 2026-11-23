import type { FullConfig } from '@playwright/test';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000/api';
const E2E_SECRET =
  process.env['E2E_SECRET'] ?? 'local-e2e-secret-min-32-characters-long';

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const isCI = !!process.env['CI'];

  const health = await fetch(`${API_URL}/health`).catch(() => null);
  if (!health?.ok) {
    const msg = `Backend not reachable at ${API_URL}/health. Start E2E backend: cd ../backend && npm run dev:e2e`;
    if (isCI) {
      console.warn(`[e2e] Skipping health check: ${msg}`);
      return;
    }
    throw new Error(msg);
  }

  const e2eHealth = await fetch(`${API_URL}/e2e/health`, {
    headers: { 'x-e2e-secret': E2E_SECRET },
  }).catch(() => null);

  if (!e2eHealth?.ok) {
    const msg = 'E2E API not available. Use APP_ENV=e2e with E2E_ENABLED=true (npm run dev:e2e).';
    if (isCI) {
      console.warn(`[e2e] Skipping E2E API check: ${msg}`);
      return;
    }
    throw new Error(msg);
  }

  console.log('[e2e] Backend + E2E API: OK');
}
