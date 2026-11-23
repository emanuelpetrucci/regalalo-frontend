import { inject, Injectable, DOCUMENT } from '@angular/core';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

export class RecaptchaConfigError extends Error {
  override readonly name = 'RecaptchaConfigError';
}

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  private readonly recaptchaV3 = inject(ReCaptchaV3Service, { optional: true });
  private readonly document = inject(DOCUMENT);

  async execute(action: string): Promise<string> {
    if (!environment.recaptchaSiteKey) {
      return 'dev-mock-recaptcha-token';
    }
    if (!this.recaptchaV3) {
      throw new RecaptchaConfigError('reCAPTCHA no está configurado');
    }
    return firstValueFrom(this.recaptchaV3.execute(action).pipe(timeout(15000)));
  }

  removeFromDom(): void {
    const doc = this.document;
    doc.querySelector('.grecaptcha-badge')?.remove();
    doc.querySelectorAll('script[src*="recaptcha"]').forEach((el) => el.remove());
    doc.querySelectorAll('script[src*="gstatic.com/recaptcha"]').forEach((el) => el.remove());
    doc.querySelectorAll('iframe[src*="recaptcha"]').forEach((el) => el.parentElement?.remove());
  }
}
