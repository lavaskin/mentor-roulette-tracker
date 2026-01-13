import { Component, inject, OnInit, signal } from '@angular/core';
import { DutyModel } from '@app/models/duty.model';
import { DutiesService } from '@app/services/duties.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
	selector: 'mrt-page-duties',
	imports: [TableModule, ButtonModule, ProgressSpinnerModule],
	templateUrl: './duties.page.html',
	styleUrl: './duties.page.scss',
	providers: [DutiesService],
})
export class DutiesPage implements OnInit {
	private _dutiesService: DutiesService = inject(DutiesService);

	public isLoading = signal(false);
	public duties = signal<DutyModel[]>([]);
	public cols: { field: string; header: string }[] = [];

	constructor() {
		this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'levelRequirement', header: 'Level' },
            { field: 'expansionLabel', header: 'Expansion' },
            { field: 'dutyTypeLabel', header: 'Type' },
        ];
	}

	ngOnInit(): void {
		this.reload();
	}

	public reload(): void {
		this.isLoading.set(true);
		this._dutiesService.getDuties().subscribe({
			next: (duties: DutyModel[]) => {
				this.duties.set(duties);
			},
		}).add(() => this.isLoading.set(false));
	}
}
