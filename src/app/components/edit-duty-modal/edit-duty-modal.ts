import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DutiesSelectOptions, ExpansionsSelectOptions } from '@app/data/select-options.data';
import { DutyModel } from '@app/models/entity/duty.model';
import { DutyTypeEnum } from '@app/models/enums/duty-type.enum';
import { ExpansionEnum } from '@app/models/enums/expansion.enum';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

const EXPANSION_LABELS: Record<ExpansionEnum, string> = {
	[ExpansionEnum.BaseGame]: 'Base Game',
	[ExpansionEnum.ARealmReborn]: 'A Realm Reborn',
	[ExpansionEnum.Heavensward]: 'Heavensward',
	[ExpansionEnum.Stormblood]: 'Stormblood',
	[ExpansionEnum.Shadowbringers]: 'Shadowbringers',
	[ExpansionEnum.Endwalker]: 'Endwalker',
	[ExpansionEnum.Dawntrail]: 'Dawntrail',
};

const EXPANSION_LEVEL_RANGES: Record<ExpansionEnum, { min: number; max: number }> = {
	[ExpansionEnum.BaseGame]: { min: 1, max: 50 },
	[ExpansionEnum.ARealmReborn]: { min: 1, max: 50 },
	[ExpansionEnum.Heavensward]: { min: 51, max: 60 },
	[ExpansionEnum.Stormblood]: { min: 61, max: 70 },
	[ExpansionEnum.Shadowbringers]: { min: 71, max: 80 },
	[ExpansionEnum.Endwalker]: { min: 81, max: 90 },
	[ExpansionEnum.Dawntrail]: { min: 91, max: 100 },
};

const AUTO_FILL_DUTY_TYPES = new Set<DutyTypeEnum>([
	DutyTypeEnum.ExtremeTrial,
	DutyTypeEnum.NormalRaid,
	DutyTypeEnum.AllianceRaid,
]);

const GUILDHEST_EXPANSION = ExpansionEnum.ARealmReborn;

function withinExpansionRange(min: number | undefined, max: number | undefined): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const value = control.value;
		if (value === null || value === undefined || value === '') {
			return null;
		}
		if (min === undefined || max === undefined) {
			return null;
		}
		const num = Number(value);
		if (num < min || num > max) {
			return { outOfExpansionRange: true };
		}
		return null;
	};
}

@Component({
	selector: 'mrt-edit-duty-modal',
	imports: [
		ReactiveFormsModule,
		DialogModule,
		InputTextModule,
		ButtonModule,
		SelectModule,
	],
	templateUrl: './edit-duty-modal.html',
	styleUrl: './edit-duty-modal.scss',
})
export class EditDutyModal implements OnChanges, OnInit {
	@Input() duty: DutyModel | null = null;
	@Input() isNew: boolean = false;
	@Input() visible: boolean = false;
	@Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input() isLoading: boolean = false;
	@Output() save: EventEmitter<DutyModel> = new EventEmitter<DutyModel>();

	public expansions = ExpansionsSelectOptions;
	public dutyTypes = DutiesSelectOptions;

	public expansionLabels = EXPANSION_LABELS;

	public form!: FormGroup;

	private previousExpansion: ExpansionEnum | undefined;
	private previousDutyType: DutyTypeEnum | undefined;

	public ngOnInit(): void {
		this.buildForm();
	}

	public ngOnChanges(changes: SimpleChanges): void {
		if (changes['duty']) {
			this.buildForm();
			this.syncFormToDuty();
			this.autoFillLevelRequirement();
		}
		if (changes['duty'] && this.duty) {
			this.previousExpansion = this.duty.expansion;
			this.previousDutyType = this.duty.dutyType;
		}
	}

	private buildForm(): void {
		this.form = new FormGroup({
			name: new FormControl('', [Validators.required]),
			dutyType: new FormControl(null as DutyTypeEnum | null, [Validators.required]),
			expansion: new FormControl(null as ExpansionEnum | null, [Validators.required]),
			levelRequirement: new FormControl(null as number | null, [
				Validators.required,
				withinExpansionRange(undefined, undefined),
			]),
		});

		this.form.get('expansion')?.valueChanges.subscribe((expansion) => {
			this.onExpansionChange(expansion);
		});

		this.form.get('dutyType')?.valueChanges.subscribe((dutyType) => {
			this.onDutyTypeChange(dutyType);
		});

		this.form.get('levelRequirement')?.valueChanges.subscribe(() => {
			this.updateLevelValidator();
		});
	}

	private syncFormToDuty(): void {
		if (!this.duty) return;

		this.form.reset({
			name: this.duty.name || '',
			dutyType: this.duty.dutyType ?? null,
			expansion: this.duty.expansion ?? null,
			levelRequirement: this.duty.levelRequirement ?? null,
		}, { emitEvent: false });

		this.updateLevelValidator();
		this.form.updateValueAndValidity({ emitEvent: false });
	}

	private updateLevelValidator(): void {
		if (!this.duty?.expansion) return;

		const range = EXPANSION_LEVEL_RANGES[this.duty.expansion];
		if (!range) return;

		const levelControl = this.form.get('levelRequirement');
		if (!levelControl) return;

		const validators = levelControl.validator ?
			Array.isArray(levelControl.validator) ? levelControl.validator : [levelControl.validator] : [];

		levelControl.setValidators([
			Validators.required,
			withinExpansionRange(range.min, range.max),
		]);

		levelControl.updateValueAndValidity();
	}

	public onExpansionChange(expansion: ExpansionEnum | null): void {
		if (!this.duty || !this.isNew) return;

		if (expansion !== null) {
			this.duty.expansion = expansion;
		}

		this.clampLevelRequirement();
		this.autoFillLevelRequirement();
		this.updateLevelValidator();
	}

	public onDutyTypeChange(dutyType: DutyTypeEnum | null): void {
		if (!this.duty || !this.isNew) return;

		if (dutyType !== null) {
			this.duty.dutyType = dutyType;
		}

		if (dutyType === DutyTypeEnum.Guildhest) {
			this.form.patchValue({ expansion: GUILDHEST_EXPANSION }, { emitEvent: false });
			this.duty.expansion = GUILDHEST_EXPANSION;
		}

		this.autoFillLevelRequirement();
		this.updateLevelValidator();
	}

	public get isExpansionDisabled(): boolean {
		return this.duty?.dutyType === DutyTypeEnum.Guildhest;
	}

	private clampLevelRequirement(): void {
		if (!this.duty || !this.isNew) return;

		const { expansion, levelRequirement } = this.duty;

		if (expansion !== undefined && EXPANSION_LEVEL_RANGES[expansion] && levelRequirement !== undefined) {
			const { min, max } = EXPANSION_LEVEL_RANGES[expansion];
			this.duty.levelRequirement = Math.min(max, Math.max(min, levelRequirement));
			this.form.patchValue({ levelRequirement: this.duty.levelRequirement }, { emitEvent: false });
			this.form.get('levelRequirement')?.updateValueAndValidity();
		}
	}

	private autoFillLevelRequirement(): void {
		if (!this.duty || !this.isNew) return;

		const { expansion, dutyType } = this.duty;

		if (expansion !== undefined && dutyType !== undefined && AUTO_FILL_DUTY_TYPES.has(dutyType)) {
			const range = EXPANSION_LEVEL_RANGES[expansion];
			if (range) {
				this.duty.levelRequirement = range.max;
				this.form.patchValue({ levelRequirement: range.max }, { emitEvent: false });
			}
		}

		this.previousExpansion = expansion;
		this.previousDutyType = dutyType;
	}

	public get hasExpansion(): boolean {
		return this.duty?.expansion !== undefined && this.duty?.expansion !== null;
	}

	public get levelRange(): { min: number; max: number } | undefined {
		if (!this.duty?.expansion) return undefined;
		return EXPANSION_LEVEL_RANGES[this.duty.expansion];
	}

	public get isLevelOutOfRange(): boolean {
		const control = this.form.get('levelRequirement');
		return control?.hasError('outOfExpansionRange') ?? false;
	}

	public onSave(): void {
		if (!this.form.valid) {
			this.form.markAllAsTouched();
			return;
		}

		const value = this.form.value;
		this.save.emit({
			dutyId: this.duty?.dutyId,
			name: value.name,
			dutyType: value.dutyType,
			expansion: value.expansion,
			levelRequirement: value.levelRequirement,
		} as DutyModel);
	}
}
