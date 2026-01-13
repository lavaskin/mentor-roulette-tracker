import { Component, inject } from '@angular/core';
import { DutiesService } from '@app/services/duties.service';
import { SelectModule } from 'primeng/select';

@Component({
	selector: 'mrt-duties-select',
	imports: [SelectModule],
	templateUrl: './duties-select.html',
	styleUrl: './duties-select.scss',
	providers: [DutiesService]
})
export class DutiesSelect {
	private _dutiesService: DutiesService = inject(DutiesService);
}
