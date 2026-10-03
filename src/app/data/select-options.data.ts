import { ALL_JOBS, JOB_SUB_ROLES, ROLE_LABELS } from '@app/data/jobs.data';
import { DutyTypeEnum } from '@app/models/enums/duty-type.enum';
import { ExpansionEnum } from '@app/models/enums/expansion.enum';
import { JobModel } from '@app/models/job.model';
import { SelectOptionModel } from '@app/models/select-option.model';

export const DutiesSelectOptions: SelectOptionModel[] = [
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

export const ExpansionsSelectOptions: SelectOptionModel[] = [
	{ label: 'A Realm Reborn', value: ExpansionEnum.ARealmReborn },
	{ label: 'Heavensward', value: ExpansionEnum.Heavensward },
	{ label: 'Stormblood', value: ExpansionEnum.Stormblood },
	{ label: 'Shadowbringers', value: ExpansionEnum.Shadowbringers },
	{ label: 'Endwalker', value: ExpansionEnum.Endwalker },
	{ label: 'Dawntrail', value: ExpansionEnum.Dawntrail },
];

export const JobSubRoleSelectOptions: SelectOptionModel[] = JOB_SUB_ROLES.map((role) => ({
	label: ROLE_LABELS[role],
	value: role,
}));

/** e.g. "PLD | Paladin" */
export function jobSelectOption(job: JobModel): SelectOptionModel {
	return { label: `${job.abbrev} | ${job.name}`, value: job.id };
}

/**
 * The jobs a mentor roulette can be run on. The limited jobs (Blue Mage, Beast Master) are in the
 * database, but aren't in `ALL_JOBS` because they can't queue for mentor roulettes.
 */
export const JobSelectOptions: SelectOptionModel[] = ALL_JOBS.map(jobSelectOption);
