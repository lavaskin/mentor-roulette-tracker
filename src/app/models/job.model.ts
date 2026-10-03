import { JobEnum } from '@app/models/enums/jobs.enum';
import { JobSubRoleEnum } from '@app/models/enums/job-sub-role.enum';

export interface JobModel {
	id: JobEnum;
	abbrev: string;
	name: string;
	role: JobSubRoleEnum;
	color: string;
}
