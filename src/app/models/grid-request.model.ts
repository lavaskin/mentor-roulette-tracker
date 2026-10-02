export type SortDirection = 'asc' | 'desc';

/** Query string for a server-side grid. Mirrors the API's `GridRequest`. */
export interface GridRequestModel {
	/** 1-based */
	page: number,
	pageSize: number,
	search?: string,
	/** One of the grid's API sort keys. Omit to get the API's default sort. */
	sortBy?: string,
	sortDirection?: SortDirection,
}
