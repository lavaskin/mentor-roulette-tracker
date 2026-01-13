import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { MentorRouletteLogModel } from "@app/models/mentor-roulette-log.model";
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

	public create(mentorRouletteLog: MentorRouletteLogModel): Observable<MentorRouletteLogModel> {
		return this._http.post<MentorRouletteLogModel>(`${this._baseUrl}`, mentorRouletteLog);
	}
	
	public update(mentorRouletteLog: MentorRouletteLogModel): Observable<MentorRouletteLogModel> {
		return this._http.put<MentorRouletteLogModel>(`${this._baseUrl}/${mentorRouletteLog.mentorRouletteLogId}`, mentorRouletteLog);
	}
	
	public delete(mentorRouletteLogId: number): Observable<void> {
		return this._http.delete<void>(`${this._baseUrl}/${mentorRouletteLogId}`);
	}
}
