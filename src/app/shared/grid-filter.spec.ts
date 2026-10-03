import {
	countActiveFilters,
	emptyFilterState,
	GridFilterDefinition,
	loadFilterState,
	multiSelectValue,
	saveFilterState,
	toCalendarDate,
	toFilterParams,
	withoutUnavailableOptions,
} from './grid-filter';

const FRUITS = [{ label: 'Apple', value: 1 }, { label: 'Banana', value: 2 }, { label: 'Cherry', value: 3 }];

const DEFINITIONS: GridFilterDefinition[] = [
	{ type: 'multiselect', key: 'colors', label: 'Color', param: 'colors', options: [{ label: 'Red', value: 10 }, { label: 'Yellow', value: 20 }] },
	{
		type: 'multiselect',
		key: 'fruits',
		label: 'Fruit',
		param: 'fruitIds',
		// Yellow only offers bananas
		options: (state) => multiSelectValue(state, 'colors').includes(20) ? FRUITS.filter(f => f.value === 2) : FRUITS,
	},
	{ type: 'boolean', key: 'ripe', label: 'Ripe', param: 'ripe' },
	{ type: 'dateRange', key: 'picked', label: 'Picked', fromParam: 'pickedFrom', beforeParam: 'pickedBefore' },
];

describe('grid filters', () => {
	beforeEach(() => sessionStorage.clear());

	it('starts with nothing selected', () => {
		const state = emptyFilterState(DEFINITIONS);

		expect(state).toEqual({ colors: [], fruits: [], ripe: null, picked: { from: null, to: null } });
		expect(countActiveFilters(DEFINITIONS, state)).toBe(0);
		expect(toFilterParams(DEFINITIONS, state)).toEqual({});
	});

	it('counts filters in use, not values selected', () => {
		const state = { ...emptyFilterState(DEFINITIONS), colors: [10, 20], ripe: false, picked: { from: null, to: '2026-03-31' } };

		expect(countActiveFilters(DEFINITIONS, state)).toBe(3);
	});

	it('sends each active filter under its API param', () => {
		const state = { ...emptyFilterState(DEFINITIONS), fruits: [1, 3], ripe: false };

		expect(toFilterParams(DEFINITIONS, state)).toEqual({ fruitIds: [1, 3], ripe: false });
	});

	it('sends a date range as local midnights, with the end exclusive so the whole last day matches', () => {
		const state = { ...emptyFilterState(DEFINITIONS), picked: { from: '2026-03-01', to: '2026-03-31' } };

		// The tests run in New York (see test-setup.ts), which moves to daylight time on March 8th
		expect(toFilterParams(DEFINITIONS, state)).toEqual({
			pickedFrom: '2026-03-01T05:00:00.000Z',
			pickedBefore: '2026-04-01T04:00:00.000Z',
		});
	});

	it('leaves an open end of a date range out', () => {
		const state = { ...emptyFilterState(DEFINITIONS), picked: { from: '2026-03-01', to: null } };

		expect(Object.keys(toFilterParams(DEFINITIONS, state))).toEqual(['pickedFrom']);
	});

	it('writes calendar dates in local time', () => {
		// 11:59pm on the 5th in New York, when it's already the 6th in UTC
		expect(toCalendarDate(new Date('2026-01-06T04:59:00Z'))).toBe('2026-01-05');
	});

	it('drops selections that dependent options no longer offer', () => {
		const state = { ...emptyFilterState(DEFINITIONS), colors: [20], fruits: [1, 2] };

		expect(withoutUnavailableOptions(DEFINITIONS, state)['fruits']).toEqual([2]);
	});

	it('restores what it saved', () => {
		const state = { ...emptyFilterState(DEFINITIONS), colors: [10], ripe: true, picked: { from: '2026-03-01', to: null } };

		saveFilterState('test', state);

		expect(loadFilterState('test', DEFINITIONS)).toEqual(state);
	});

	it('ignores saved values that are malformed, unknown or no longer offered', () => {
		sessionStorage.setItem('test', JSON.stringify({
			colors: [20, 'red'],
			fruits: [1, 2],
			ripe: 'yes',
			picked: { from: 'March', to: '2026-03-31' },
			removedFilter: [1],
		}));

		expect(loadFilterState('test', DEFINITIONS)).toEqual({
			colors: [20],
			fruits: [2],
			ripe: null,
			picked: { from: null, to: '2026-03-31' },
		});
	});

	it('falls back to no filters when nothing usable was saved', () => {
		expect(loadFilterState('missing', DEFINITIONS)).toEqual(emptyFilterState(DEFINITIONS));

		sessionStorage.setItem('broken', '{not json');
		expect(loadFilterState('broken', DEFINITIONS)).toEqual(emptyFilterState(DEFINITIONS));
	});
});
