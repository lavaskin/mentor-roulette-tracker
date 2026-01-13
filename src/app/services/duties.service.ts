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
}
