import { Component, inject, OnInit, signal } from '@angular/core';
import { DutyModel } from '@app/models/duty.model';
import { DutiesService } from '@app/services/duties.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { EditDutyModal } from "@app/components/edit-duty-modal/edit-duty-modal";
import { ConfirmModal } from "@app/components/confirm-modal/confirm-modal";
import { SearchBar } from '@app/components/search-bar/search-bar';

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
		}).add(() => this.isLoading.set(false));
	}

	public openNewDutyModal(): void {
		this.selectedDuty.set({
			name: '',
			levelRequirement: null,
			expansionId: null,
			dutyTypeId: null,
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

		this.showEditDutyModal.set(false);
		this.isLoadingSave.set(true);

		let httpObserver;
		if (this.isNewDuty()) {
			httpObserver = this._data.create(duty);
		} else {
			httpObserver = this._data.update(duty);
		}

		httpObserver.subscribe({
			next: () => {
				this.reload();
			},
		}).add(() => this.isLoadingSave.set(false));
	}

	public openDeleteConfirmModal(dutyId: number | null): void {
		this.dutyToDeleteId.set(dutyId);
		this.showDeleteConfirmModal.set(true);
	}

	public deleteDuty(dutyId: number | null | undefined): void {
		if (!dutyId || this.isLoadingDelete()) return;

		this._data.delete(dutyId).subscribe({
			next: () => {
				this.reload();
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
