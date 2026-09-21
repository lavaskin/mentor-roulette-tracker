import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MentorRouletteLogModel } from '@app/models/entity/mentor-roulette-log.model';
import { MentorRouletteLogService } from './mentor-roulette-log.service';

describe('MentorRouletteLogService', () => {
	let service: MentorRouletteLogService;
	let http: HttpTestingController;

	const logWithDuty: MentorRouletteLogModel = {
		mentorRouletteLogId: 3,
		dutyId: 42,
		dutyModel: { dutyId: 42, name: 'The Aetherfont', levelRequirement: 90 },
		notes: 'wipe city',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), MentorRouletteLogService],
		});

		service = TestBed.inject(MentorRouletteLogService);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => http.verify());

	it('does not post the nested duty when creating, only the foreign key', () => {
		service.create(logWithDuty).subscribe();

		const request = http.expectOne(candidate => candidate.method === 'POST');
		request.flush({});

		expect(request.request.body).not.toHaveProperty('dutyModel');
		expect(request.request.body.dutyId).toBe(42);
		expect(request.request.body.notes).toBe('wipe city');
	});

	it('does not put the nested duty when updating, only the foreign key', () => {
		service.update(logWithDuty).subscribe();

		const request = http.expectOne(candidate => candidate.method === 'PUT');
		request.flush({});

		expect(request.request.body).not.toHaveProperty('dutyModel');
		expect(request.request.body.dutyId).toBe(42);
	});

	it('leaves the caller\'s log untouched so the duty name still renders', () => {
		service.create(logWithDuty).subscribe();
		http.expectOne(candidate => candidate.method === 'POST').flush({});

		expect(logWithDuty.dutyModel?.name).toBe('The Aetherfont');
	});
});
