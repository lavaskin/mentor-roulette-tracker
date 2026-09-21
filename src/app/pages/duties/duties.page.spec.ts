import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { EditDutyModal } from '@app/components/edit-duty-modal/edit-duty-modal';
import { NEW_DUTY_HANDOFF_KEY, NewDutyHandoffModel, RESUME_LOG_HANDOFF_KEY, ResumeLogHandoffModel } from '@app/models/navigation-handoff.model';
import { MessageService } from 'primeng/api';
import { MockInstance } from 'vitest';
import { DutiesPage } from './duties.page';

function getModal(fixture: ComponentFixture<DutiesPage>): EditDutyModal {
	return fixture.debugElement.query(By.directive(EditDutyModal)).componentInstance;
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

	function render(): void {
		fixture = TestBed.createComponent(DutiesPage);
		fixture.detectChanges();
		http.expectOne(request => request.method === 'GET').flush([]);
		fixture.detectChanges();
	}

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
		http.expectOne(request => request.method === 'GET').flush([
			{ dutyId: 7, name: 'Somewhere Else' },
			{ dutyId: 8, name: 'The Aetherfont' },
		]);

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
		http.expectOne(request => request.method === 'GET').flush([]);

		expect(navigate).not.toHaveBeenCalled();
	});
});
