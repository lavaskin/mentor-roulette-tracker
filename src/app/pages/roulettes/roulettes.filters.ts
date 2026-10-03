import { ALL_JOBS } from '@app/data/jobs.data';
import {
	DutiesSelectOptions,
	ExpansionsSelectOptions,
	jobSelectOption,
	JobSelectOptions,
	JobSubRoleSelectOptions,
} from '@app/data/select-options.data';
import { GridFilterDefinition, multiSelectValue } from '@app/shared/grid-filter';

/** Where the applied filters are kept, so they survive a reload for the rest of the tab's session */
export const ROULETTE_FILTERS_STORAGE_KEY = 'mrt.roulettes.filters';

/**
 * The roulettes grid's filters. Each `param` is a property on the API's `MentorRouletteLogGridRequest`.
 * Values are the API's enum ids. To add one, add the property there first, then a definition here.
 */
export const ROULETTE_FILTERS: GridFilterDefinition[] = [
	{ type: 'multiselect', key: 'expansions', label: 'Expansion', param: 'expansions', options: ExpansionsSelectOptions },
	{ type: 'multiselect', key: 'dutyTypes', label: 'Duty Type', param: 'dutyTypes', options: DutiesSelectOptions },
	{ type: 'multiselect', key: 'subRoles', label: 'Role', param: 'subRoles', options: JobSubRoleSelectOptions },
	{
		type: 'multiselect',
		key: 'jobs',
		label: 'Job',
		param: 'jobs',
		// Role and job must both match on the API, so only offer jobs in the selected roles
		options: (state) => {
			const subRoles = multiSelectValue(state, 'subRoles');
			if (subRoles.length === 0) return JobSelectOptions;

			return ALL_JOBS.filter((job) => subRoles.includes(job.role)).map(jobSelectOption);
		},
	},
	{ type: 'boolean', key: 'completed', label: 'Completed', param: 'completed' },
	{ type: 'boolean', key: 'replacement', label: 'Replacement', param: 'replacement' },
	{ type: 'dateRange', key: 'datePlayed', label: 'Date Ran', fromParam: 'playedFrom', beforeParam: 'playedBefore' },
];
