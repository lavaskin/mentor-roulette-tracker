import { isPlatformBrowser } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { Component, effect, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { DutyExpansionBreakdownStatModel } from '@app/models/duty-expansion-breakdown-stat.model';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

@Component({
	selector: 'mrt-duty-breakdown-chart',
	imports: [CardModule, ChartModule, SkeletonModule, TagModule],
	templateUrl: './duty-breakdown-chart.html',
	styleUrl: './duty-breakdown-chart.scss',
})
export class DutyBreakdownChart {
	private _platformId = inject(PLATFORM_ID);

	public breakdown = input<DutyExpansionBreakdownStatModel[]>([]);
	public isLoading = input(false);
	public chartData = signal<ChartData<'bar'> | null>(null);
	public chartOptions = signal<ChartOptions<'bar'> | null>(null);

	constructor() {
		effect(() => {
			this.initializeChart(this.breakdown());
		});
	}

	private initializeChart(breakdown: DutyExpansionBreakdownStatModel[]): void {
		if (!isPlatformBrowser(this._platformId) || breakdown.length === 0) {
			this.chartData.set(null);
			this.chartOptions.set(null);
			return;
		}

		const documentStyle = getComputedStyle(document.documentElement);
		const textColor = 'rgba(248, 250, 252, 0.96)';
		const textMutedColor = 'rgba(226, 232, 240, 0.82)';
		const surfaceBorder = 'rgba(148, 163, 184, 0.22)';
		const dutyTypeLabels = Array.from(
			new Set(breakdown.flatMap((group) => group.dutyTypes.map((dutyType) => dutyType.dutyTypeLabel))),
		);
		const palette = [
			documentStyle.getPropertyValue('--p-cyan-300') || '#67e8f9',
			documentStyle.getPropertyValue('--p-orange-300') || '#fdba74',
			documentStyle.getPropertyValue('--p-emerald-300') || '#6ee7b7',
			documentStyle.getPropertyValue('--p-indigo-300') || '#a5b4fc',
			documentStyle.getPropertyValue('--p-rose-300') || '#fda4af',
			documentStyle.getPropertyValue('--p-amber-300') || '#fcd34d',
			documentStyle.getPropertyValue('--p-teal-300') || '#5eead4',
			documentStyle.getPropertyValue('--p-violet-300') || '#c4b5fd',
		];

		this.chartData.set({
			labels: breakdown.map((group) => group.expansionLabel),
			datasets: dutyTypeLabels.map((dutyTypeLabel, index) => ({
				type: 'bar',
				label: dutyTypeLabel,
				data: breakdown.map(
					(group) => group.dutyTypes.find((dutyType) => dutyType.dutyTypeLabel === dutyTypeLabel)?.count ?? 0,
				),
				backgroundColor: palette[index % palette.length],
				borderColor: palette[index % palette.length],
				borderWidth: 1,
				borderRadius: 4,
				borderSkipped: false,
			})),
		});

		this.chartOptions.set({
			responsive: true,
			maintainAspectRatio: false,
			aspectRatio: 1.7,
			plugins: {
				legend: {
					position: 'bottom',
					labels: {
						color: textColor,
						usePointStyle: true,
						padding: 18,
					},
				},
				tooltip: {
					mode: 'index',
					intersect: false,
				},
			},
			scales: {
				x: {
					stacked: true,
					ticks: {
						color: textMutedColor,
					},
					grid: {
						color: surfaceBorder,
					},
				},
				y: {
					stacked: true,
					beginAtZero: true,
					ticks: {
						color: textMutedColor,
						precision: 0,
					},
					grid: {
						color: surfaceBorder,
					},
				},
			},
		});
	}
}
