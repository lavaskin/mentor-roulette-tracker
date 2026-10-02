/** One page of a server-side grid. Mirrors the API's `PagedResponse<T>`. */
export interface PagedResponseModel<T> {
	items: T[],
	/** 1-based */
	page: number,
	pageSize: number,
	/** Rows matching the search across all pages */
	totalCount: number,
}
