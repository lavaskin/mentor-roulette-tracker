import { TestBed } from '@angular/core/testing';
import { GridRequestModel } from '@app/models/grid-request.model';
import { PagedResponseModel } from '@app/models/paged-response.model';
import { Subject } from 'rxjs';
import { Mock } from 'vitest';
import { ServerGrid } from './server-grid';

interface PendingRequest {
	request: GridRequestModel;
	response: Subject<PagedResponseModel<string>>;
}

describe('ServerGrid', () => {
	let requests: PendingRequest[];
	let onError: Mock<(error: unknown) => void>;
	let grid: ServerGrid<string>;

	beforeEach(() => {
		requests = [];
		onError = vi.fn();
		grid = TestBed.runInInjectionContext(() => new ServerGrid<string>((request) => {
			const response = new Subject<PagedResponseModel<string>>();
			requests.push({ request, response });
			return response;
		}, onError));
	});

	function respond(items: string[], totalCount: number, index = requests.length - 1): void {
		const { request, response } = requests[index];
		response.next({ items, totalCount, page: request.page, pageSize: request.pageSize });
		response.complete();
	}

	it('turns the table lazy load event into a page request', () => {
		grid.onLazyLoad({ first: 100, rows: 50, sortField: 'dutyName', sortOrder: -1 });

		expect(requests[0].request).toEqual({
			page: 3,
			pageSize: 50,
			search: undefined,
			sortBy: 'dutyName',
			sortDirection: 'desc',
		});
		expect(grid.isLoading()).toBe(true);
	});

	it('leaves the sort to the API when the table has none', () => {
		grid.onLazyLoad({ first: 0, rows: 25, sortField: null, sortOrder: 1 });

		expect(requests[0].request).toEqual({
			page: 1,
			pageSize: 25,
			search: undefined,
			sortBy: undefined,
			sortDirection: undefined,
		});
	});

	it('shows the page and the total once loaded', () => {
		grid.onLazyLoad({ first: 0, rows: 50 });
		respond(['Sastasha', 'Halatali'], 120);

		expect(grid.items()).toEqual(['Sastasha', 'Halatali']);
		expect(grid.totalCount()).toBe(120);
		expect(grid.isLoading()).toBe(false);
	});

	it('goes back to the first page when the search changes, keeping the sort', () => {
		grid.onLazyLoad({ first: 100, rows: 50, sortField: 'name', sortOrder: 1 });
		respond(['row'], 500);

		grid.setSearch('  aurum ');

		expect(grid.first()).toBe(0);
		expect(grid.search()).toBe('aurum');
		expect(grid.isSearching()).toBe(true);
		expect(requests[1].request).toEqual({
			page: 1,
			pageSize: 50,
			search: 'aurum',
			sortBy: 'name',
			sortDirection: 'asc',
		});
	});

	it('does not refetch when the search only changes by whitespace', () => {
		grid.onLazyLoad({ first: 0, rows: 50 });
		grid.setSearch('aurum');
		grid.setSearch('aurum  ');
		grid.setSearch('   ');
		grid.setSearch('');

		expect(requests.map(r => r.request.search)).toEqual([undefined, 'aurum', undefined]);
		expect(grid.isSearching()).toBe(false);
	});

	it('keeps only the latest page when requests overlap', () => {
		grid.onLazyLoad({ first: 0, rows: 50 });
		grid.onLazyLoad({ first: 50, rows: 50 });

		respond(['page 2'], 100, 1);
		respond(['page 1'], 100, 0);

		expect(grid.items()).toEqual(['page 2']);
	});

	it('steps back to the new last page when the current page is now past the end', () => {
		grid.onLazyLoad({ first: 50, rows: 50 });
		respond(['only row on page 2'], 51);

		grid.reload();
		respond([], 50);

		expect(grid.first()).toBe(0);
		expect(requests[2].request.page).toBe(1);

		respond(['last row on page 1'], 50);
		expect(grid.items()).toEqual(['last row on page 1']);
		expect(grid.isLoading()).toBe(false);
	});

	it('reports a failed load, and clears it on the next successful one', () => {
		grid.onLazyLoad({ first: 0, rows: 50 });
		respond(['row'], 1);

		grid.reload();
		const error = new Error('API is down');
		requests[1].response.error(error);

		expect(grid.loadFailed()).toBe(true);
		expect(grid.items()).toEqual([]);
		expect(grid.totalCount()).toBe(0);
		expect(grid.isLoading()).toBe(false);
		expect(onError).toHaveBeenCalledWith(error);

		grid.reload();
		expect(grid.loadFailed()).toBe(false);
	});
});
