import { Component, inject, signal } from '@angular/core';
import { ConfirmModal } from '@app/components/confirm-modal/confirm-modal';
import { EditMentorLogModal } from '@app/components/edit-mentor-log-modal/edit-mentor-log-modal';
import { JobsAutocomplete } from '@app/components/jobs-autocomplete/jobs-autocomplete';
import { MentorRouletteLogModel } from '@app/models/entity/mentor-roulette-log.model';
import { MentorRouletteLogService } from '@app/services/mentor-roulette-log.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
	selector: 'mrt-page-roulettes',
	imports: [
		ConfirmModal,
		TableModule,
		ButtonModule,
		EditMentorLogModal,
	],
	templateUrl: './roulettes.page.html',
	styleUrl: './roulettes.page.scss',
	providers: [MentorRouletteLogService],
})
export class RoulettesPage {
	private _data: MentorRouletteLogService = inject(MentorRouletteLogService);

	public isLoading = signal(false);
	public logs = signal<MentorRouletteLogModel[]>([]);
	public cols: { field: string; header: string }[] = [];

	public isLoadingSave = signal(false);
	public showEditModal = signal(false);
	public selectedLog = signal<MentorRouletteLogModel | null>(null);
	public isNewLog = signal(false);

	public isLoadingDelete = signal(false);
	public showDeleteConfirmModal = signal(false);
	public toDeleteId = signal<number | null>(null);

	constructor() {
		this.cols = [
            { field: 'sortOrder', header: 'Sort Order' },
            { field: 'duty.name', header: 'Duty Name' },
			{ field: 'playedJobLabel', header: 'Job' },
            { field: 'notes', header: 'Notes' },
        ];
	}

	ngOnInit(): void {
		this.reload();
	}

	public reload(): void {
		this.isLoading.set(true);
		this._data.getAll().subscribe({
			next: (logs: MentorRouletteLogModel[]) => {
				this.logs.set(logs);
			},
		}).add(() => this.isLoading.set(false));
	}

	public openCreateModal(): void {
		this.selectedLog.set({});

		this.isNewLog.set(true);
		this.showEditModal.set(true);
	}

	public openEditModal(log: MentorRouletteLogModel): void {
		this.selectedLog.set({ ...log });
		this.isNewLog.set(false);
		this.showEditModal.set(true);
	}

	public onLogSaved(log: MentorRouletteLogModel): void {
		if (this.isLoadingSave()) return;

		this.showEditModal.set(false);
		this.isLoadingSave.set(true);

		let httpObserver;
		if (this.isNewLog()) {
			httpObserver = this._data.create(log);
		} else {
			httpObserver = this._data.update(log);
		}

		httpObserver.subscribe({
			next: () => {
				this.reload();
			},
		}).add(() => this.isLoadingSave.set(false));
	}

	public openDeleteConfirmModal(logId: number | null): void {
		this.toDeleteId.set(logId);
		this.showDeleteConfirmModal.set(true);
	}

	public deleteLog(logId: number | null | undefined): void {
		if (!logId || this.isLoadingDelete()) return;

		this._data.delete(logId).subscribe({
			next: () => {
				this.reload();
			},
		}).add(() => this.isLoadingDelete.set(false));
	}
}
