import { GridFilterParams } from '@app/models/grid-request.model';
import { SelectOptionModel } from '@app/models/select-option.model';

/** A local calendar day, `yyyy-MM-dd`. Kept as a string so filter state is plain JSON. */
export type CalendarDate = string;

export interface DateRangeValue {
	from: CalendarDate | null;
	to: CalendarDate | null;
}

/** `number[]` for multiselects, `boolean | null` for yes/no, `DateRangeValue` for date ranges */
export type GridFilterValue = number[] | boolean | null | DateRangeValue;

/** Filter values by each definition's `key`. Plain JSON, so it can be saved to sessionStorage as is. */
export type GridFilterState = Record<string, GridFilterValue>;

interface GridFilterBase {
	/** Unique within a grid. Keys the state and the form controls. */
	key: string;
	label: string;
}

/** Matches any of the selected values. Nothing selected means no filter. */
export interface MultiSelectGridFilter extends GridFilterBase {
	type: 'multiselect';
	/** API query param, repeated once per selected value */
	param: string;
	/**
	 * A function makes the options depend on the other pending values, e.g. jobs narrowed to the
	 * selected roles. Selections that stop being offered are dropped.
	 */
	options: SelectOptionModel[] | ((state: GridFilterState) => SelectOptionModel[]);
}

/** Any / Yes / No. Any (null) means no filter. */
export interface BooleanGridFilter extends GridFilterBase {
	type: 'boolean';
	param: string;
}

/** Whole local days, both ends included. Either end can be left open. */
export interface DateRangeGridFilter extends GridFilterBase {
	type: 'dateRange';
	/** Gets local midnight at the start of the first day, as an instant (inclusive) */
	fromParam: string;
	/** Gets local midnight after the last day, as an instant (exclusive), so the whole last day matches */
	beforeParam: string;
}

export type GridFilterDefinition = MultiSelectGridFilter | BooleanGridFilter | DateRangeGridFilter;

/**
 * The `default` of every switch on a definition's `type`. Once every type has a case, `definition` is
 * `never` here, so adding a type to `GridFilterDefinition` without handling it fails to compile.
 */
function unhandledFilterType(definition: never): never {
	throw new Error(`Unhandled grid filter type '${(definition as GridFilterDefinition).type}'`);
}

export function emptyFilterState(definitions: readonly GridFilterDefinition[]): GridFilterState {
	return Object.fromEntries(definitions.map((definition) => [definition.key, emptyValue(definition)]));
}

function emptyValue(definition: GridFilterDefinition): GridFilterValue {
	switch (definition.type) {
		case 'multiselect': return [];
		case 'boolean': return null;
		case 'dateRange': return { from: null, to: null };
		default: return unhandledFilterType(definition);
	}
}

export function multiSelectValue(state: GridFilterState, key: string): number[] {
	const value = state[key];
	return Array.isArray(value) ? value : [];
}

export function booleanValue(state: GridFilterState, key: string): boolean | null {
	const value = state[key];
	return typeof value === 'boolean' ? value : null;
}

export function dateRangeValue(state: GridFilterState, key: string): DateRangeValue {
	const value = state[key];
	return isDateRange(value) ? value : { from: null, to: null };
}

function isDateRange(value: unknown): value is DateRangeValue {
	return typeof value === 'object' && value !== null && !Array.isArray(value) && 'from' in value && 'to' in value;
}

export function filterOptions(definition: MultiSelectGridFilter, state: GridFilterState): SelectOptionModel[] {
	return typeof definition.options === 'function' ? definition.options(state) : definition.options;
}

export function isFilterActive(definition: GridFilterDefinition, state: GridFilterState): boolean {
	switch (definition.type) {
		case 'multiselect': return multiSelectValue(state, definition.key).length > 0;
		case 'boolean': return booleanValue(state, definition.key) !== null;
		case 'dateRange': {
			const { from, to } = dateRangeValue(state, definition.key);
			return from !== null || to !== null;
		}
		default: return unhandledFilterType(definition);
	}
}

/** Filters in use, not values selected: Endwalker + Dawntrail is one filter. */
export function countActiveFilters(definitions: readonly GridFilterDefinition[], state: GridFilterState): number {
	return definitions.filter((definition) => isFilterActive(definition, state)).length;
}

/** Drops multiselect values that their (possibly dependent) options no longer offer. */
export function withoutUnavailableOptions(definitions: readonly GridFilterDefinition[], state: GridFilterState): GridFilterState {
	const result = { ...state };

	for (const definition of definitions) {
		if (definition.type !== 'multiselect') continue;

		const offered = new Set(filterOptions(definition, result).map((option) => option.value));
		const selected = multiSelectValue(result, definition.key);
		const kept = selected.filter((value) => offered.has(value));

		if (kept.length !== selected.length) {
			result[definition.key] = kept;
		}
	}

	return result;
}

/** The query params for the active filters. Inactive ones are left out. */
export function toFilterParams(definitions: readonly GridFilterDefinition[], state: GridFilterState): GridFilterParams {
	const params: Record<string, GridFilterParams[string]> = {};

	for (const definition of definitions) {
		switch (definition.type) {
			case 'multiselect': {
				const values = multiSelectValue(state, definition.key);
				if (values.length > 0) params[definition.param] = values;
				break;
			}
			case 'boolean': {
				const value = booleanValue(state, definition.key);
				if (value !== null) params[definition.param] = value;
				break;
			}
			case 'dateRange': {
				const { from, to } = dateRangeValue(state, definition.key);
				if (from) params[definition.fromParam] = localMidnight(from, 0).toISOString();
				if (to) params[definition.beforeParam] = localMidnight(to, 1).toISOString();
				break;
			}
			default:
				unhandledFilterType(definition);
		}
	}

	return params;
}

/** Local midnight at the start of `date`, plus `addDays` days. */
function localMidnight(date: CalendarDate, addDays: number): Date {
	const [year, month, day] = date.split('-').map(Number);
	return new Date(year, month - 1, day + addDays);
}

export function toCalendarDate(date: Date): CalendarDate {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromCalendarDate(date: CalendarDate | null): Date | null {
	return date ? localMidnight(date, 0) : null;
}

const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Reads filter state saved by `saveFilterState`. Anything missing, malformed or no longer offered
 * (say the definitions changed since it was saved) falls back to empty, so a bad entry can't break the grid.
 */
export function loadFilterState(storageKey: string, definitions: readonly GridFilterDefinition[]): GridFilterState {
	const state = emptyFilterState(definitions);

	let saved: unknown;
	try {
		saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
	} catch {
		return state;
	}

	if (typeof saved !== 'object' || saved === null) {
		return state;
	}

	const savedState = saved as Record<string, unknown>;
	for (const definition of definitions) {
		const value = savedState[definition.key];

		switch (definition.type) {
			case 'multiselect':
				if (Array.isArray(value)) state[definition.key] = value.filter((v): v is number => typeof v === 'number');
				break;
			case 'boolean':
				if (typeof value === 'boolean') state[definition.key] = value;
				break;
			case 'dateRange':
				if (isDateRange(value)) {
					const asDate = (v: unknown) => typeof v === 'string' && CALENDAR_DATE.test(v) ? v : null;
					state[definition.key] = { from: asDate(value.from), to: asDate(value.to) };
				}
				break;
			default:
				unhandledFilterType(definition);
		}
	}

	return withoutUnavailableOptions(definitions, state);
}

export function saveFilterState(storageKey: string, state: GridFilterState): void {
	try {
		sessionStorage.setItem(storageKey, JSON.stringify(state));
	} catch {
		// Storage can be full or disabled. The filters still apply, they just won't survive a reload.
	}
}
