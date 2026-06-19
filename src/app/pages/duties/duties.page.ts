import { Component, inject, OnInit, signal } from '@angular/core';
import { DutyModel } from '@app/models/entity/duty.model';
import { DutiesService } from '@app/services/duties.service';
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

	public isLoading = signal(false);
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
            { field: 'name', header: 'Name' },
            { field: 'levelRequirement', header: 'Level' },
            { field: 'expansionLabel', header: 'Expansion' },
            { field: 'dutyTypeLabel', header: 'Type' },
        ];
	}

	ngOnInit(): void {
		this.reload();
	}

	public reload(): void {
		this.isLoading.set(true);
		this._data.getAll().subscribe({
			next: (duties: DutyModel[]) => {
				this.duties.set(duties);
			},
			error: (error) => {
				this._toast.showApiError('Failed to load duties', error, 'Unable to load duties.');
			},
		}).add(() => this.isLoading.set(false));
	}

	public openNewDutyModal(): void {
		this.selectedDuty.set({
			name: '',
		});

		this.isNewDuty.set(true);
		this.showEditDutyModal.set(true);
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

		httpObserver.subscribe({
			next: () => {
				this.showEditDutyModal.set(false);
				this.reload();
			},
			error: (error) => {
				this._toast.showApiError(
					this.isNewDuty() ? 'Failed to create duty' : 'Failed to update duty',
					error,
					'Unable to save the duty.'
				);
			},
		}).add(() => this.isLoadingSave.set(false));
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
