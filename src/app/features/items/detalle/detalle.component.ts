import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { map } from 'rxjs';
import { ItemDetailPanelComponent } from '../../../shared/components/item-detail-panel/item-detail-panel.component';

@Component({
  selector: 'app-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoModule, ItemDetailPanelComponent],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss',
})
export class DetalleComponent {
  private readonly route = inject(ActivatedRoute);

  readonly itemSlug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );
}
