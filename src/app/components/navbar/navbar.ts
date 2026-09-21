import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { filter, map, startWith } from 'rxjs';

type NavTab = {
	label: string;
	path: string;
	icon: string;
	exact?: boolean;
};

@Component({
	selector: 'mrt-navbar',
	imports: [TabsModule, RouterLink],
	templateUrl: './navbar.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
	private readonly router = inject(Router);

	/** Keep tab chrome transparent so it matches the app header background. */
	public readonly tabsDt = {
		tablist: {
			background: 'transparent',
			borderColor: 'transparent',
		},
	};

	public readonly tabs = signal<NavTab[]>([
		{ label: 'Home', path: '/', icon: 'pi pi-home', exact: true },
		{ label: 'Roulettes', path: '/roulettes', icon: 'pi pi-list' },
		{ label: 'Duties', path: '/duties', icon: 'pi pi-bookmark' },
		{ label: 'Spin', path: '/spin', icon: 'pi pi-sync' },
	]);

	private readonly url = toSignal(
		this.router.events.pipe(
			filter((event): event is NavigationEnd => event instanceof NavigationEnd),
			map(() => this.router.url),
			startWith(this.router.url),
		),
		{ initialValue: this.router.url },
	);

	public readonly activePath = computed(() => {
		const url = this.url().split('?')[0] || '/';
		const match = this.tabs().find((tab) =>
			tab.exact ? url === tab.path : url === tab.path || url.startsWith(`${tab.path}/`),
		);
		return match?.path ?? '/';
	});

	public onTabChange(path: string | number | undefined): void {
		if (typeof path !== 'string' || path === this.activePath()) {
			return;
		}
		void this.router.navigateByUrl(path);
	}
}
