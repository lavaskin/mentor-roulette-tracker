import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JobSelectOptions } from '@app/data/select-options.data';
import { SelectOptionModel } from '@app/models/select-option.model';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AutocompleteSelectionBase } from '../shared/autocomplete-selection-base';

@Component({
	selector: 'mrt-jobs-autocomplete',
	imports: [FormsModule, AutoCompleteModule],
	templateUrl: './jobs-autocomplete.html',
	styleUrl: './jobs-autocomplete.scss',
})
export class JobsAutocomplete extends AutocompleteSelectionBase<SelectOptionModel> {

	@Input()
	public set selectedJobId(value: number | undefined) {
		this.setSelectedId(value, (id) => this.jobOptions.find((job) => job.value === id));
	}

	public get selectedJobId(): number | undefined {
		return this.getSelectedId();
	}

	@Input()
	public set selectedJobLabel(value: string | undefined) {
		this.setSelectedLabel(value, (id) => this.jobOptions.find((job) => job.value === id));
	}

	public get selectedJobLabel(): string | undefined {
		return this.getSelectedLabel();
	}

	@Output() selectedJobIdChange: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();

	public jobOptions = JobSelectOptions;
	public filteredOptions: SelectOptionModel[] = [];

	public onModelChange(value?: SelectOptionModel): void {
		this.selectedJobIdChange.emit(this.handleModelChange(value));
	}

	public filterJobs(event: any): void {
		const query = event.query.toLowerCase();
		this.filteredOptions = JobSelectOptions.filter(
			(job) => job.label?.toLowerCase().includes(query)
		);
	}
}
