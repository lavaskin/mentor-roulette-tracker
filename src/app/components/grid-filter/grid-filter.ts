import { DOCUMENT } from '@angular/common';
import { Component, computed, ElementRef, inject, input, linkedSignal, output, signal, viewChild, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectOptionModel } from '@app/models/select-option.model';
import {
	booleanValue,
	countActiveFilters,
	dateRangeValue,
	emptyFilterState,
	filterOptions,
	fromCalendarDate,
	GridFilterDefinition,
	GridFilterState,
	GridFilterValue,
	multiSelectValue,
	toCalendarDate,
	withoutUnavailableOptions,
} from '@app/shared/grid-filter';
import { ButtonModule } from 'primeng/button';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { FocusTrap } from 'primeng/focustrap';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { Popover, PopoverModule } from 'primeng/popover';
import { SelectButtonModule } from 'primeng/selectbutton';

const BOOLEAN_OPTIONS = [
	{ label: 'Any', value: null },
	{ label: 'Yes', value: true },
	{ label: 'No', value: false },
];

/** Option lists longer than this get a search box */
const SEARCHABLE_OPTION_COUNT = 8;

/** Elements that can take focus, minus the hidden edges `pFocusTrap` adds to wrap Tab around */
const FOCUSABLE = 'button, input, select, textarea, [tabindex]';
const NOT_FOCUSABLE = ':disabled, [tabindex="-1"], .p-hidden-focusable';

interface DateRangeDates {
	from: Date | null;
	to: Date | null;
}

let nextId = 0;

/**
 * A "Filters" button that opens a popover of filters for a grid, built from `definitions`. Changes
 * are staged: nothing is emitted until Apply (or Clear, which also applies). Closing the popover any
 * other way throws the pending changes away. The button's badge counts the applied filters in use.
 *
 * The popover behaves like a dialog for keyboard users: opening it moves focus to its first control,
 * Tab stays inside it, and closing it hands focus back to the button.
 */
@Component({
	selector: 'mrt-grid-filter',
	imports: [FormsModule, ButtonModule, PopoverModule, MultiSelectModule, SelectButtonModule, DatePickerModule, FocusTrap],
	templateUrl: './grid-filter.html',
	host: {
		'(body:keydown.escape)': 'keepOpenWhenEscapeClosesAPanel($event)',
	},
})
export class GridFilter {
	public readonly definitions = input.required<readonly GridFilterDefinition[]>();

	/** The applied filters */
	public readonly value = input.required<GridFilterState>();

	/** The new applied filters, on Apply or Clear */
	public readonly apply = output<GridFilterState>();

	protected readonly booleanOptions = BOOLEAN_OPTIONS;
	protected readonly idPrefix = `mrt-grid-filter-${nextId++}`;
	protected readonly panelId = `${this.idPrefix}-panel`;

	protected readonly isOpen = signal(false);

	/** Disclosure state for the trigger. `p-button` only passes these to its inner `<button>` through `pt`. */
	protected readonly triggerPt = computed(() => ({
		root: {
			'aria-haspopup': 'dialog',
			'aria-expanded': this.isOpen(),
			'aria-controls': this.isOpen() ? this.panelId : null,
		},
	}));

	/** What the popover is editing. Follows the applied filters, and is reset to them each time it opens. */
	protected readonly pending = linkedSignal(() => this.value());

	protected readonly activeCount = computed(() => countActiveFilters(this.definitions(), this.value()));
	protected readonly badge = computed(() => this.activeCount() > 0 ? String(this.activeCount()) : undefined);
	protected readonly buttonAriaLabel = computed(() => this.activeCount() > 0 ? `Filters, ${this.activeCount()} applied` : 'Filters');

	// Everything the form controls bind to is computed, so each binding keeps the same reference until its
	// value changes. A fresh array on every check makes NgModel rewrite the control, the control (PrimeNG)
	// marks itself for check, and change detection never settles.

	/** Selected values for each multiselect, by key */
	protected readonly selections = computed(() => {
		const state = this.pending();
		const selections: Record<string, number[]> = {};

		for (const definition of this.definitions()) {
			if (definition.type === 'multiselect') {
				selections[definition.key] = multiSelectValue(state, definition.key);
			}
		}

		return selections;
	});

	/** Options for each multiselect, by key. Some depend on the other pending values. */
	protected readonly options = computed(() => {
		const state = this.pending();
		const options: Record<string, SelectOptionModel[]> = {};

		for (const definition of this.definitions()) {
			if (definition.type === 'multiselect') {
				options[definition.key] = filterOptions(definition, state);
			}
		}

		return options;
	});

	/** Date range ends as Dates, by key. Computed so the pickers keep the same instances until a value changes. */
	protected readonly dates = computed(() => {
		const state = this.pending();
		const dates: Record<string, DateRangeDates> = {};

		for (const definition of this.definitions()) {
			if (definition.type === 'dateRange') {
				const { from, to } = dateRangeValue(state, definition.key);
				dates[definition.key] = { from: fromCalendarDate(from), to: fromCalendarDate(to) };
			}
		}

		return dates;
	});

	private readonly _document = inject(DOCUMENT);
	private readonly _trigger = viewChild.required('trigger', { read: ElementRef<HTMLElement> });
	private readonly _popover = viewChild.required(Popover);
	private readonly _multiSelects = viewChildren(MultiSelect);
	private readonly _datePickers = viewChildren(DatePicker);

	/**
	 * Dropdown and date picker panels open inside the popover. Their hide events fire after the closing
	 * animation, so an Escape that is closing one still counts it here.
	 */
	private _openPanels = 0;

	protected toggle(event: Event): void {
		const popover = this._popover();

		if (!popover.overlayVisible) {
			// State is replaced, never mutated, so sharing the applied object is safe
			this.pending.set(this.value());
			// Panels destroyed with the last popover never reported closing
			this._openPanels = 0;
		}

		popover.toggle(event);
	}

	/** The popover is appended to <body>, so Tab from the button would never reach it */
	protected onOpened(): void {
		this.isOpen.set(true);

		const focusable = this._popover().container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [];
		Array.from(focusable).find((element) => !element.matches(NOT_FOCUSABLE))?.focus();
	}

	/**
	 * The popover is about to remove whatever has focus inside it, which would drop focus to <body>. Hand
	 * it back to the button instead, unless the popover closed because the user clicked into something else.
	 */
	protected onClosed(): void {
		this.isOpen.set(false);

		const active = this._document.activeElement;
		const focusWasInside = this._popover().container?.contains(active) ?? false;
		if (focusWasInside || active === null || active === this._document.body) {
			this._trigger().nativeElement.querySelector('button')?.focus();
		}
	}

	protected panelOpened(): void {
		this._openPanels++;
	}

	protected panelClosed(): void {
		this._openPanels = Math.max(0, this._openPanels - 1);
	}

	/**
	 * The popover closes on any Escape that reaches the document, which would throw away the pending
	 * changes when the user only meant to close a dropdown. So while a panel is open, Escape closes just
	 * that panel and is stopped at <body>, before the popover sees it. A panel that had focus has already
	 * started closing itself (still counted until its animation ends), but focus is often on <body>
	 * after picking an option, so close any that are still open too.
	 */
	protected keepOpenWhenEscapeClosesAPanel(event: Event): void {
		if (this._openPanels === 0 || !this._popover().overlayVisible) return;

		event.stopPropagation();
		this._multiSelects().filter((multiSelect) => multiSelect.overlayVisible).forEach((multiSelect) => multiSelect.hide());
		this._datePickers().filter((datePicker) => datePicker.overlayVisible).forEach((datePicker) => datePicker.hideOverlay());
	}

	protected idFor(definition: GridFilterDefinition): string {
		return `${this.idPrefix}-${definition.key}`;
	}

	protected isSearchable(definition: GridFilterDefinition): boolean {
		return (this.options()[definition.key]?.length ?? 0) > SEARCHABLE_OPTION_COUNT;
	}

	/** Safe to call from the template: it returns a primitive, so it's stable between checks */
	protected flag(key: string): boolean | null {
		return booleanValue(this.pending(), key);
	}

	protected setValue(key: string, value: GridFilterValue): void {
		// Changing one filter can narrow another's options (roles narrow jobs), so drop what's no longer offered
		this.pending.update((state) => withoutUnavailableOptions(this.definitions(), { ...state, [key]: value }));
	}

	protected setDate(key: string, end: keyof DateRangeDates, date: Date | null): void {
		const range = dateRangeValue(this.pending(), key);
		this.setValue(key, { ...range, [end]: date ? toCalendarDate(date) : null });
	}

	protected onApply(): void {
		this.apply.emit(this.pending());
		this._popover().hide();
	}

	protected onClear(): void {
		const empty = emptyFilterState(this.definitions());
		this.pending.set(empty);
		this.apply.emit(empty);
		this._popover().hide();
	}
}
