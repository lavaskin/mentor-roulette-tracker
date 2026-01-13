import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MentorRouletteLogModel } from '@app/models/entity/mentor-roulette-log.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { JobSelectOptions } from '@app/data/select-options.data';
import { JobsAutocomplete } from '../jobs-autocomplete/jobs-autocomplete';
import { DutiesAutocomplete } from '../duties-autocomplete/duties-autocomplete';

@Component({
	selector: 'mrt-edit-mentor-log-modal',
	imports: [
		DialogModule,
		InputTextModule,
		ButtonModule,
		SelectModule,
		DutiesAutocomplete,
		JobsAutocomplete,
	],
	templateUrl: './edit-mentor-log-modal.html',
	styleUrl: './edit-mentor-log-modal.scss',
})
export class EditMentorLogModal {
	@Input() log: MentorRouletteLogModel | null = null;
	@Input() isNew: boolean = false;
	@Input() visible: boolean = false;
	@Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input() isLoading: boolean = false;
	@Output() save: EventEmitter<MentorRouletteLogModel> = new EventEmitter<MentorRouletteLogModel>();

	public jobOptions = JobSelectOptions;

	public onSave(): void {1
		if (this.log) {
			this.save.emit(this.log);
		}
	}
}
