import {
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	input,
	output,
	signal,
} from '@angular/core';
import { SpinSegment } from '@app/data/jobs.data';
import { ButtonModule } from 'primeng/button';

@Component({
	selector: 'mrt-job-spin-wheel',
	imports: [ButtonModule],
	templateUrl: './job-spin-wheel.html',
	styleUrl: './job-spin-wheel.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobSpinWheel {
	public readonly segments = input.required<SpinSegment[]>();
	public readonly landed = output<SpinSegment>();
	public readonly spinningChange = output<boolean>();

	public readonly isSpinning = signal(false);
	public readonly rotationDeg = signal(0);

	/** Frozen while spinning so pool edits don't reshape the wheel mid-animation. */
	private readonly displaySegments = signal<SpinSegment[]>([]);
	private pendingWinner: SpinSegment | null = null;

	public readonly canSpin = computed(
		() => this.displaySegments().length > 0 && !this.isSpinning(),
	);

	public readonly conicGradient = computed(() => {
		const items = this.displaySegments();
		if (items.length === 0) {
			return 'conic-gradient(#334155 0deg 360deg)';
		}

		if (items.length === 1) {
			return `conic-gradient(${items[0].color} 0deg 360deg)`;
		}

		const slice = 360 / items.length;
		const stops = items
			.map((segment, index) => {
				const start = index * slice;
				const end = (index + 1) * slice;
				return `${segment.color} ${start}deg ${end}deg`;
			})
			.join(', ');

		return `conic-gradient(${stops})`;
	});

	public readonly labelPositions = computed(() => {
		const items = this.displaySegments();
		if (items.length === 0) {
			return [];
		}

		const slice = 360 / items.length;

		return items.map((segment, index) => {
			// Mid-angle of slice from 12 o'clock, clockwise. Convert to CSS position (0deg = 3 o'clock).
			const midFromTop = index * slice + slice / 2;
			const cssAngle = midFromTop - 90;
			const radians = (cssAngle * Math.PI) / 180;
			const radiusPercent = 34;
			const x = 50 + radiusPercent * Math.cos(radians);
			const y = 50 + radiusPercent * Math.sin(radians);

			return {
				id: segment.id,
				label: segment.label,
				left: `${x}%`,
				top: `${y}%`,
				// Rotate label with its segment so it stays readable relative to the slice
				rotate: `${midFromTop}deg`,
			};
		});
	});

	public constructor() {
		effect(() => {
			const segments = this.segments();
			if (!this.isSpinning()) {
				this.displaySegments.set(segments);
			}
		});
	}

	public spin(): void {
		const items = this.displaySegments();
		if (items.length === 0 || this.isSpinning()) {
			return;
		}

		const index = this.pickIndex(items.length);
		this.pendingWinner = items[index] ?? null;

		const slice = 360 / items.length;
		// conic-gradient starts at 12 o'clock and goes clockwise; pointer is also at the top.
		// Positive CSS rotate is clockwise. Bring the chosen segment's center back under the pointer.
		const segmentCenter = index * slice + slice / 2;
		const targetModulo = (360 - segmentCenter) % 360;
		const extraTurns = 5 + Math.floor(Math.random() * 4); // 5–8 full spins
		const current = this.rotationDeg();
		const currentModulo = ((current % 360) + 360) % 360;
		let delta = targetModulo - currentModulo;
		if (delta < 0) {
			delta += 360;
		}
		// Nudge slightly so we don't always land dead-center (still within slice)
		const jitter = (Math.random() - 0.5) * slice * 0.5;
		const next = current + extraTurns * 360 + delta + jitter;

		this.setSpinning(true);
		// Force a frame so transition always runs even if values are close
		requestAnimationFrame(() => this.rotationDeg.set(next));
	}

	public onTransitionEnd(event: TransitionEvent): void {
		if (
			event.target !== event.currentTarget ||
			event.propertyName !== 'transform' ||
			!this.isSpinning()
		) {
			return;
		}

		this.setSpinning(false);

		const winner = this.pendingWinner;
		this.pendingWinner = null;
		if (winner) {
			this.landed.emit(winner);
		}
	}

	private setSpinning(value: boolean): void {
		this.isSpinning.set(value);
		this.spinningChange.emit(value);
	}

	private pickIndex(length: number): number {
		if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
			const buffer = new Uint32Array(1);
			crypto.getRandomValues(buffer);
			return buffer[0] % length;
		}
		return Math.floor(Math.random() * length);
	}
}
