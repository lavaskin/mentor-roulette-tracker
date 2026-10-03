import { toGridHttpParams } from './grid-http-params';

describe('toGridHttpParams', () => {
	it('sends paging, the trimmed search and the sort', () => {
		const params = toGridHttpParams({ page: 2, pageSize: 25, search: ' aurum ', sortBy: 'name', sortDirection: 'desc' });

		expect(params.toString()).toBe('page=2&pageSize=25&search=aurum&sortBy=name&sortDirection=desc');
	});

	it('leaves out a blank search and an unset sort, so the API uses its defaults', () => {
		const params = toGridHttpParams({ page: 1, pageSize: 50, search: '   ', sortDirection: 'desc' });

		expect(params.toString()).toBe('page=1&pageSize=50');
	});

	it('repeats list filters once per value, so the API binds them to a list', () => {
		const params = toGridHttpParams({
			page: 1,
			pageSize: 50,
			filters: { expansions: [5, 6], completed: false, playedFrom: '2026-03-01T05:00:00.000Z', jobs: [] },
		});

		expect(params.toString()).toBe('page=1&pageSize=50&expansions=5&expansions=6&completed=false&playedFrom=2026-03-01T05:00:00.000Z');
	});
});
