import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Passes transient state between pages over router navigation state.
 *
 * The payload lives on the history entry rather than the URL, so it never shows up
 * in a bookmark. It is cleared as soon as it is read so a browser refresh (which
 * restores `history.state`) does not replay the handoff.
 */
@Injectable({ providedIn: 'root' })
export class NavigationHandoffService {
	private _router: Router = inject(Router);

	public navigateWith<T>(commands: unknown[], key: string, payload: T): Promise<boolean> {
		return this._router.navigate(commands, { state: { [key]: payload } });
	}

	public consume<T>(key: string): T | null {
		const state = history.state as Record<string, unknown> | null;
		const payload = state?.[key] as T | undefined;

		if (payload === undefined || payload === null) {
			return null;
		}

		const { [key]: _consumed, ...rest } = state as Record<string, unknown>;
		history.replaceState(rest, '');

		return payload;
	}
}
