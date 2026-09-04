import { JobRoleBreakdownStatModel } from './job-role-breakdown-stat.model';

export interface DutyTypeRoleBreakdownStatModel {
	dutyTypeLabel: string;
	roles: JobRoleBreakdownStatModel[];
	count: number;
}
