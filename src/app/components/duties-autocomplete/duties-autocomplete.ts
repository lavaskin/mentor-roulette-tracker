import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DutiesService } from '@app/services/duties.service';
import { ListResultItemModel } from '@app/models/list-result-item.model';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
	selector: 'mrt-duties-autocomplete',
	imports: [FormsModule, AutoCompleteModule],
	templateUrl: './duties-autocomplete.html',
	styleUrl: './duties-autocomplete.scss',
	providers: [DutiesService]
})
export class DutiesAutocomplete {
	private _dutiesService: DutiesService = inject(DutiesService);

	@Input() ngModel?: number;
	@Output() ngModelChange: EventEmitter<number> = new EventEmitter<number>();

	public filteredOptions: ListResultItemModel[] = [];

	public onModelChange(value?: number): void {
		this.ngModelChange.emit(value);
	}

	public filterDuties(event: any): void {
		this.filteredOptions = [];

		this._dutiesService.getResultItems({
			query: event.query,
			pageSize: 10,
		}).subscribe({
			next: (results) => {
				this.filteredOptions = results;
			},
		});
	}
}
