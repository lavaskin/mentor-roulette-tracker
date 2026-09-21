import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DutiesAutocomplete } from './duties-autocomplete';

describe('DutiesAutocomplete', () => {
	let http: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => http.verify());

	it('emits the text typed into the search box when asked to add a new duty', () => {
		const fixture = TestBed.createComponent(DutiesAutocomplete);
		const component = fixture.componentInstance;

		const emitted: string[] = [];
		component.addNewDuty.subscribe(value => emitted.push(value));

		component.filterDuties({ query: '  The Aetherfont  ' });
		http.expectOne(request => request.method === 'POST').flush([]);

		component.onAddNewDuty();

		expect(emitted).toEqual(['The Aetherfont']);
	});

	it('emits an empty name when the dropdown was opened without typing', () => {
		const fixture = TestBed.createComponent(DutiesAutocomplete);
		const component = fixture.componentInstance;

		const emitted: string[] = [];
		component.addNewDuty.subscribe(value => emitted.push(value));

		component.onAddNewDuty();

		expect(emitted).toEqual(['']);
	});
});
