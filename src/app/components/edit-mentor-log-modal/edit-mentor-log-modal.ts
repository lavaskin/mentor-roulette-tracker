import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DutyModel } from '@app/models/duty.model';
import { MentorRouletteLogModel } from '@app/models/mentor-roulette-log.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
	selector: 'mrt-edit-mentor-log-modal',
	imports: [
		FormsModule,
		DialogModule,
		InputTextModule,
		ButtonModule,
		SelectModule,
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
	@Output() save: EventEmitter<DutyModel> = new EventEmitter<DutyModel>();

	// ...

	public onSave(): void {
		if (this.log) {
			this.save.emit(this.log);
		}
	}
}
