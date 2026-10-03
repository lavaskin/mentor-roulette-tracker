import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JobSpinWheel } from '@app/components/job-spin-wheel/job-spin-wheel';
import {
	getJobsForCategory,
	getRoleSegments,
	jobsToSegments,
	SPIN_CATEGORY_OPTIONS,
	SpinCategory,
	SpinSegment,
} from '@app/data/jobs.data';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';

@Component({
	selector: 'mrt-page-job-spin',
	imports: [
		ButtonModule,
		CardModule,
		CheckboxModule,
		FormsModule,
		JobSpinWheel,
		SelectButtonModule,
		TagModule,
	],
	templateUrl: './job-spin.page.html',
	styleUrl: './job-spin.page.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobSpinPage {
	public readonly categoryOptions = SPIN_CATEGORY_OPTIONS;
	public readonly category = signal<SpinCategory>('all');
	public readonly enabledIds = signal<Set<string>>(this.defaultEnabledIds('all'));
	public readonly lastResult = signal<SpinSegment | null>(null);
	public readonly isWheelSpinning = signal(false);

	public readonly isRolesMode = computed(() => this.category() === 'roles');

	/** Every segment the category offers, enabled or not */
	public readonly toggleItems = computed<SpinSegment[]>(() => this.segmentsFor(this.category()));

	public readonly segments = computed<SpinSegment[]>(() => {
		const enabled = this.enabledIds();
		return this.toggleItems().filter((segment) => enabled.has(segment.id));
	});

	public onCategoryChange(value: SpinCategory | null | undefined): void {
		const next = value ?? 'all';
		this.category.set(next);
		this.enabledIds.set(this.defaultEnabledIds(next));
		this.lastResult.set(null);
	}

	public isEnabled(id: string): boolean {
		return this.enabledIds().has(id);
	}

	public toggleId(id: string, checked: boolean): void {
		this.enabledIds.update((current) => {
			const next = new Set(current);
			if (checked) {
				next.add(id);
			} else {
				next.delete(id);
			}
			return next;
		});
		this.lastResult.set(null);
	}

	public selectAllToggles(): void {
		this.enabledIds.set(new Set(this.toggleItems().map((item) => item.id)));
		this.lastResult.set(null);
	}

	public clearAllToggles(): void {
		this.enabledIds.set(new Set());
		this.lastResult.set(null);
	}

	public onWheelSpinningChange(spinning: boolean): void {
		this.isWheelSpinning.set(spinning);
	}

	public onLanded(segment: SpinSegment): void {
		this.lastResult.set(segment);
	}

	public resultTitle(segment: SpinSegment): string {
		if (segment.sublabel) {
			return `${segment.label} — ${segment.sublabel}`;
		}
		return segment.label;
	}

	private defaultEnabledIds(category: SpinCategory): Set<string> {
		return new Set(this.segmentsFor(category).map((segment) => segment.id));
	}

	private segmentsFor(category: SpinCategory): SpinSegment[] {
		return category === 'roles' ? getRoleSegments() : jobsToSegments(getJobsForCategory(category));
	}
}
