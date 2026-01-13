import { DutyTypeEnum } from "./enums/duty-type.enum";
import { ExpansionEnum } from "./enums/expansion.enum";

export interface DutyModel {
	dutyId?: number | null;
	name?: string | null;
	dutyTypeId?: number | null;
	expansionId?: number | null;
	levelRequirement?: number | null;
	dutyType?: DutyTypeEnum | null;
	dutyTypeLabel?: string | null;
	expansion?: ExpansionEnum | null;
	expansionLabel?: string | null;
}
