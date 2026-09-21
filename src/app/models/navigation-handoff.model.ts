import { MentorRouletteLogModel } from '@app/models/entity/mentor-roulette-log.model';

/**
 * Sent to the duties page when the user starts creating a duty from inside the
 * roulette log modal. Carries the half-filled log so it can be restored afterwards.
 */
export interface NewDutyHandoffModel {
	dutyName?: string;
	log: MentorRouletteLogModel;
	isNewLog: boolean;
}

/**
 * Sent back to the roulettes page once the duty flow finishes, so the log modal
 * can reopen exactly where the user left it.
 */
export interface ResumeLogHandoffModel {
	log: MentorRouletteLogModel;
	isNewLog: boolean;
}

export const NEW_DUTY_HANDOFF_KEY = 'newDutyHandoff';
export const RESUME_LOG_HANDOFF_KEY = 'resumeLogHandoff';
