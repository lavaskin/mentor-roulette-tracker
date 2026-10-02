import { DutyModel } from "@app/models/entity/duty.model";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { SearchOptionsModel } from "@app/models/search-options.model";
import { ListResultItemModel } from "@app/models/list-result-item.model";
import { GridRequestModel } from "@app/models/grid-request.model";
import { PagedResponseModel } from "@app/models/paged-response.model";
import { toGridHttpParams } from "./grid-http-params";

export class DutiesService {
	private _baseUrl: string = `${environment.apiBaseUrl}/duty`;

	private _http: HttpClient = inject(HttpClient);

	/** Sort keys: dutyId, name, levelRequirement, expansion, dutyType. Defaults to name ascending. */
	public getPage(request: GridRequestModel): Observable<PagedResponseModel<DutyModel>> {
		return this._http.get<PagedResponseModel<DutyModel>>(`${this._baseUrl}`, { params: toGridHttpParams(request) });
	}

	public getById(dutyId: number): Observable<DutyModel> {
		return this._http.get<DutyModel>(`${this._baseUrl}/${dutyId}`);
	}

	public getResultItems(searchOptions: SearchOptionsModel): Observable<ListResultItemModel[]> {
		return this._http.post<ListResultItemModel[]>(`${this._baseUrl}/getResultItems`, searchOptions);
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
