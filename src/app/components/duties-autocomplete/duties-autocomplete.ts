import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DutiesService } from '@app/services/duties.service';
import { ListResultItemModel } from '@app/models/list-result-item.model';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { EditDutyModal } from "../edit-duty-modal/edit-duty-modal";
import { DutyModel } from '@app/models/entity/duty.model';

@Component({
	selector: 'mrt-duties-autocomplete',
	imports: [
		FormsModule,
		AutoCompleteModule,
		ButtonModule,
		EditDutyModal,
	],
	templateUrl: './duties-autocomplete.html',
	styleUrl: './duties-autocomplete.scss',
	providers: [DutiesService]
})
export class DutiesAutocomplete {
	private _dutiesService: DutiesService = inject(DutiesService);

	@Input() selectedDutyId?: number;
	@Output() selectedDutyIdChange: EventEmitter<number> = new EventEmitter<number>();

	public filteredOptions = signal<ListResultItemModel[]>([]);

	public isEditModalVisible: boolean = false;
	public newDuty: DutyModel | null = null;

	public onModelChange(value?: number): void {
		this.selectedDutyIdChange.emit(value);
	}

	public filterDuties(event: any): void {
		this.filteredOptions.set([]);

		this._dutiesService.getResultItems({
			query: event.query,
			pageSize: 10,
		}).subscribe({
			next: (results) => {
				this.filteredOptions.set(results);
			},
		});
	}

	public openNewDutyModal(): void {
		this.newDuty = {
			name: '',
		};
		this.isEditModalVisible = true;
	}
}
