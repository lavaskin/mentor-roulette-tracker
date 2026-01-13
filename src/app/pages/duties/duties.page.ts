import { Component, inject } from '@angular/core';
import { DutiesService } from '@app/services/duties.service';

@Component({
	selector: 'mrt-page-duties',
	imports: [],
	templateUrl: './duties.page.html',
	styleUrl: './duties.page.scss',
	providers: [DutiesService],
})
export class DutiesPage {
	private _dutiesService: DutiesService = inject(DutiesService);

	constructor() {
		this._dutiesService.getDuties().subscribe(duties => {
			console.log(duties);
		});
	}
}
