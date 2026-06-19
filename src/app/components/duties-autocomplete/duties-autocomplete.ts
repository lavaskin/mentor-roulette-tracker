import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DutiesService } from '@app/services/duties.service';
import { ListResultItemModel } from '@app/models/list-result-item.model';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

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
export class DutiesAutocomplete {
	private _dutiesService: DutiesService = inject(DutiesService);
	private _selectedDutyId?: number;
	private _selectedDutyLabel?: string;

	@Input()
	public set selectedDutyId(value: number | undefined) {
		this._selectedDutyId = value;
		this.syncSelectedDuty();
	}

	public get selectedDutyId(): number | undefined {
		return this._selectedDutyId;
	}

	@Input()
	public set selectedDutyLabel(value: string | undefined) {
		this._selectedDutyLabel = value;
		this.syncSelectedDuty();
	}

	public get selectedDutyLabel(): string | undefined {
		return this._selectedDutyLabel;
	}

	@Output() selectedDutyIdChange: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();

	public filteredOptions = signal<ListResultItemModel[]>([]);
	public selectedDuty?: ListResultItemModel;

	public onModelChange(value?: ListResultItemModel): void {
		this.selectedDuty = value;
		this._selectedDutyId = value?.value;
		this._selectedDutyLabel = value?.label;
		this.selectedDutyIdChange.emit(value?.value);
	}

	private syncSelectedDuty(): void {
		if (this._selectedDutyId == null) {
			this.selectedDuty = undefined;
			return;
		}

		this.selectedDuty = {
			value: this._selectedDutyId,
			label: this._selectedDutyLabel ?? this.selectedDuty?.label,
		};
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
