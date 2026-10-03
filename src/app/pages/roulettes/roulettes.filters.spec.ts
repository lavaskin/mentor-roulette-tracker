import { JobSubRoleEnum } from '@app/models/enums/job-sub-role.enum';
import { emptyFilterState, filterOptions, MultiSelectGridFilter, toFilterParams } from '@app/shared/grid-filter';
import { ROULETTE_FILTERS } from './roulettes.filters';

describe('ROULETTE_FILTERS', () => {
	const jobs = ROULETTE_FILTERS.find((filter) => filter.key === 'jobs') as MultiSelectGridFilter;

	it('sends every filter under its MentorRouletteLogGridRequest property name', () => {
		const everyFilter = {
			expansions: [5],
			dutyTypes: [0],
			subRoles: [JobSubRoleEnum.Healer],
			jobs: [103],
			completed: true,
			replacement: false,
			datePlayed: { from: '2026-03-01', to: '2026-03-31' },
		};

		expect(Object.keys(toFilterParams(ROULETTE_FILTERS, everyFilter))).toEqual([
			'expansions', 'dutyTypes', 'subRoles', 'jobs', 'completed', 'replacement', 'playedFrom', 'playedBefore',
		]);
	});

	it('offers every job that can run mentor roulettes when no role is selected', () => {
		expect(filterOptions(jobs, emptyFilterState(ROULETTE_FILTERS))).toHaveLength(21);
	});

	it('only offers jobs in the selected roles', () => {
		const state = { ...emptyFilterState(ROULETTE_FILTERS), subRoles: [JobSubRoleEnum.Tank, JobSubRoleEnum.PhysicalRangedDps] };

		expect(filterOptions(jobs, state).map((option) => option.label)).toEqual([
			'PLD | Paladin', 'WAR | Warrior', 'DRK | Dark Knight', 'GNB | Gunbreaker',
			'BRD | Bard', 'MCH | Machinist', 'DNC | Dancer',
		]);
	});
});
