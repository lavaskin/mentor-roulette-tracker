import { HttpParams } from '@angular/common/http';
import { GridRequestModel } from '@app/models/grid-request.model';

/** Leaves out blank values, so the API falls back to its defaults for them. */
export function toGridHttpParams(request: GridRequestModel): HttpParams {
	let params = new HttpParams()
		.set('page', request.page)
		.set('pageSize', request.pageSize);

	const search = request.search?.trim();
	if (search) {
		params = params.set('search', search);
	}

	if (request.sortBy) {
		params = params.set('sortBy', request.sortBy);

		if (request.sortDirection) {
			params = params.set('sortDirection', request.sortDirection);
		}
	}

	for (const [name, value] of Object.entries(request.filters ?? {})) {
		if (Array.isArray(value)) {
			for (const item of value) {
				params = params.append(name, item);
			}
		} else {
			params = params.set(name, value as string | number | boolean);
		}
	}

	return params;
}
