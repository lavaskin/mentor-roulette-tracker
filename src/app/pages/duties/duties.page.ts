import { Component, inject, OnInit, signal } from '@angular/core';
import { DutyModel } from '@app/models/entity/duty.model';
import { NEW_DUTY_HANDOFF_KEY, NewDutyHandoffModel, RESUME_LOG_HANDOFF_KEY, ResumeLogHandoffModel } from '@app/models/navigation-handoff.model';
import { DutiesService } from '@app/services/duties.service';
import { NavigationHandoffService } from '@app/services/navigation-handoff.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { EditDutyModal } from "@app/components/edit-duty-modal/edit-duty-modal";
import { ConfirmModal } from "@app/components/confirm-modal/confirm-modal";
import { SearchBar } from '@app/components/search-bar/search-bar';
import { ToastService } from '@app/services/toast.service';

@Component({
	selector: 'mrt-page-duties',
	imports: [
		TableModule,
		ButtonModule,
		ProgressSpinnerModule,
		EditDutyModal,
		ConfirmModal,
		SearchBar,
	],
	templateUrl: './duties.page.html',
	styleUrl: './duties.page.scss',
	providers: [DutiesService],
})
export class DutiesPage implements OnInit {
	private _data: DutiesService = inject(DutiesService);
	private _toast: ToastService = inject(ToastService);
	private _handoff: NavigationHandoffService = inject(NavigationHandoffService);

	/** Set when the user arrived here mid-way through filling in a roulette log. */
	private _pendingLog: NewDutyHandoffModel | null = null;

	public isLoading = signal(false);
	public loadErrorMessage = signal<string | null>(null);
	public duties = signal<DutyModel[]>([]);
	public cols: { field: string; header: string }[] = [];

	public isLoadingSave = signal(false);
	public showEditDutyModal = signal(false);
	public selectedDuty = signal<DutyModel | null>(null);
	public isNewDuty = signal(false);

	public isLoadingDelete = signal(false);
	public showDeleteConfirmModal = signal(false);
	public dutyToDeleteId = signal<number | null>(null);

	public searchQuery = signal<string>('');

	constructor() {
		this.cols = [
            { field: 'dutyId', header: 'ID' },
			{ field: 'name', header: 'Name' },
            { field: 'levelRequirement', header: 'Level' },
            { field: 'expansionLabel', header: 'Expansion' },
            { field: 'dutyTypeLabel', header: 'Type' },
        ];
	}

	ngOnInit(): void {
		this.reload();

		this._pendingLog = this._handoff.consume<NewDutyHandoffModel>(NEW_DUTY_HANDOFF_KEY);
		if (this._pendingLog) {
			this.openNewDutyModal(this._pendingLog.dutyName);
		}
	}

	public reload(): void {
		this.isLoading.set(true);
		this.loadErrorMessage.set(null);
		this._data.getAll().subscribe({
			next: (duties: DutyModel[]) => {
				this.duties.set(duties);
			},
			error: (error) => {
				this.loadErrorMessage.set('Duties could not be loaded. Check that the API is running, then refresh this grid.');
				this._toast.showApiError('Failed to load duties', error, 'Unable to load duties.');
			},
		}).add(() => this.isLoading.set(false));
	}

	public openNewDutyModal(name: string = ''): void {
		this.selectedDuty.set({
			name,
		});

		this.isNewDuty.set(true);
		this.showEditDutyModal.set(true);
	}

	public onEditDutyVisibleChange(visible: boolean): void {
		this.showEditDutyModal.set(visible);

		// Backing out abandons the roulette log the user came from. Forgetting it here also stops a
		// later, unrelated duty from bouncing the user into a stale log.
		if (!visible) {
			this._pendingLog = null;
		}
	}

	public openEditDutyModal(duty: DutyModel): void {
		this.selectedDuty.set({ ...duty });
		this.isNewDuty.set(false);
		this.showEditDutyModal.set(true);
	}

	public onDutySaved(duty: DutyModel): void {
		if (this.isLoadingSave()) return;
		this.isLoadingSave.set(true);

		let httpObserver;
		if (this.isNewDuty()) {
			httpObserver = this._data.create(duty);
		} else {
			httpObserver = this._data.update(duty);
		}

		const wasNewDuty = this.isNewDuty();

		httpObserver.subscribe({
			next: (savedDuty: DutyModel) => {
				this.showEditDutyModal.set(false);

				if (wasNewDuty && this._pendingLog) {
					this.returnToPendingLogWithDuty(savedDuty, duty);
					return;
				}

				this.reload();
			},
			error: (error) => {
				this._toast.showApiError(
					wasNewDuty ? 'Failed to create duty' : 'Failed to update duty',
					error,
					'Unable to save the duty.'
				);
			},
		}).add(() => this.isLoadingSave.set(false));
	}

	/** Goes back to the roulette log the user came from, with the duty they just created selected. */
	private returnToPendingLogWithDuty(savedDuty: DutyModel, submittedDuty: DutyModel): void {
		const pending = this._pendingLog;
		if (!pending) return;

		// Claim the handoff up front so closing the modal can't race us into an empty return.
		this._pendingLog = null;

		if (savedDuty?.dutyId != null) {
			this.resumeLog(pending, { ...submittedDuty, ...savedDuty });
			return;
		}

		// Not every API returns the created entity, so fall back to locating it by name.
		this._data.getAll().subscribe({
			next: (duties: DutyModel[]) => {
				this.resumeLog(pending, duties.find(existing => existing.name === submittedDuty.name));
			},
			error: () => this.resumeLog(pending),
		});
	}

	private resumeLog(pending: NewDutyHandoffModel, duty?: DutyModel): void {
		const log = duty?.dutyId != null
			? { ...pending.log, dutyId: duty.dutyId, dutyModel: duty }
			: pending.log;

		this._handoff.navigateWith<ResumeLogHandoffModel>(['/roulettes'], RESUME_LOG_HANDOFF_KEY, {
			log,
			isNewLog: pending.isNewLog,
		});
	}

	public openDeleteConfirmModal(dutyId: number | null): void {
		this.dutyToDeleteId.set(dutyId);
		this.showDeleteConfirmModal.set(true);
	}

	public deleteDuty(dutyId: number | null | undefined): void {
		if (!dutyId || this.isLoadingDelete()) return;

		this.isLoadingDelete.set(true);

		this._data.delete(dutyId).subscribe({
			next: () => {
				this.showDeleteConfirmModal.set(false);
				this.dutyToDeleteId.set(null);
				this.reload();
			},
			error: (error) => {
				this._toast.showApiError('Failed to delete duty', error, 'Unable to delete the duty.');
			},
		}).add(() => this.isLoadingDelete.set(false));
	}

	public get filteredDuties(): DutyModel[] {
		const query = this.searchQuery().toLowerCase();
		return this.duties().filter(duty =>
			duty.name?.toLowerCase().includes(query) ||
			duty.expansionLabel?.toLowerCase().includes(query) ||
			duty.dutyTypeLabel?.toLowerCase().includes(query) ||
			(duty.levelRequirement !== null && duty.levelRequirement !== undefined && duty.levelRequirement.toString().includes(query))
		);
	}
}
