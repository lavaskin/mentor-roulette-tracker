import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { environment } from "environments/environment";

export class MentorRouletteLogService {
	private _baseUrl: string = `${environment.apiBaseUrl}/mentorroulette`;

	private _http: HttpClient = inject(HttpClient);

	// ...
}
