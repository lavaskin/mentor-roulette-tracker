import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ConfirmModal } from '@app/components/confirm-modal/confirm-modal';
import { EditMentorLogModal } from '@app/components/edit-mentor-log-modal/edit-mentor-log-modal';
import { GridFilter } from '@app/components/grid-filter/grid-filter';
import { SearchBar } from '@app/components/search-bar/search-bar';
import { MentorRouletteLogModel } from '@app/models/entity/mentor-roulette-log.model';
import { NEW_DUTY_HANDOFF_KEY, NewDutyHandoffModel, RESUME_LOG_HANDOFF_KEY, ResumeLogHandoffModel } from '@app/models/navigation-handoff.model';
import { MentorRouletteLogService } from '@app/services/mentor-roulette-log.service';
import { NavigationHandoffService } from '@app/services/navigation-handoff.service';
import { ToastService } from '@app/services/toast.service';
import { GridFilterState, loadFilterState, saveFilterState, toFilterParams } from '@app/shared/grid-filter';
import { GridColumn, ServerGrid } from '@app/shared/server-grid';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ROULETTE_FILTERS, ROULETTE_FILTERS_STORAGE_KEY } from './roulettes.filters';

@Component({
	selector: 'mrt-page-roulettes',
	imports: [
		DatePipe,
		ConfirmModal,
		TableModule,
		ButtonModule,
		EditMentorLogModal,
		SearchBar,
		GridFilter,
	],
	templateUrl: './roulettes.page.html',
	styleUrl: './roulettes.page.scss',
	providers: [MentorRouletteLogService],
})
export class RoulettesPage {
	private _data: MentorRouletteLogService = inject(MentorRouletteLogService);
	private _toast: ToastService = inject(ToastService);
	private _handoff: NavigationHandoffService = inject(NavigationHandoffService);

	/** Loads its first page when the table initializes, so ngOnInit doesn't need to. */
	public grid = new ServerGrid<MentorRouletteLogModel>(
		(request) => this._data.getPage(request),
		(error) => this._toast.showApiError('Failed to load roulette logs', error, 'Unable to load roulette logs.'),
	);

	public filterDefinitions = ROULETTE_FILTERS;

	/** Restored from this tab's session, and saved again on every apply */
	public appliedFilters = signal<GridFilterState>(loadFilterState(ROULETTE_FILTERS_STORAGE_KEY, ROULETTE_FILTERS));

	/** Enum columns (job, duty type) sort in game order on the API, not alphabetically by label. */
	public cols: GridColumn[] = [
		{ field: 'sortOrder', header: 'Number', sortField: 'sortOrder' },
		{ field: 'playedJobLabel', header: 'Job', sortField: 'playedJob' },
		{ field: 'dutyModel.name', header: 'Duty Name', sortField: 'dutyName' },
		{ field: 'dutyModel.dutyTypeLabel', header: 'Duty Type', sortField: 'dutyType' },
		{ field: 'completed', header: 'Completed', sortField: 'completed' },
		{ field: 'replacement', header: 'Replacement', sortField: 'replacement' },
		{ field: 'notes', header: 'Notes', sortField: 'notes' },
		{ field: 'datePlayed', header: 'Date Ran', sortField: 'datePlayed' },
	];

	public isLoadingSave = signal(false);
	public showEditModal = signal(false);
	public selectedLog = signal<MentorRouletteLogModel | null>(null);
	public isNewLog = signal(false);

	public isLoadingDelete = signal(false);
	public showDeleteConfirmModal = signal(false);
	public toDeleteId = signal<number | null>(null);

	constructor() {
		// Before the table initializes, so its first load already includes the restored filters
		this.grid.setFilters(toFilterParams(ROULETTE_FILTERS, this.appliedFilters()));
	}

	ngOnInit(): void {
		this.resumeLogInProgress();
	}

	public onFiltersApplied(filters: GridFilterState): void {
		this.appliedFilters.set(filters);
		saveFilterState(ROULETTE_FILTERS_STORAGE_KEY, filters);
		this.grid.setFilters(toFilterParams(ROULETTE_FILTERS, filters));
	}

	/** Reopens the log modal if the user was bounced to the duties page to create a duty. */
	private resumeLogInProgress(): void {
		const handoff = this._handoff.consume<ResumeLogHandoffModel>(RESUME_LOG_HANDOFF_KEY);
		if (!handoff) return;

		this.selectedLog.set(handoff.log);
		this.isNewLog.set(handoff.isNewLog);
		this.showEditModal.set(true);
	}

	/** Parks the in-progress log and sends the user to the duties page to create the missing duty. */
	public onAddNewDuty(dutyName: string): void {
		const log = this.selectedLog();
		if (!log) return;

		this.showEditModal.set(false);

		this._handoff.navigateWith<NewDutyHandoffModel>(['/duties'], NEW_DUTY_HANDOFF_KEY, {
			dutyName,
			log,
			isNewLog: this.isNewLog(),
		});
	}

	public openCreateModal(): void {
		this.selectedLog.set({
			completed: true,
			replacement: false,
		});

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
		this.isLoadingSave.set(true);

		let httpObserver;
		if (this.isNewLog()) {
			httpObserver = this._data.create(log);
		} else {
			httpObserver = this._data.update(log);
		}

		httpObserver.subscribe({
			next: () => {
				this.showEditModal.set(false);
				this.grid.reload();
			},
			error: (error) => {
				this._toast.showApiError(
					this.isNewLog() ? 'Failed to create roulette log' : 'Failed to update roulette log',
					error,
					'Unable to save the roulette log.'
				);
			},
		}).add(() => this.isLoadingSave.set(false));
	}

	public openDeleteConfirmModal(logId: number | null): void {
		this.toDeleteId.set(logId);
		this.showDeleteConfirmModal.set(true);
	}

	public deleteLog(logId: number | null | undefined): void {
		if (!logId || this.isLoadingDelete()) return;

		this.isLoadingDelete.set(true);

		this._data.delete(logId).subscribe({
			next: () => {
				this.showDeleteConfirmModal.set(false);
				this.toDeleteId.set(null);
				this.grid.reload();
			},
			error: (error) => {
				this._toast.showApiError('Failed to delete roulette log', error, 'Unable to delete the roulette log.');
			},
		}).add(() => this.isLoadingDelete.set(false));
	}

	public getLocalUtcDate(value: string | null | undefined): Date | null {
		if (!value) {
			return null;
		}

		const normalizedValue = /(?:z|[+-]\d{2}:\d{2})$/i.test(value)
			? value
			: `${value}Z`;

		const parsedDate = new Date(normalizedValue);

		return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
	}

	public getNestedProperty(obj: any, path: string): any {
		return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
	}
}
