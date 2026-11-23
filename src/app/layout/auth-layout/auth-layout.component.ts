import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TranslocoModule, LanguageSelectorComponent],
  template: `
    <div class="split-grid auth-layout" *transloco="let t">
      <aside class="brand-col" aria-label="Marca Regálalo">
        <div class="brand-col__watermark" aria-hidden="true">rgl</div>
        <div class="brand-col__content">
          <p class="brand-col__title">Regálalo</p>
          <div class="brand-col__divider"></div>
          <p class="brand-col__tagline">{{ t('auth.layout.tagline') }}</p>
          <p class="brand-col__copy">{{ t('auth.layout.copy') }}</p>
        </div>
        <footer class="brand-col__footer">{{ t('auth.layout.footer') }}</footer>
      </aside>

      <section class="form-panel" aria-label="Acceso">
        <div class="form-panel__lang">
          <app-language-selector />
        </div>
        <div class="form-panel__inner">
          <div class="form-panel__card">
            <router-outlet />
          </div>
          <p class="form-panel__note">{{ t('auth.layout.note') }}</p>
        </div>
      </section>
    </div>
  `,
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {}
