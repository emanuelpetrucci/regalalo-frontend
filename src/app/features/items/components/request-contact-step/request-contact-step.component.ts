import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ContactChannelFieldComponent } from '../../../../shared/components/contact-channel-field/contact-channel-field.component';
import { BtnComponent } from '../../../../shared/components/btn/btn.component';

@Component({
  selector: 'app-request-contact-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, ContactChannelFieldComponent, BtnComponent],
  templateUrl: './request-contact-step.component.html',
  styleUrl: './request-contact-step.component.scss',
})
export class RequestContactStepComponent {
  readonly submitting = input(false);
  readonly remainingSlots = input<number | null>(null);
  readonly initialChannel = input<string | null>(null);

  readonly confirmed = output<string>();
  readonly back = output<void>();

  private readonly channelField = viewChild(ContactChannelFieldComponent);

  constructor() {
    effect(() => {
      const initial = this.initialChannel();
      const field = this.channelField();
      if (initial && field) {
        field.loadFromChannel(initial);
      }
    });
  }

  onBack(): void {
    if (this.submitting()) {
      return;
    }
    this.back.emit();
  }

  onSubmit(): void {
    if (this.submitting()) {
      return;
    }
    const channel = this.channelField()?.buildChannel();
    if (!channel) {
      return;
    }
    this.confirmed.emit(channel);
  }
}
