import { DutyExpansionBreakdownStatModel } from './duty-expansion-breakdown-stat.model';
import { PlayedJobStatModel } from './played-job-stat.model';
import { SeenDutyStatModel } from './seen-duty-stat.model';

export interface MentorRouletteStatsModel {
	totalRuns: number;
	completedRoulettes: number;
	achievementProgressPercent: number;
	topSeenDuties: SeenDutyStatModel[];
	topPlayedJobs: PlayedJobStatModel[];
	totalFailedDuties: number;
	numberExtremeTrials: number;
	extremeTrialClearPercent: number;
	dutyExpansionBreakdown: DutyExpansionBreakdownStatModel[];
}
