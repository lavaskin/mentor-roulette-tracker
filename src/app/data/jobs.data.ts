import { JobEnum } from '@app/models/enums/jobs.enum';
import { JobSubRoleEnum } from '@app/models/enums/job-sub-role.enum';
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

/** Every role, in game order. A list, because a numeric enum's `Object.values` also holds its names. */
export const JOB_SUB_ROLES: readonly JobSubRoleEnum[] = [
	JobSubRoleEnum.Tank,
	JobSubRoleEnum.Healer,
	JobSubRoleEnum.MeleeDps,
	JobSubRoleEnum.MagicalRangedDps,
	JobSubRoleEnum.PhysicalRangedDps,
];

export const ROLE_COLORS: Record<JobSubRoleEnum, string> = {
	[JobSubRoleEnum.Tank]: '#3a7bd5',
	[JobSubRoleEnum.Healer]: '#2d9f4e',
	[JobSubRoleEnum.MeleeDps]: '#c23a3a',
	[JobSubRoleEnum.MagicalRangedDps]: '#8b5cf6',
	[JobSubRoleEnum.PhysicalRangedDps]: '#d4a017',
};

export const ROLE_LABELS: Record<JobSubRoleEnum, string> = {
	[JobSubRoleEnum.Tank]: 'Tank',
	[JobSubRoleEnum.Healer]: 'Healer',
	[JobSubRoleEnum.MeleeDps]: 'Melee DPS',
	[JobSubRoleEnum.MagicalRangedDps]: 'Magical Ranged',
	[JobSubRoleEnum.PhysicalRangedDps]: 'Physical Ranged',
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
const ROLE_SHADE_STEPS: Record<JobSubRoleEnum, number[]> = {
	[JobSubRoleEnum.Tank]: [1.28, 1.1, 0.88, 0.68],
	[JobSubRoleEnum.Healer]: [1.28, 1.1, 0.88, 0.68],
	[JobSubRoleEnum.MeleeDps]: [1.32, 1.16, 1.0, 0.84, 0.68, 0.54],
	[JobSubRoleEnum.MagicalRangedDps]: [1.28, 1.1, 0.88, 0.68],
	[JobSubRoleEnum.PhysicalRangedDps]: [1.28, 1.02, 0.76],
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

function jobColor(role: JobSubRoleEnum, indexInRole: number): string {
	const steps = ROLE_SHADE_STEPS[role];
	const factor = steps[indexInRole] ?? steps[steps.length - 1] ?? 1;
	return shadeHex(ROLE_COLORS[role], factor);
}

export const ALL_JOBS: JobModel[] = [
	{ id: JobEnum.Paladin, abbrev: 'PLD', name: 'Paladin', role: JobSubRoleEnum.Tank, color: jobColor(JobSubRoleEnum.Tank, 0) },
	{ id: JobEnum.Warrior, abbrev: 'WAR', name: 'Warrior', role: JobSubRoleEnum.Tank, color: jobColor(JobSubRoleEnum.Tank, 1) },
	{ id: JobEnum.DarkKnight, abbrev: 'DRK', name: 'Dark Knight', role: JobSubRoleEnum.Tank, color: jobColor(JobSubRoleEnum.Tank, 2) },
	{ id: JobEnum.Gunbreaker, abbrev: 'GNB', name: 'Gunbreaker', role: JobSubRoleEnum.Tank, color: jobColor(JobSubRoleEnum.Tank, 3) },

	{ id: JobEnum.WhiteMage, abbrev: 'WHM', name: 'White Mage', role: JobSubRoleEnum.Healer, color: jobColor(JobSubRoleEnum.Healer, 0) },
	{ id: JobEnum.Scholar, abbrev: 'SCH', name: 'Scholar', role: JobSubRoleEnum.Healer, color: jobColor(JobSubRoleEnum.Healer, 1) },
	{ id: JobEnum.Astrologian, abbrev: 'AST', name: 'Astrologian', role: JobSubRoleEnum.Healer, color: jobColor(JobSubRoleEnum.Healer, 2) },
	{ id: JobEnum.Sage, abbrev: 'SGE', name: 'Sage', role: JobSubRoleEnum.Healer, color: jobColor(JobSubRoleEnum.Healer, 3) },

	{ id: JobEnum.Monk, abbrev: 'MNK', name: 'Monk', role: JobSubRoleEnum.MeleeDps, color: jobColor(JobSubRoleEnum.MeleeDps, 0) },
	{ id: JobEnum.Dragoon, abbrev: 'DRG', name: 'Dragoon', role: JobSubRoleEnum.MeleeDps, color: jobColor(JobSubRoleEnum.MeleeDps, 1) },
	{ id: JobEnum.Ninja, abbrev: 'NIN', name: 'Ninja', role: JobSubRoleEnum.MeleeDps, color: jobColor(JobSubRoleEnum.MeleeDps, 2) },
	{ id: JobEnum.Samurai, abbrev: 'SAM', name: 'Samurai', role: JobSubRoleEnum.MeleeDps, color: jobColor(JobSubRoleEnum.MeleeDps, 3) },
	{ id: JobEnum.Reaper, abbrev: 'RPR', name: 'Reaper', role: JobSubRoleEnum.MeleeDps, color: jobColor(JobSubRoleEnum.MeleeDps, 4) },
	{ id: JobEnum.Viper, abbrev: 'VPR', name: 'Viper', role: JobSubRoleEnum.MeleeDps, color: jobColor(JobSubRoleEnum.MeleeDps, 5) },

	{ id: JobEnum.BlackMage, abbrev: 'BLM', name: 'Black Mage', role: JobSubRoleEnum.MagicalRangedDps, color: jobColor(JobSubRoleEnum.MagicalRangedDps, 0) },
	{ id: JobEnum.Summoner, abbrev: 'SMN', name: 'Summoner', role: JobSubRoleEnum.MagicalRangedDps, color: jobColor(JobSubRoleEnum.MagicalRangedDps, 1) },
	{ id: JobEnum.RedMage, abbrev: 'RDM', name: 'Red Mage', role: JobSubRoleEnum.MagicalRangedDps, color: jobColor(JobSubRoleEnum.MagicalRangedDps, 2) },
	{ id: JobEnum.Pictomancer, abbrev: 'PCT', name: 'Pictomancer', role: JobSubRoleEnum.MagicalRangedDps, color: jobColor(JobSubRoleEnum.MagicalRangedDps, 3) },

	{ id: JobEnum.Bard, abbrev: 'BRD', name: 'Bard', role: JobSubRoleEnum.PhysicalRangedDps, color: jobColor(JobSubRoleEnum.PhysicalRangedDps, 0) },
	{ id: JobEnum.Machinist, abbrev: 'MCH', name: 'Machinist', role: JobSubRoleEnum.PhysicalRangedDps, color: jobColor(JobSubRoleEnum.PhysicalRangedDps, 1) },
	{ id: JobEnum.Dancer, abbrev: 'DNC', name: 'Dancer', role: JobSubRoleEnum.PhysicalRangedDps, color: jobColor(JobSubRoleEnum.PhysicalRangedDps, 2) },
];

const DPS_ROLES: JobSubRoleEnum[] = [
	JobSubRoleEnum.MeleeDps,
	JobSubRoleEnum.MagicalRangedDps,
	JobSubRoleEnum.PhysicalRangedDps,
];

const CATEGORY_TO_ROLE: Partial<Record<SpinCategory, JobSubRoleEnum>> = {
	tank: JobSubRoleEnum.Tank,
	healer: JobSubRoleEnum.Healer,
	melee: JobSubRoleEnum.MeleeDps,
	magical_ranged: JobSubRoleEnum.MagicalRangedDps,
	physical_ranged: JobSubRoleEnum.PhysicalRangedDps,
};

export function getJobsForCategory(category: SpinCategory): JobModel[] {
	if (category === 'all' || category === 'roles') {
		return [...ALL_JOBS];
	}

	if (category === 'all_dps') {
		return ALL_JOBS.filter((job) => DPS_ROLES.includes(job.role));
	}

	// Not `!role`: Tank is 0
	const role = CATEGORY_TO_ROLE[category];
	if (role === undefined) {
		return [...ALL_JOBS];
	}

	return ALL_JOBS.filter((job) => job.role === role);
}

export function getRoleSegments(): SpinSegment[] {
	return JOB_SUB_ROLES.map((role) => ({
		id: String(role),
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
