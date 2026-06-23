import { DutyTypeBreakdownStatModel } from './duty-type-breakdown-stat.model';

export interface PlayedJobDutyBreakdownStatModel {
	jobLabel: string;
	dutyTypes: DutyTypeBreakdownStatModel[];
}
