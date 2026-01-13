import { JobEnum } from "../enums/jobs.enum";
import { DutyModel } from "./duty.model";

export interface MentorRouletteLogModel {
	mentorRouletteLogId?: number,
	dutyId?: number,
	duty?: DutyModel,
	sortOrder?: number,
	playedJobId?: number,
	completed?: boolean,
	notes?: string,
	datePlayed?: string,
	playedJob?: JobEnum,
	playedJobLabel?: string,
}
