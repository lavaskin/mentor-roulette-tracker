import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DutyModel } from '@app/models/duty.model';
import { DutyTypeEnum } from '@app/models/enums/duty-type.enum';
import { ExpansionEnum } from '@app/models/enums/expansion.enum';
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

	public expansions: SelectOptionModel[] = [
		{ label: 'A Realm Reborn', value: ExpansionEnum.ARealmReborn },
		{ label: 'Heavensward', value: ExpansionEnum.Heavensward },
		{ label: 'Stormblood', value: ExpansionEnum.Stormblood },
		{ label: 'Shadowbringers', value: ExpansionEnum.Shadowbringers },
		{ label: 'Endwalker', value: ExpansionEnum.Endwalker },
		{ label: 'Dawntrail', value: ExpansionEnum.Dawntrail },
	];

	public dutyTypes: SelectOptionModel[] = [
		{ label: 'Guildhest', value: DutyTypeEnum.Guildhest },
		{ label: 'Dungeon', value: DutyTypeEnum.Dungeon },
		{ label: 'Trial', value: DutyTypeEnum.Trial },
		{ label: 'Extreme Trial', value: DutyTypeEnum.ExtremeTrial },
		{ label: 'Normal Raid', value: DutyTypeEnum.NormalRaid },
		{ label: 'Alliance Raid', value: DutyTypeEnum.AllianceRaid },
		{ label: 'Unreal Trial', value: DutyTypeEnum.UnrealTrial },
		{ label: 'Chaotic Alliance Raid', value: DutyTypeEnum.ChaoticAllianceRaid },
		{ label: 'Ultimate Raid', value: DutyTypeEnum.UltimateRaid },
	];

	public onSave(): void {
		if (this.duty) {
			this.save.emit(this.duty);
		}
	}
}
