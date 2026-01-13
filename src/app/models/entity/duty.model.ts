import { DutyTypeEnum } from "../enums/duty-type.enum";
import { ExpansionEnum } from "../enums/expansion.enum";

export interface DutyModel {
	dutyId?: number,
	name?: string,
	dutyTypeId?: number,
	expansionId?: number,
	levelRequirement?: number,
	dutyType?: DutyTypeEnum,
	dutyTypeLabel?: string,
	expansion?: ExpansionEnum,
	expansionLabel?: string,
}
