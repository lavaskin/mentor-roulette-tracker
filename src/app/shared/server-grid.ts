import { computed, DestroyRef, inject, signal } from '@angular/core';
import { GridFilterParams, GridRequestModel, SortDirection } from '@app/models/grid-request.model';
import { PagedResponseModel } from '@app/models/paged-response.model';
import { TableLazyLoadEvent } from 'primeng/table';
import { Observable, Subscription } from 'rxjs';

/** Matches the API's `GridRequest.DefaultPageSize` */
export const DEFAULT_GRID_PAGE_SIZE = 50;

/** Matches the API's `GridRequest.MaxPageSize` */
export const MAX_GRID_PAGE_SIZE = 200;

export const GRID_PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

export interface GridColumn {
	/** Path into the row to display, e.g. `dutyModel.name` */
	field: string;
	header: string;
	/** The API sort key for this column, e.g. `dutyName` */
	sortField: string;
}

/**
 * State and loading for a lazy PrimeNG table backed by a paged API endpoint. Paging, sorting,
 * search and filters all happen on the server: the table reports paging and sorting through
 * `onLazyLoad`, the search box calls `setSearch`, the filter widget calls `setFilters`, and each
 * change fetches one page.
 *
 * Create it in an injection context (e.g. a component field initializer), so it can cancel an
 * in-flight request when the component is destroyed.
 */
export class ServerGrid<T> {
	public readonly items = signal<T[]>([]);
	public readonly totalCount = signal(0);
	public readonly isLoading = signal(false);
	public readonly loadFailed = signal(false);

	/** Index of the first row on the current page, which is how PrimeNG's paginator tracks the page */
	public readonly first = signal(0);
	public readonly pageSize = signal(DEFAULT_GRID_PAGE_SIZE);

	/** The trimmed search text. Empty means unfiltered. */
	public readonly search = signal('');
	public readonly isSearching = computed(() => this.search().length > 0);

	private readonly _filters = signal<GridFilterParams>({});

	/** The grid's typed filters, as API query params. Empty means unfiltered. Change with `setFilters`. */
	public readonly filters = this._filters.asReadonly();
	public readonly hasFilters = computed(() => Object.keys(this.filters()).length > 0);

	/** True when the search or any filter is narrowing the rows */
	public readonly isFiltered = computed(() => this.isSearching() || this.hasFilters());

	public readonly pageSizeOptions = GRID_PAGE_SIZE_OPTIONS;

	private _sortBy: string | undefined;
	private _sortDirection: SortDirection = 'asc';
	private _request: Subscription | undefined;
	private _tableReady = false;

	constructor(
		private readonly _fetch: (request: GridRequestModel) => Observable<PagedResponseModel<T>>,
		private readonly _onError: (error: unknown) => void,
	) {
		inject(DestroyRef).onDestroy(() => this._request?.unsubscribe());
	}

	/** Bind to the table's `(onLazyLoad)`. PrimeNG fires it on init, and on every page or sort change. */
	public onLazyLoad(event: TableLazyLoadEvent): void {
		this._tableReady = true;
		this.first.set(event.first ?? 0);
		this.pageSize.set(event.rows ?? DEFAULT_GRID_PAGE_SIZE);
		this._sortBy = typeof event.sortField === 'string' ? event.sortField : undefined;
		this._sortDirection = event.sortOrder === -1 ? 'desc' : 'asc';
		this.load();
	}

	/** Goes back to the first page whenever the (trimmed) search text changes. */
	public setSearch(text: string): void {
		const search = text.trim();
		if (search === this.search()) return;

		this.search.set(search);
		this.first.set(0);
		this.load();
	}

	/**
	 * Replaces the filters and goes back to the first page. Safe to call before the table
	 * initializes (e.g. to restore saved filters): its first load will include them.
	 */
	public setFilters(filters: GridFilterParams): void {
		this._filters.set(filters);
		this.first.set(0);
		this.load();
	}

	/** Fetches the current page again, e.g. after a create, update or delete. */
	public reload(): void {
		this.load();
	}

	private load(): void {
		// The table's first onLazyLoad does the first fetch with its initial sort. Anything set before
		// then is picked up by that fetch instead of sending an extra request without the sort.
		if (!this._tableReady) return;

		// Only the latest request counts. Without this, a slow earlier page could land last and win.
		this._request?.unsubscribe();
		this.isLoading.set(true);
		this.loadFailed.set(false);

		const pageSize = this.pageSize();
		this._request = this._fetch({
			page: Math.floor(this.first() / pageSize) + 1,
			pageSize,
			search: this.search() || undefined,
			sortBy: this._sortBy,
			sortDirection: this._sortBy ? this._sortDirection : undefined,
			filters: this.hasFilters() ? this.filters() : undefined,
		}).subscribe({
			next: (page) => {
				// Deleting the only row on the last page leaves us past the end, so step back to the new last page
				if (page.items.length === 0 && page.totalCount > 0 && this.first() > 0) {
					this.first.set(Math.floor((page.totalCount - 1) / pageSize) * pageSize);
					this.load();
					return;
				}

				this.items.set(page.items);
				this.totalCount.set(page.totalCount);
				this.isLoading.set(false);
			},
			error: (error: unknown) => {
				this.items.set([]);
				this.totalCount.set(0);
				this.loadFailed.set(true);
				this.isLoading.set(false);
				this._onError(error);
			},
		});
	}
}
