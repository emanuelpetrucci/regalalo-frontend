import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import {
  buildContactChannel,
  CONTACT_CHANNEL_TYPES,
  parseContactChannel,
  type ContactChannelType,
} from '../../../features/items/select-receiver-channel.util';
import { UsersService } from '../../../core/api/generated/services/users.service';

@Component({
  selector: 'app-contact-channel-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, ReactiveFormsModule],
  templateUrl: './contact-channel-field.component.html',
  styleUrl: './contact-channel-field.component.scss',
})
export class ContactChannelFieldComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersApi = inject(UsersService);

  readonly channelTypes = CONTACT_CHANNEL_TYPES;

  readonly disabled = input(false);
  readonly inputId = input('contact-channel-value');
  readonly showLabel = input(true);
  /** `donor` = Mis objetos (píldora rellena). `explore` = paso contacto Explorar v3. */
  readonly appearance = input<'donor' | 'explore'>('explore');

  private readonly profileEmail = signal<string | null>(null);
  private readonly profilePhone = signal<string | null>(null);
  readonly channelValueTouched = signal(false);

  readonly form = this.fb.nonNullable.group({
    channelType: this.fb.nonNullable.control<ContactChannelType>('whatsapp'),
    channelValue: this.fb.nonNullable.control('', [Validators.required]),
  });

  private readonly channelTypeValue = toSignal(
    this.form.controls.channelType.valueChanges,
    { initialValue: this.form.controls.channelType.value },
  );

  private readonly channelRawValue = toSignal(
    this.form.controls.channelValue.valueChanges,
    { initialValue: this.form.controls.channelValue.value },
  );

  readonly channelValueInvalid = computed(() => !this.channelRawValue().trim());

  readonly showChannelError = computed(
    () => this.channelValueTouched() && this.channelValueInvalid(),
  );

  readonly channelPrefix = computed(() =>
    buildContactChannel(this.channelTypeValue(), '').replace(/\s*$/, ''),
  );

  constructor() {
    void this.loadDonorProfile();
  }

  channelTypeLabelKey(type: ContactChannelType): string {
    return `items.my_objects.select_channel_type_${type}`;
  }

  channelPlaceholderKey(type: ContactChannelType): string {
    return `items.my_objects.select_channel_placeholder_${type}`;
  }

  setChannelType(type: ContactChannelType): void {
    if (this.disabled()) {
      return;
    }
    this.form.controls.channelType.setValue(type);
    this.channelValueTouched.set(false);
    this.form.controls.channelValue.setValue('');
    this.applyDefaultChannelValue(type);
  }

  onChannelValueInput(): void {
    if (this.channelValueTouched()) {
      return;
    }
    this.channelValueTouched.set(true);
  }

  markTouched(): void {
    this.channelValueTouched.set(true);
  }

  reset(): void {
    this.channelValueTouched.set(false);
    this.form.controls.channelType.setValue('whatsapp');
    this.form.controls.channelValue.setValue('');
    void this.loadDonorProfile();
  }

  loadFromChannel(channel: string): void {
    const parsed = parseContactChannel(channel);
    this.channelValueTouched.set(false);
    this.form.controls.channelType.setValue(parsed.type);
    this.form.controls.channelValue.setValue(parsed.value);
  }

  buildChannel(): string | null {
    this.markTouched();
    const value = this.form.controls.channelValue.value.trim();
    if (!value) {
      return null;
    }
    return buildContactChannel(this.form.controls.channelType.value, value);
  }

  private async loadDonorProfile(): Promise<void> {
    try {
      const profile = await this.usersApi.usersMeGet();
      this.profileEmail.set(profile.email?.trim() || null);
      this.profilePhone.set(profile.phone?.trim() || null);
      this.applyDefaultChannelValue(this.form.controls.channelType.value);
    } catch {
      // Sin perfil no se precarga; el usuario puede escribir el canal manualmente.
    }
  }

  private applyDefaultChannelValue(type: ContactChannelType): void {
    if (this.channelValueTouched()) {
      return;
    }
    const current = this.form.controls.channelValue.value.trim();
    if (current) {
      return;
    }
    const value =
      type === 'email'
        ? this.profileEmail()
        : type === 'phone' || type === 'whatsapp'
          ? this.profilePhone()
          : null;
    if (value) {
      this.form.controls.channelValue.setValue(value);
    }
  }
}
