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
	private _selectedJobId?: number;
	private _selectedJobLabel?: string;

	@Input()
	public set selectedJobId(value: number | undefined) {
		this._selectedJobId = value;
		this.syncSelectedJob();
	}

	public get selectedJobId(): number | undefined {
		return this._selectedJobId;
	}

	@Input()
	public set selectedJobLabel(value: string | undefined) {
		this._selectedJobLabel = value;
		this.syncSelectedJob();
	}

	public get selectedJobLabel(): string | undefined {
		return this._selectedJobLabel;
	}

	@Output() selectedJobIdChange: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();

	public jobOptions = JobSelectOptions;
	public filteredOptions: SelectOptionModel[] = [];
	public selectedJob?: SelectOptionModel;

	public onModelChange(value?: SelectOptionModel): void {
		this.selectedJob = value;
		this._selectedJobId = value?.value;
		this._selectedJobLabel = value?.label;
		this.selectedJobIdChange.emit(value?.value);
	}

	public filterJobs(event: any): void {
		const query = event.query.toLowerCase();
		this.filteredOptions = JobSelectOptions.filter(
			(job) => job.label?.toLowerCase().includes(query)
		);
	}

	private syncSelectedJob(): void {
		if (this._selectedJobId == null) {
			this.selectedJob = undefined;
			return;
		}

		this.selectedJob = this.jobOptions.find((job) => job.value === this._selectedJobId) ?? {
			value: this._selectedJobId,
			label: this._selectedJobLabel ?? '',
		};
	}
}
