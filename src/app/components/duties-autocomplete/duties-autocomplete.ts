import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DutiesService } from '@app/services/duties.service';
import { ListResultItemModel } from '@app/models/list-result-item.model';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { AutocompleteSelectionBase } from '../shared/autocomplete-selection-base';

@Component({
	selector: 'mrt-duties-autocomplete',
	imports: [
		FormsModule,
		RouterModule,
		AutoCompleteModule,
		ButtonModule,
	],
	templateUrl: './duties-autocomplete.html',
	styleUrl: './duties-autocomplete.scss',
	providers: [DutiesService]
})
export class DutiesAutocomplete extends AutocompleteSelectionBase<ListResultItemModel> {
	private _dutiesService: DutiesService = inject(DutiesService);

	@Input()
	public set selectedDutyId(value: number | undefined) {
		this.setSelectedId(value);
	}

	public get selectedDutyId(): number | undefined {
		return this.getSelectedId();
	}

	@Input()
	public set selectedDutyLabel(value: string | undefined) {
		this.setSelectedLabel(value);
	}

	public get selectedDutyLabel(): string | undefined {
		return this.getSelectedLabel();
	}

	@Output() selectedDutyIdChange: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();

	public filteredOptions = signal<ListResultItemModel[]>([]);

	public onModelChange(value?: ListResultItemModel): void {
		this.selectedDutyIdChange.emit(this.handleModelChange(value));
	}

	public filterDuties(event: any): void {
		this._dutiesService.getResultItems({
			query: event.query || '',
			pageSize: 10,
		}).subscribe({
			next: (results) => {
				this.filteredOptions.set(results);
			},
		});
	}
}
