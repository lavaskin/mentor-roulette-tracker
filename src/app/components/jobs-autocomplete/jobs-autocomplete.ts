import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JobSelectOptions } from '@app/data/select-options.data';
import { SelectOptionModel } from '@app/models/select-option.model';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
	selector: 'mrt-jobs-autocomplete',
	imports: [FormsModule, AutoCompleteModule],
	templateUrl: './jobs-autocomplete.html',
	styleUrl: './jobs-autocomplete.scss',
})
export class JobsAutocomplete {
	@Input() selectedJobId?: number;
	@Output() selectedJobIdChange: EventEmitter<number> = new EventEmitter<number>();

	public jobOptions = JobSelectOptions;
	public filteredOptions: SelectOptionModel[] = [];

	public onModelChange(value?: number): void {
		this.selectedJobIdChange.emit(value);
	}

	public filterJobs(event: any): void {
		const query = event.query.toLowerCase();
		this.filteredOptions = JobSelectOptions.filter(
			(job) => job.label?.toLowerCase().includes(query)
		);
	}
}
