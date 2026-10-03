import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { emptyFilterState, GridFilterDefinition, GridFilterState, multiSelectValue } from '@app/shared/grid-filter';
import { MultiSelect } from 'primeng/multiselect';
import { Popover } from 'primeng/popover';
import { GridFilter } from './grid-filter';

const DEFINITIONS: GridFilterDefinition[] = [
	{ type: 'multiselect', key: 'roles', label: 'Role', param: 'roles', options: [{ label: 'Tank', value: 0 }, { label: 'Healer', value: 1 }] },
	{
		type: 'multiselect',
		key: 'jobs',
		label: 'Job',
		param: 'jobs',
		options: (state) => {
			const jobs = [{ label: 'Paladin', value: 0, role: 0 }, { label: 'Sage', value: 103, role: 1 }];
			const roles = multiSelectValue(state, 'roles');
			return roles.length ? jobs.filter(job => roles.includes(job.role)) : jobs;
		},
	},
	{ type: 'boolean', key: 'completed', label: 'Completed', param: 'completed' },
	{ type: 'dateRange', key: 'played', label: 'Date Ran', fromParam: 'playedFrom', beforeParam: 'playedBefore' },
];

@Component({
	imports: [GridFilter],
	template: `<mrt-grid-filter [definitions]="definitions" [value]="value()" (apply)="applied.push($event); value.set($event)" />`,
})
class Host {
	definitions = DEFINITIONS;
	value = signal<GridFilterState>(emptyFilterState(DEFINITIONS));
	applied: GridFilterState[] = [];
}

describe('GridFilter', () => {
	let fixture: ComponentFixture<Host>;
	let host: Host;

	beforeEach(() => {
		fixture = TestBed.createComponent(Host);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		popover().hide();
		fixture.destroy();
	});

	function popover(): Popover {
		return fixture.debugElement.query(By.directive(Popover)).componentInstance;
	}

	function filtersButton(): HTMLButtonElement {
		return fixture.nativeElement.querySelector('p-button button');
	}

	function open(): void {
		filtersButton().click();
		fixture.detectChanges();
	}

	function multiSelect(label: string) {
		const index = DEFINITIONS.filter(d => d.type === 'multiselect').findIndex(d => d.label === label);
		return fixture.debugElement.queryAll(By.directive(MultiSelect))[index];
	}

	function choose(label: string, values: number[]): void {
		multiSelect(label).triggerEventHandler('ngModelChange', values);
		fixture.detectChanges();
	}

	function clickButton(label: string): void {
		// Select button options are role="button" elements rather than <button>s
		const button = Array.from<HTMLElement>(document.body.querySelectorAll('.p-popover button, .p-popover [role="button"]'))
			.find(b => b.textContent?.trim() === label)!;
		button.click();
		fixture.detectChanges();
	}

	/**
	 * Lets PrimeNG's open and close animations finish, so the panel events they fire have fired.
	 * Dropdown panels wait a couple of animation frames before they start.
	 */
	async function settle(): Promise<void> {
		for (let frame = 0; frame < 4; frame++) {
			fixture.detectChanges();
			await fixture.whenStable();
			await new Promise((resolve) => requestAnimationFrame(resolve));
		}
	}

	async function pressEscape(): Promise<void> {
		document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await settle();
	}

	function badge(): string | undefined {
		return fixture.nativeElement.querySelector('.p-badge')?.textContent?.trim();
	}

	it('does not rewrite its controls on every change detection', async () => {
		// Regression: binding a fresh [] each check made NgModel rewrite the multiselect, which marks
		// itself for check, so the browser re-rendered forever. No values at all hits the fallbacks.
		host.value.set({});
		fixture.detectChanges();
		open();
		await fixture.whenStable();

		const writeValue = vi.spyOn(MultiSelect.prototype, 'writeValue');
		for (let i = 0; i < 3; i++) {
			fixture.detectChanges();
			await fixture.whenStable();
		}

		expect(writeValue).not.toHaveBeenCalled();
		writeValue.mockRestore();
	});

	it('only creates its controls while open', () => {
		expect(fixture.debugElement.queryAll(By.directive(MultiSelect))).toHaveLength(0);

		open();

		expect(fixture.debugElement.queryAll(By.directive(MultiSelect))).toHaveLength(2);
	});

	it('moves focus to the first filter when it opens and back to the button when it closes', async () => {
		filtersButton().focus();
		expect(filtersButton().getAttribute('aria-expanded')).toBe('false');
		expect(filtersButton().getAttribute('aria-haspopup')).toBe('dialog');

		open();
		await settle();

		const panel = document.body.querySelector<HTMLElement>('.p-popover [id$="-panel"]')!;
		expect(document.activeElement?.id).toMatch(/-roles$/);
		expect(filtersButton().getAttribute('aria-expanded')).toBe('true');
		expect(filtersButton().getAttribute('aria-controls')).toBe(panel.id);

		clickButton('Apply');
		await settle();

		expect(document.activeElement).toBe(filtersButton());
		expect(filtersButton().getAttribute('aria-expanded')).toBe('false');
		expect(filtersButton().hasAttribute('aria-controls')).toBe(false);
	});

	it('leaves focus alone when the popover closes because the user moved it elsewhere', async () => {
		const elsewhere = document.body.appendChild(document.createElement('input'));
		open();
		await settle();

		elsewhere.focus();
		popover().hide();
		await settle();

		expect(document.activeElement).toBe(elsewhere);
		elsewhere.remove();
	});

	it('wraps Tab around inside the popover', async () => {
		open();
		await settle();
		const panel = document.body.querySelector<HTMLElement>('.p-popover [id$="-panel"]')!;
		const apply = Array.from(panel.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Apply')!;

		// Tab off the last button lands on the trap's hidden end, which sends focus back to the start. A
		// browser picks the first filter. jsdom's querySelectorAll returns buttons before inputs, so which
		// control it picks isn't checked, only that focus wrapped and stayed inside.
		apply.focus();
		panel.querySelector<HTMLElement>(':scope > .p-hidden-focusable:last-child')!.focus();

		const active = document.activeElement!;
		expect(panel.contains(active)).toBe(true);
		expect(active).not.toBe(apply);
		expect(active.classList.contains('p-hidden-focusable')).toBe(false);
	});

	it('opens a popover with a field for every filter', () => {
		open();

		expect(popover().overlayVisible).toBe(true);
		const text = document.body.querySelector('.p-popover')!.textContent;
		for (const definition of DEFINITIONS) {
			expect(text).toContain(definition.label);
		}
	});

	it('emits nothing until Apply, then emits the pending filters and closes', () => {
		open();
		choose('Role', [1]);
		clickButton('Yes');

		expect(host.applied).toEqual([]);

		clickButton('Apply');

		expect(host.applied).toHaveLength(1);
		expect(host.applied[0]['roles']).toEqual([1]);
		expect(host.applied[0]['completed']).toBe(true);
		expect(popover().overlayVisible).toBe(false);
	});

	it('badges the button with the number of applied filters in use', () => {
		expect(badge()).toBeUndefined();

		host.value.set({ ...emptyFilterState(DEFINITIONS), roles: [0, 1], completed: false });
		fixture.detectChanges();

		expect(badge()).toBe('2');
		expect(filtersButton().getAttribute('aria-label')).toBe('Filters, 2 applied');
	});

	it('Clear applies no filters right away and closes', () => {
		host.value.set({ ...emptyFilterState(DEFINITIONS), roles: [0], completed: true });
		fixture.detectChanges();
		open();

		clickButton('Clear');

		expect(host.applied).toEqual([emptyFilterState(DEFINITIONS)]);
		expect(popover().overlayVisible).toBe(false);
		expect(badge()).toBeUndefined();
	});

	it('throws away unapplied changes when closed some other way', async () => {
		open();
		choose('Role', [0]);
		popover().hide();
		fixture.detectChanges();

		open();
		await fixture.whenStable(); // NgModel writes to the new control asynchronously

		expect(multiSelect('Role').componentInstance.modelValue()).toEqual([]);
		expect(host.applied).toEqual([]);
	});

	it('closes just the open dropdown on Escape, and the popover on the next one', async () => {
		open();
		choose('Role', [1]);
		const roles: MultiSelect = multiSelect('Role').componentInstance;
		roles.show();
		await settle();
		expect(roles.overlayVisible).toBe(true);

		// After picking an option focus is usually on <body>, so the dropdown never sees the Escape itself
		(document.activeElement as HTMLElement | null)?.blur();
		await pressEscape();
		expect(roles.overlayVisible).toBe(false);
		expect(popover().overlayVisible).toBe(true);

		await pressEscape();
		expect(popover().overlayVisible).toBe(false);
		expect(host.applied).toEqual([]);
	});

	it('narrows dependent options and drops selections they no longer offer', () => {
		open();
		choose('Job', [0, 103]);

		choose('Role', [1]);

		expect(multiSelect('Job').componentInstance.options.map((o: { label: string }) => o.label)).toEqual(['Sage']);
		clickButton('Apply');
		expect(host.applied[0]['jobs']).toEqual([103]);
	});
});
