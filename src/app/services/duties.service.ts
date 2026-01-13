import { DutyModel } from "@app/models/duty.model";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";

export class DutiesService {
	private _baseUrl: string = `${environment.apiBaseUrl}/duty`;

	private _http: HttpClient = inject(HttpClient);

	public getDuties(): Observable<DutyModel[]> {
		return this._http.get<DutyModel[]>(`${this._baseUrl}`);
	}

	public getDutyById(dutyId: number): Observable<DutyModel> {
		return this._http.get<DutyModel>(`${this._baseUrl}/${dutyId}`);
	}

	public createDuty(duty: DutyModel): Observable<DutyModel> {
		return this._http.post<DutyModel>(`${this._baseUrl}`, duty);
	}
	public updateDuty(duty: DutyModel): Observable<DutyModel> {
		return this._http.put<DutyModel>(`${this._baseUrl}/${duty.dutyId}`, duty);
	}

	public deleteDuty(dutyId: number): Observable<void> {
		return this._http.delete<void>(`${this._baseUrl}/${dutyId}`);
	}
}
