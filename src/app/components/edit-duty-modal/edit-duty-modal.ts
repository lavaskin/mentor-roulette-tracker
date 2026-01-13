import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DutiesSelectOptions, ExpansionsSelectOptions } from '@app/data/select-options.data';
import { DutyModel } from '@app/models/entity/duty.model';
import { SelectOptionModel } from '@app/models/select-option.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
	selector: 'mrt-edit-duty-modal',
	imports: [
		FormsModule,
		DialogModule,
		InputTextModule,
		ButtonModule,
		SelectModule,
	],
	templateUrl: './edit-duty-modal.html',
	styleUrl: './edit-duty-modal.scss',
})
export class EditDutyModal {
	@Input() duty: DutyModel | null = null;
	@Input() isNew: boolean = false;
	@Input() visible: boolean = false;
	@Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input() isLoading: boolean = false;
	@Output() save: EventEmitter<DutyModel> = new EventEmitter<DutyModel>();

	public expansions = ExpansionsSelectOptions;
	public dutyTypes = DutiesSelectOptions;

	public onSave(): void {
		if (this.duty) {
			this.save.emit(this.duty);
		}
	}
}
