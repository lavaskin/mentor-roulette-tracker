export type SortDirection = 'asc' | 'desc';

/**
 * A grid's typed filters, by query param name. Arrays are sent as repeated keys
 * (`?expansions=5&expansions=6`), which the API binds to a list.
 */
export type GridFilterParams = Readonly<Record<string, string | number | boolean | readonly (string | number)[]>>;

/** Query string for a server-side grid. Mirrors the API's `GridRequest`. */
export interface GridRequestModel {
	/** 1-based */
	page: number,
	pageSize: number,
	search?: string,
	/** One of the grid's API sort keys. Omit to get the API's default sort. */
	sortBy?: string,
	sortDirection?: SortDirection,
	/** Filters the grid's `*GridRequest` accepts on top of the shared paging, search and sort */
	filters?: GridFilterParams,
}
