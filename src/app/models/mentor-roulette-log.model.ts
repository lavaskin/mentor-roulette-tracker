import { DutyModel } from "./duty.model";
import { JobEnum } from "./enums/jobs.enum";

export interface MentorRouletteLogModel {
	mentorRouletteLogId?: number | null,
	dutyId?: number | null,
	duty?: DutyModel | null,
	sortOrder?: number | null,
	playedJobId?: number | null,
	notes?: string | null,
	datePlayed?: string | null,
	playedJob?: JobEnum | null,
	playedJobLabel?: string | null,
}
