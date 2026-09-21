import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { MentorRouletteStatsModel } from "@app/models/mentor-roulette-stats.model";
import { MentorRouletteLogModel } from "@app/models/entity/mentor-roulette-log.model";
import { environment } from "environments/environment";
import { Observable } from "rxjs";

export class MentorRouletteLogService {
	private _baseUrl: string = `${environment.apiBaseUrl}/mentorroulette`;

	private _http: HttpClient = inject(HttpClient);

	public getAll(): Observable<MentorRouletteLogModel[]> {
		return this._http.get<MentorRouletteLogModel[]>(`${this._baseUrl}`);
	}

	public getById(mentorRouletteLogId: number): Observable<MentorRouletteLogModel> {
		return this._http.get<MentorRouletteLogModel>(`${this._baseUrl}/${mentorRouletteLogId}`);
	}

	public getStats(): Observable<MentorRouletteStatsModel> {
		return this._http.get<MentorRouletteStatsModel>(`${this._baseUrl}/GetStats`);
	}

	public create(mentorRouletteLog: MentorRouletteLogModel): Observable<MentorRouletteLogModel> {
		return this._http.post<MentorRouletteLogModel>(`${this._baseUrl}`, this.toWritePayload(mentorRouletteLog));
	}
	
	public update(mentorRouletteLog: MentorRouletteLogModel): Observable<MentorRouletteLogModel> {
		return this._http.put<MentorRouletteLogModel>(`${this._baseUrl}/${mentorRouletteLog.mentorRouletteLogId}`, this.toWritePayload(mentorRouletteLog));
	}

	/**
	 * `dutyModel` is a read-only projection the API sends down for display, and `dutyId` is the real
	 * foreign key. Posting the nested duty back makes EF treat it as a new Duty to insert, which
	 * fails with "Cannot insert explicit value for identity column".
	 */
	private toWritePayload(mentorRouletteLog: MentorRouletteLogModel): MentorRouletteLogModel {
		const { dutyModel: _dutyModel, ...payload } = mentorRouletteLog;
		return payload;
	}
	
	public delete(mentorRouletteLogId: number): Observable<void> {
		return this._http.delete<void>(`${this._baseUrl}/${mentorRouletteLogId}`);
	}
}
