import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'not-found-page' },
  imports: [RouterLink],
  template: `
    <main class="not-found-page__main" role="main">
      <h1 class="text-h1">Página no encontrada</h1>
      <p class="not-found-page__text">La ruta que buscas no existe.</p>
      <a routerLink="/" class="not-found-page__link">Volver al inicio</a>
    </main>
  `,
  styles: `
    .not-found-page__main {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: var(--space-8) clamp(16px, 4vw, 40px);
      text-align: center;
    }

    .not-found-page__text {
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--fg-secondary);
      margin: var(--space-3) 0 var(--space-5);
    }

    .not-found-page__link {
      color: var(--brand-primary);
      font-weight: var(--weight-medium);
    }
  `,
})
export class NotFoundComponent {}
