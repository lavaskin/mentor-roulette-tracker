import { JobEnum } from '@app/models/enums/jobs.enum';
import { JobRoleEnum } from '@app/models/enums/job-role.enum';
import { JobModel } from '@app/models/job.model';

export type SpinCategory =
	| 'all'
	| 'roles'
	| 'tank'
	| 'healer'
	| 'melee'
	| 'magical_ranged'
	| 'physical_ranged'
	| 'all_dps';

export interface SpinCategoryOption {
	label: string;
	value: SpinCategory;
}

export interface SpinSegment {
	id: string;
	label: string;
	sublabel?: string;
	color: string;
}

export const ROLE_COLORS: Record<JobRoleEnum, string> = {
	[JobRoleEnum.Tank]: '#3a7bd5',
	[JobRoleEnum.Healer]: '#2d9f4e',
	[JobRoleEnum.MeleeDps]: '#c23a3a',
	[JobRoleEnum.MagicalRangedDps]: '#8b5cf6',
	[JobRoleEnum.PhysicalRangedDps]: '#d4a017',
};

export const ROLE_LABELS: Record<JobRoleEnum, string> = {
	[JobRoleEnum.Tank]: 'Tank',
	[JobRoleEnum.Healer]: 'Healer',
	[JobRoleEnum.MeleeDps]: 'Melee DPS',
	[JobRoleEnum.MagicalRangedDps]: 'Magical Ranged',
	[JobRoleEnum.PhysicalRangedDps]: 'Physical Ranged',
};

export const SPIN_CATEGORY_OPTIONS: SpinCategoryOption[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Roles', value: 'roles' },
	{ label: 'Tank', value: 'tank' },
	{ label: 'Healer', value: 'healer' },
	{ label: 'Melee', value: 'melee' },
	{ label: 'Magical Ranged', value: 'magical_ranged' },
	{ label: 'Physical Ranged', value: 'physical_ranged' },
	{ label: 'All DPS', value: 'all_dps' },
];

/** Shade multipliers per job within a role (light → dark) for wheel contrast. */
const ROLE_SHADE_STEPS: Record<JobRoleEnum, number[]> = {
	[JobRoleEnum.Tank]: [1.28, 1.1, 0.88, 0.68],
	[JobRoleEnum.Healer]: [1.28, 1.1, 0.88, 0.68],
	[JobRoleEnum.MeleeDps]: [1.32, 1.16, 1.0, 0.84, 0.68, 0.54],
	[JobRoleEnum.MagicalRangedDps]: [1.28, 1.1, 0.88, 0.68],
	[JobRoleEnum.PhysicalRangedDps]: [1.28, 1.02, 0.76],
};

function clampByte(value: number): number {
	return Math.max(0, Math.min(255, Math.round(value)));
}

function shadeHex(hex: string, factor: number): string {
	const normalized = hex.replace('#', '');
	const r = parseInt(normalized.slice(0, 2), 16);
	const g = parseInt(normalized.slice(2, 4), 16);
	const b = parseInt(normalized.slice(4, 6), 16);
	const toHex = (n: number) => clampByte(n * factor).toString(16).padStart(2, '0');
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function jobColor(role: JobRoleEnum, indexInRole: number): string {
	const steps = ROLE_SHADE_STEPS[role];
	const factor = steps[indexInRole] ?? steps[steps.length - 1] ?? 1;
	return shadeHex(ROLE_COLORS[role], factor);
}

export const ALL_JOBS: JobModel[] = [
	{ id: JobEnum.Paladin, abbrev: 'PLD', name: 'Paladin', role: JobRoleEnum.Tank, color: jobColor(JobRoleEnum.Tank, 0) },
	{ id: JobEnum.Warrior, abbrev: 'WAR', name: 'Warrior', role: JobRoleEnum.Tank, color: jobColor(JobRoleEnum.Tank, 1) },
	{ id: JobEnum.DarkKnight, abbrev: 'DRK', name: 'Dark Knight', role: JobRoleEnum.Tank, color: jobColor(JobRoleEnum.Tank, 2) },
	{ id: JobEnum.Gunbreaker, abbrev: 'GNB', name: 'Gunbreaker', role: JobRoleEnum.Tank, color: jobColor(JobRoleEnum.Tank, 3) },

	{ id: JobEnum.WhiteMage, abbrev: 'WHM', name: 'White Mage', role: JobRoleEnum.Healer, color: jobColor(JobRoleEnum.Healer, 0) },
	{ id: JobEnum.Scholar, abbrev: 'SCH', name: 'Scholar', role: JobRoleEnum.Healer, color: jobColor(JobRoleEnum.Healer, 1) },
	{ id: JobEnum.Astrologian, abbrev: 'AST', name: 'Astrologian', role: JobRoleEnum.Healer, color: jobColor(JobRoleEnum.Healer, 2) },
	{ id: JobEnum.Sage, abbrev: 'SGE', name: 'Sage', role: JobRoleEnum.Healer, color: jobColor(JobRoleEnum.Healer, 3) },

	{ id: JobEnum.Monk, abbrev: 'MNK', name: 'Monk', role: JobRoleEnum.MeleeDps, color: jobColor(JobRoleEnum.MeleeDps, 0) },
	{ id: JobEnum.Dragoon, abbrev: 'DRG', name: 'Dragoon', role: JobRoleEnum.MeleeDps, color: jobColor(JobRoleEnum.MeleeDps, 1) },
	{ id: JobEnum.Ninja, abbrev: 'NIN', name: 'Ninja', role: JobRoleEnum.MeleeDps, color: jobColor(JobRoleEnum.MeleeDps, 2) },
	{ id: JobEnum.Samurai, abbrev: 'SAM', name: 'Samurai', role: JobRoleEnum.MeleeDps, color: jobColor(JobRoleEnum.MeleeDps, 3) },
	{ id: JobEnum.Reaper, abbrev: 'RPR', name: 'Reaper', role: JobRoleEnum.MeleeDps, color: jobColor(JobRoleEnum.MeleeDps, 4) },
	{ id: JobEnum.Viper, abbrev: 'VPR', name: 'Viper', role: JobRoleEnum.MeleeDps, color: jobColor(JobRoleEnum.MeleeDps, 5) },

	{ id: JobEnum.BlackMage, abbrev: 'BLM', name: 'Black Mage', role: JobRoleEnum.MagicalRangedDps, color: jobColor(JobRoleEnum.MagicalRangedDps, 0) },
	{ id: JobEnum.Summoner, abbrev: 'SMN', name: 'Summoner', role: JobRoleEnum.MagicalRangedDps, color: jobColor(JobRoleEnum.MagicalRangedDps, 1) },
	{ id: JobEnum.RedMage, abbrev: 'RDM', name: 'Red Mage', role: JobRoleEnum.MagicalRangedDps, color: jobColor(JobRoleEnum.MagicalRangedDps, 2) },
	{ id: JobEnum.Pictomancer, abbrev: 'PCT', name: 'Pictomancer', role: JobRoleEnum.MagicalRangedDps, color: jobColor(JobRoleEnum.MagicalRangedDps, 3) },

	{ id: JobEnum.Bard, abbrev: 'BRD', name: 'Bard', role: JobRoleEnum.PhysicalRangedDps, color: jobColor(JobRoleEnum.PhysicalRangedDps, 0) },
	{ id: JobEnum.Machinist, abbrev: 'MCH', name: 'Machinist', role: JobRoleEnum.PhysicalRangedDps, color: jobColor(JobRoleEnum.PhysicalRangedDps, 1) },
	{ id: JobEnum.Dancer, abbrev: 'DNC', name: 'Dancer', role: JobRoleEnum.PhysicalRangedDps, color: jobColor(JobRoleEnum.PhysicalRangedDps, 2) },
];

const DPS_ROLES: JobRoleEnum[] = [
	JobRoleEnum.MeleeDps,
	JobRoleEnum.MagicalRangedDps,
	JobRoleEnum.PhysicalRangedDps,
];

const CATEGORY_TO_ROLE: Partial<Record<SpinCategory, JobRoleEnum>> = {
	tank: JobRoleEnum.Tank,
	healer: JobRoleEnum.Healer,
	melee: JobRoleEnum.MeleeDps,
	magical_ranged: JobRoleEnum.MagicalRangedDps,
	physical_ranged: JobRoleEnum.PhysicalRangedDps,
};

export function getJobsForCategory(category: SpinCategory): JobModel[] {
	if (category === 'all' || category === 'roles') {
		return [...ALL_JOBS];
	}

	if (category === 'all_dps') {
		return ALL_JOBS.filter((job) => DPS_ROLES.includes(job.role));
	}

	const role = CATEGORY_TO_ROLE[category];
	if (!role) {
		return [...ALL_JOBS];
	}

	return ALL_JOBS.filter((job) => job.role === role);
}

export function getRoleSegments(): SpinSegment[] {
	return (Object.values(JobRoleEnum) as JobRoleEnum[]).map((role) => ({
		id: role,
		label: ROLE_LABELS[role],
		color: ROLE_COLORS[role],
	}));
}

export function jobsToSegments(jobs: JobModel[]): SpinSegment[] {
	return jobs.map((job) => ({
		id: String(job.id),
		label: job.abbrev,
		sublabel: job.name,
		color: job.color,
	}));
}
