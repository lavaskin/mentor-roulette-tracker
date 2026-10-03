import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { GridFilter } from '@app/components/grid-filter/grid-filter';
import { SearchBar } from '@app/components/search-bar/search-bar';
import { MentorRouletteLogModel } from '@app/models/entity/mentor-roulette-log.model';
import { ExpansionEnum } from '@app/models/enums/expansion.enum';
import { JobSubRoleEnum } from '@app/models/enums/job-sub-role.enum';
import { PagedResponseModel } from '@app/models/paged-response.model';
import { emptyFilterState, loadFilterState, saveFilterState } from '@app/shared/grid-filter';
import { MessageService } from 'primeng/api';
import { ROULETTE_FILTERS, ROULETTE_FILTERS_STORAGE_KEY } from './roulettes.filters';
import { RoulettesPage } from './roulettes.page';

function pageOf(items: MentorRouletteLogModel[], totalCount: number = items.length): PagedResponseModel<MentorRouletteLogModel> {
	return { items, page: 1, pageSize: 50, totalCount };
}

const DOMA_CASTLE_RUN: MentorRouletteLogModel = {
	mentorRouletteLogId: 1,
	sortOrder: 233,
	playedJobLabel: 'Black Mage',
	dutyModel: { name: 'Doma Castle', dutyTypeLabel: 'Dungeon' },
	completed: true,
	replacement: false,
	notes: '',
	datePlayed: '2026-10-02T21:36:44.73',
};

describe('RoulettesPage', () => {
	let fixture: ComponentFixture<RoulettesPage>;
	let http: HttpTestingController;

	beforeEach(() => {
		history.replaceState({}, '');
		sessionStorage.clear();

		TestBed.configureTestingModule({
			providers: [
				provideRouter([]),
				provideHttpClient(),
				provideHttpClientTesting(),
				MessageService,
			],
		});

		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		http.verify();
	});

	function render(firstPage: PagedResponseModel<MentorRouletteLogModel> = pageOf([DOMA_CASTLE_RUN], 233)): void {
		fixture = TestBed.createComponent(RoulettesPage);
		fixture.detectChanges();
		http.expectOne(request => request.method === 'GET').flush(firstPage);
		fixture.detectChanges();
	}

	function text(): string {
		return fixture.nativeElement.textContent;
	}

	it('loads the newest runs first from the API', () => {
		fixture = TestBed.createComponent(RoulettesPage);
		fixture.detectChanges();

		const request = http.expectOne(request => request.method === 'GET');
		expect(request.request.params.toString()).toBe('page=1&pageSize=50&sortBy=sortOrder&sortDirection=desc');

		request.flush(pageOf([DOMA_CASTLE_RUN], 233));
		fixture.detectChanges();

		expect(text()).toContain('Doma Castle');
		expect(text()).toContain('Black Mage');
		expect(text()).toContain('1 - 50 of 233');
	});

	it('sorts nested columns on the API by their sort key', () => {
		render();
		const dutyNameHeader = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('th'))
			.find(th => th.textContent?.includes('Duty Name'))!;

		dutyNameHeader.click();

		const request = http.expectOne(request => request.method === 'GET');
		expect(request.request.params.toString()).toBe('page=1&pageSize=50&sortBy=dutyName&sortDirection=asc');
		request.flush(pageOf([DOMA_CASTLE_RUN], 233));
	});

	it('sends the search to the API and shows the filtered count', () => {
		render();

		fixture.debugElement.query(By.directive(SearchBar)).componentInstance.ngModelChange.emit('doma');

		const request = http.expectOne(request => request.method === 'GET');
		expect(request.request.params.get('search')).toBe('doma');
		expect(request.request.params.get('page')).toBe('1');
		request.flush(pageOf([DOMA_CASTLE_RUN], 3));
		fixture.detectChanges();

		expect(text()).toContain('3 filtered results');
	});

	it('sends applied filters to the API from page 1, and keeps them for the session', () => {
		render();
		const filters = { ...emptyFilterState(ROULETTE_FILTERS), expansions: [ExpansionEnum.Endwalker], completed: false };

		fixture.debugElement.query(By.directive(GridFilter)).componentInstance.apply.emit(filters);

		const request = http.expectOne(request => request.method === 'GET');
		expect(request.request.params.toString())
			.toBe('page=1&pageSize=50&sortBy=sortOrder&sortDirection=desc&expansions=5&completed=false');
		request.flush(pageOf([DOMA_CASTLE_RUN], 4));
		fixture.detectChanges();

		expect(text()).toContain('4 filtered results');
		expect(fixture.nativeElement.querySelector('.p-badge').textContent.trim()).toBe('2');
		expect(loadFilterState(ROULETTE_FILTERS_STORAGE_KEY, ROULETTE_FILTERS)).toEqual(filters);
	});

	it('restores the session filters into its first load', () => {
		saveFilterState(ROULETTE_FILTERS_STORAGE_KEY, {
			...emptyFilterState(ROULETTE_FILTERS),
			subRoles: [JobSubRoleEnum.Healer],
			datePlayed: { from: '2026-03-01', to: null },
		});

		fixture = TestBed.createComponent(RoulettesPage);
		fixture.detectChanges();

		const request = http.expectOne(request => request.method === 'GET');
		expect(request.request.params.getAll('subRoles')).toEqual(['1']);
		expect(request.request.params.get('playedFrom')).toBe('2026-03-01T05:00:00.000Z'); // midnight in New York, see test-setup.ts
		expect(request.request.params.get('sortBy')).toBe('sortOrder');
		request.flush(pageOf([DOMA_CASTLE_RUN], 1));
	});

	it('shows a refreshable error when the page fails to load', () => {
		fixture = TestBed.createComponent(RoulettesPage);
		fixture.detectChanges();
		http.expectOne(request => request.method === 'GET').flush(null, { status: 500, statusText: 'Server Error' });
		fixture.detectChanges();

		expect(text()).toContain('Unable to load roulettes');

		fixture.nativeElement.querySelector('button[label="Refresh roulettes"]').click();
		http.expectOne(request => request.method === 'GET').flush(pageOf([DOMA_CASTLE_RUN], 1));
		fixture.detectChanges();

		expect(text()).toContain('Doma Castle');
	});
});
