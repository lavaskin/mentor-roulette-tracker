import { DutyTypeBreakdownStatModel } from './duty-type-breakdown-stat.model';

export interface DutyExpansionBreakdownStatModel {
	expansionLabel: string;
	dutyTypes: DutyTypeBreakdownStatModel[];
}
