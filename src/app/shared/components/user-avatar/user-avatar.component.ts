import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { initialsFromName } from '../../../core/utils/user-display.util';
import { initialsFromUserId } from '../../../core/utils/user-initials.util';

export type UserAvatarSize = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<UserAvatarSize, number> = {
  sm: 34,
  md: 36,
  lg: 40,
};

/** Resuelve texto de iniciales con la misma regla que el componente (sin rama imagen). */
export function resolveAvatarInitials(options: {
  firstName?: string;
  lastName?: string;
  userId?: string;
}): string {
  const fromName = initialsFromName(options.firstName ?? '', options.lastName ?? '');
  if (fromName) {
    return fromName;
  }
  if (options.userId) {
    return initialsFromUserId(options.userId);
  }
  return '';
}

@Component({
  selector: 'app-user-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  template: `
    @if (showImage()) {
      <img
        class="user-avatar__img"
        [ngSrc]="avatarUrl()!"
        [width]="pixelSize()"
        [height]="pixelSize()"
        [alt]="effectiveAriaLabel()"
        loading="lazy"
      />
    } @else {
      <span class="user-avatar__initials" aria-hidden="true">{{ displayInitials() }}</span>
    }
  `,
  styleUrl: './user-avatar.component.scss',
  host: {
    class: 'user-avatar',
    '[class.user-avatar--sm]': 'size() === "sm"',
    '[class.user-avatar--md]': 'size() === "md"',
    '[class.user-avatar--lg]': 'size() === "lg"',
    '[attr.role]': 'isAccessibleAvatar() ? "img" : null',
    '[attr.aria-label]': 'isAccessibleAvatar() ? effectiveAriaLabel() : null',
    '[attr.aria-hidden]': '!isAccessibleAvatar() ? "true" : null',
  },
})
export class UserAvatarComponent {
  private readonly transloco = inject(TranslocoService);

  private readonly defaultAvatarLabel = toSignal(
    this.transloco.selectTranslate('common.user_avatar.default_label'),
    { initialValue: this.transloco.translate('common.user_avatar.default_label') },
  );

  readonly avatarUrl = input<string | null>(null);
  readonly firstName = input<string | undefined>();
  readonly lastName = input<string | undefined>();
  readonly userId = input<string | undefined>();
  readonly size = input<UserAvatarSize>('md');
  readonly ariaLabel = input<string | undefined>();
  /** When true, hides the avatar from assistive tech (parent provides label). */
  readonly decorative = input(false);

  readonly pixelSize = computed(() => SIZE_PX[this.size()]);

  readonly showImage = computed(() => {
    const url = this.avatarUrl();
    return url != null && url.trim() !== '';
  });

  readonly displayInitials = computed(() =>
    resolveAvatarInitials({
      firstName: this.firstName(),
      lastName: this.lastName(),
      userId: this.userId(),
    }),
  );

  /** Exposes role/label only when the avatar has image or initials and is not decorative. */
  readonly isAccessibleAvatar = computed(() => {
    if (this.decorative()) {
      return false;
    }
    return this.showImage() || this.displayInitials().length > 0;
  });

  readonly effectiveAriaLabel = computed(() => {
    const override = this.ariaLabel();
    if (override) {
      return override;
    }
    const initials = this.displayInitials();
    if (initials) {
      return initials;
    }
    return this.defaultAvatarLabel();
  });
}
