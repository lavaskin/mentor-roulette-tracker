import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { EditDutyModal } from '@app/components/edit-duty-modal/edit-duty-modal';
import { SearchBar } from '@app/components/search-bar/search-bar';
import { DutyModel } from '@app/models/entity/duty.model';
import { NEW_DUTY_HANDOFF_KEY, NewDutyHandoffModel, RESUME_LOG_HANDOFF_KEY, ResumeLogHandoffModel } from '@app/models/navigation-handoff.model';
import { PagedResponseModel } from '@app/models/paged-response.model';
import { MessageService } from 'primeng/api';
import { MockInstance } from 'vitest';
import { DutiesPage } from './duties.page';

function getModal(fixture: ComponentFixture<DutiesPage>): EditDutyModal {
	return fixture.debugElement.query(By.directive(EditDutyModal)).componentInstance;
}

function pageOf(items: DutyModel[], totalCount: number = items.length, page: number = 1): PagedResponseModel<DutyModel> {
	return { items, page, pageSize: 50, totalCount };
}

function setHandoff(handoff: NewDutyHandoffModel | null): void {
	history.replaceState(handoff ? { [NEW_DUTY_HANDOFF_KEY]: handoff } : {}, '');
}

describe('DutiesPage', () => {
	let fixture: ComponentFixture<DutiesPage>;
	let http: HttpTestingController;
	let navigate: MockInstance<Router['navigate']>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideRouter([]),
				provideHttpClient(),
				provideHttpClientTesting(),
				MessageService,
			],
		});

		http = TestBed.inject(HttpTestingController);
		navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
	});

	afterEach(() => {
		setHandoff(null);
		http.verify();
	});

	function render(firstPage: PagedResponseModel<DutyModel> = pageOf([])): void {
		fixture = TestBed.createComponent(DutiesPage);
		fixture.detectChanges();
		http.expectOne(request => request.method === 'GET').flush(firstPage);
		fixture.detectChanges();
	}

	function text(): string {
		return fixture.nativeElement.textContent;
	}

	it('loads the first page from the API, sorted by name', () => {
		fixture = TestBed.createComponent(DutiesPage);
		fixture.detectChanges();

		const request = http.expectOne(request => request.method === 'GET');
		expect(request.request.params.toString()).toBe('page=1&pageSize=50&sortBy=name&sortDirection=asc');

		request.flush(pageOf([{ dutyId: 1, name: 'Sastasha' }], 120));
		fixture.detectChanges();

		expect(text()).toContain('Sastasha');
		expect(text()).toContain('120 Registered Duties');
		expect(text()).toContain('1 - 50 of 120');
	});

	it('asks the API for the next page from the paginator', () => {
		render(pageOf([{ dutyId: 1, name: 'Sastasha' }], 120));

		fixture.nativeElement.querySelector('.p-paginator-next').click();

		const request = http.expectOne(request => request.method === 'GET');
		expect(request.request.params.get('page')).toBe('2');
		expect(request.request.params.get('sortBy')).toBe('name');
		request.flush(pageOf([{ dutyId: 2, name: 'The Vault' }], 120, 2));
		fixture.detectChanges();

		expect(text()).toContain('The Vault');
		expect(text()).toContain('51 - 100 of 120');
	});

	it('sorts on the API by the column sort key, toggling direction', () => {
		render(pageOf([{ dutyId: 1, name: 'Sastasha' }], 120));
		const expansionHeader = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('th'))
			.find(th => th.textContent?.includes('Expansion'))!;

		expansionHeader.click();
		const ascending = http.expectOne(request => request.method === 'GET');
		expect(ascending.request.params.toString()).toBe('page=1&pageSize=50&sortBy=expansion&sortDirection=asc');
		ascending.flush(pageOf([], 120));

		expansionHeader.click();
		const descending = http.expectOne(request => request.method === 'GET');
		expect(descending.request.params.get('sortDirection')).toBe('desc');
		descending.flush(pageOf([], 120));
	});

	it('sends the search to the API and shows the filtered count', () => {
		render(pageOf([{ dutyId: 1, name: 'Sastasha' }], 120));

		fixture.debugElement.query(By.directive(SearchBar)).componentInstance.ngModelChange.emit(' aurum ');

		const request = http.expectOne(request => request.method === 'GET');
		expect(request.request.params.get('search')).toBe('aurum');
		expect(request.request.params.get('page')).toBe('1');
		request.flush(pageOf([{ dutyId: 3, name: 'Aurum Vale' }]));
		fixture.detectChanges();

		expect(text()).toContain('Aurum Vale');
		expect(text()).toContain('1 filtered results');
	});

	it('distinguishes no matches from no duties at all', () => {
		render(pageOf([]));
		expect(text()).toContain('No duties yet');

		fixture.debugElement.query(By.directive(SearchBar)).componentInstance.ngModelChange.emit('zzz');
		http.expectOne(request => request.method === 'GET').flush(pageOf([]));
		fixture.detectChanges();

		expect(text()).toContain('No matching duties');
	});

	it('opens the new duty modal pre-filled when arriving from a roulette log', () => {
		setHandoff({ dutyName: 'The Aetherfont', log: { notes: 'wipe city' }, isNewLog: true });
		render();

		expect(fixture.componentInstance.showEditDutyModal()).toBe(true);
		expect(getModal(fixture).form.get('name')!.value).toBe('The Aetherfont');
	});

	it('closes on the first visibleChange and does not navigate when there is no handoff', () => {
		setHandoff(null);
		render();

		fixture.componentInstance.openNewDutyModal();
		fixture.detectChanges();
		expect(fixture.componentInstance.showEditDutyModal()).toBe(true);

		getModal(fixture).visibleChange.emit(false);
		fixture.detectChanges();

		expect(fixture.componentInstance.showEditDutyModal()).toBe(false);
		expect(navigate).not.toHaveBeenCalled();
	});

	it('closes on the first visibleChange and stays put when cancelled mid-handoff', () => {
		setHandoff({ dutyName: 'The Aetherfont', log: { notes: 'wipe city' }, isNewLog: true });
		render();

		getModal(fixture).visibleChange.emit(false);
		fixture.detectChanges();

		expect(fixture.componentInstance.showEditDutyModal()).toBe(false);
		expect(navigate).not.toHaveBeenCalled();
	});

	it('returns to the roulette log with the new duty selected after saving', () => {
		setHandoff({ dutyName: 'The Aetherfont', log: { notes: 'wipe city' }, isNewLog: true });
		render();

		fixture.componentInstance.onDutySaved({ name: 'The Aetherfont', levelRequirement: 90 });
		http.expectOne(request => request.method === 'POST')
			.flush({ dutyId: 42, name: 'The Aetherfont', levelRequirement: 90 });

		expect(navigate).toHaveBeenCalledTimes(1);

		const [commands, extras] = navigate.mock.calls[0];
		const payload = extras!.state![RESUME_LOG_HANDOFF_KEY] as ResumeLogHandoffModel;

		expect(commands).toEqual(['/roulettes']);
		expect(payload.log.dutyId).toBe(42);
		expect(payload.log.dutyModel?.name).toBe('The Aetherfont');
		expect(payload.log.notes).toBe('wipe city');
		expect(payload.isNewLog).toBe(true);
	});

	it('falls back to matching by name when the create response omits the id', () => {
		setHandoff({ dutyName: 'The Aetherfont', log: {}, isNewLog: true });
		render();

		fixture.componentInstance.onDutySaved({ name: 'The Aetherfont' });
		http.expectOne(request => request.method === 'POST').flush({});
		const lookup = http.expectOne(request => request.method === 'GET');
		expect(lookup.request.params.get('search')).toBe('The Aetherfont');
		lookup.flush(pageOf([
			{ dutyId: 7, name: 'The Aetherfont (Hard)' },
			{ dutyId: 8, name: 'The Aetherfont' },
		]));

		const payload = navigate.mock.calls[0][1]!.state![RESUME_LOG_HANDOFF_KEY] as ResumeLogHandoffModel;
		expect(payload.log.dutyId).toBe(8);
	});

	it('does not resurrect an abandoned log when a later duty is created', () => {
		setHandoff({ dutyName: 'The Aetherfont', log: { notes: 'wipe city' }, isNewLog: true });
		render();

		getModal(fixture).visibleChange.emit(false);
		fixture.detectChanges();

		fixture.componentInstance.openNewDutyModal();
		fixture.componentInstance.onDutySaved({ name: 'Somewhere Else' });
		http.expectOne(request => request.method === 'POST').flush({ dutyId: 9 });
		http.expectOne(request => request.method === 'GET').flush(pageOf([]));

		expect(navigate).not.toHaveBeenCalled();
	});
});
