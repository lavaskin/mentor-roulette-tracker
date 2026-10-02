import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { SearchBar } from '@app/components/search-bar/search-bar';
import { MentorRouletteLogModel } from '@app/models/entity/mentor-roulette-log.model';
import { PagedResponseModel } from '@app/models/paged-response.model';
import { MessageService } from 'primeng/api';
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
