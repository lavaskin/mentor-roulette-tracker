/**
 * Runs before every spec file. Registered as a `setupFiles` entry for the `test` target in angular.json.
 */

// A fixed zone that isn't UTC, so date tests can tell local midnight from UTC midnight on any machine.
// New York is UTC-5 in winter and UTC-4 from the second Sunday in March, so ranges can cross a DST change.
vi.stubEnv('TZ', 'America/New_York');

// jsdom has no layout, so it leaves out these two APIs PrimeNG's dropdowns call when they open. Here
// nothing scrolls and no media query ever matches.
Element.prototype.scrollIntoView ??= () => undefined;

const view = document.defaultView!;
view.matchMedia ??= (query: string): MediaQueryList => ({
	matches: false,
	media: query,
	onchange: null,
	addEventListener: () => undefined,
	removeEventListener: () => undefined,
	addListener: () => undefined,
	removeListener: () => undefined,
	dispatchEvent: () => false,
});
