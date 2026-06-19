export interface MentorRouletteStatsModel {
	totalRuns: number;
	completedRoulettes: number;
	achievementProgressPercent: number;
	mostRanDuty: string;
	mostRanDutyCount: number;
	mostCommonExpansion: string;
	totalFailedDuties: number;
	numberExtremeTrials: number;
	extremeTrialClearPercent: number;
}