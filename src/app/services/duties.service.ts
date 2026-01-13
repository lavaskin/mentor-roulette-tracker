import { DutyModel } from "@app/models/entity/duty.model";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { SearchOptionsModel } from "@app/models/search-options.model";
import { ListResultItemModel } from "@app/models/list-result-item.model";

export class DutiesService {
	private _baseUrl: string = `${environment.apiBaseUrl}/duty`;

	private _http: HttpClient = inject(HttpClient);

	public getAll(): Observable<DutyModel[]> {
		return this._http.get<DutyModel[]>(`${this._baseUrl}`);
	}

	public getById(dutyId: number): Observable<DutyModel> {
		return this._http.get<DutyModel>(`${this._baseUrl}/${dutyId}`);
	}

	public getResultItems(searchOptions: SearchOptionsModel): Observable<ListResultItemModel[]> {
		return this._http.post<ListResultItemModel[]>(`${this._baseUrl}/getResultItems`, { params: searchOptions });
	}

	public create(duty: DutyModel): Observable<DutyModel> {
		return this._http.post<DutyModel>(`${this._baseUrl}`, duty);
	}
	
	public update(duty: DutyModel): Observable<DutyModel> {
		return this._http.put<DutyModel>(`${this._baseUrl}/${duty.dutyId}`, duty);
	}

	public delete(dutyId: number): Observable<void> {
		return this._http.delete<void>(`${this._baseUrl}/${dutyId}`);
	}
}
