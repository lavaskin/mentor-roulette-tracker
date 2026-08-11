import { JobEnum } from '@app/models/enums/jobs.enum';
import { JobRoleEnum } from '@app/models/enums/job-role.enum';

export interface JobModel {
	id: JobEnum;
	abbrev: string;
	name: string;
	role: JobRoleEnum;
	color: string;
}
