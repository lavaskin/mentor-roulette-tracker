import { DutyExpansionBreakdownStatModel } from './duty-expansion-breakdown-stat.model';
import { DutyTypeRoleBreakdownStatModel } from './duty-type-role-breakdown-stat.model';
import { PlayedJobDutyBreakdownStatModel } from './played-job-duty-breakdown-stat.model';
import { PlayedJobStatModel } from './played-job-stat.model';
import { SeenDutyStatModel } from './seen-duty-stat.model';

export interface MentorRouletteStatsModel {
	totalRuns: number;
	completedRoulettes: number;
	achievementProgressPercent: number;
	topSeenDuties: SeenDutyStatModel[];
	topPlayedJobs: PlayedJobStatModel[];
	playedJobDutyTypeBreakdown: PlayedJobDutyBreakdownStatModel[];
	dutyTypeRoleBreakdown: DutyTypeRoleBreakdownStatModel[];
	totalFailedDuties: number;
	numberExtremeTrials: number;
	extremeTrialClearPercent: number;
	dutyExpansionBreakdown: DutyExpansionBreakdownStatModel[];
}
