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
});
