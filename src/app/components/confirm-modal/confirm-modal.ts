import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
	selector: 'mrt-confirm-modal',
	imports: [DialogModule, ButtonModule],
	templateUrl: './confirm-modal.html',
	styleUrl: './confirm-modal.scss',
})
export class ConfirmModal {
	@Input() visible: boolean = false;
	@Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input() isLoading: boolean = false;
	@Output() confirm: EventEmitter<boolean> = new EventEmitter<boolean>();
}
