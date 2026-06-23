import { isPlatformBrowser } from '@angular/common';
import { ChartData, ChartOptions, Plugin } from 'chart.js';
import { Component, effect, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { PlayedJobDutyBreakdownStatModel } from '@app/models/played-job-duty-breakdown-stat.model';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { createChartTotalLabelPlugin } from '../chart-total-label.plugin';
import { getDutyTypeColorMap, getOrderedDutyTypeLabels } from '../duty-type-chart-config';

@Component({
	selector: 'mrt-job-duty-breakdown-chart',
	imports: [CardModule, ChartModule, SkeletonModule, TagModule],
	templateUrl: './job-duty-breakdown-chart.html',
	styleUrl: './job-duty-breakdown-chart.scss',
})
export class JobDutyBreakdownChart {
	private _platformId = inject(PLATFORM_ID);

	public breakdown = input<PlayedJobDutyBreakdownStatModel[]>([]);
	public isLoading = input(false);
	public chartData = signal<ChartData<'bar'> | null>(null);
	public chartOptions = signal<ChartOptions<'bar'> | null>(null);
	public chartPlugins = signal<Plugin<'bar'>[]>([]);
	public chartHeight = signal(384);

	constructor() {
		effect(() => {
			this.initializeChart(this.breakdown());
		});
	}

	private initializeChart(breakdown: PlayedJobDutyBreakdownStatModel[]): void {
		if (!isPlatformBrowser(this._platformId) || breakdown.length === 0) {
			this.chartData.set(null);
			this.chartOptions.set(null);
			this.chartPlugins.set([]);
			this.chartHeight.set(384);
			return;
		}

		const documentStyle = getComputedStyle(document.documentElement);
		const textColor = 'rgba(248, 250, 252, 0.96)';
		const textMutedColor = 'rgba(226, 232, 240, 0.82)';
		const surfaceBorder = 'rgba(148, 163, 184, 0.22)';
		const fallbackColor = documentStyle.getPropertyValue('--p-slate-300') || '#cbd5e1';
		const dutyTypeLabels = getOrderedDutyTypeLabels(
			breakdown.flatMap((group) => group.dutyTypes.map((dutyType) => dutyType.dutyTypeLabel)),
		);
		const dutyTypeColorMap = getDutyTypeColorMap(documentStyle);

		this.chartHeight.set(Math.max(384, breakdown.length * 52));

		this.chartData.set({
			labels: breakdown.map((group) => group.jobLabel),
			datasets: dutyTypeLabels.map((dutyTypeLabel) => ({
				type: 'bar',
				label: dutyTypeLabel,
				data: breakdown.map(
					(group) => group.dutyTypes.find((dutyType) => dutyType.dutyTypeLabel === dutyTypeLabel)?.count ?? 0,
				),
				backgroundColor: dutyTypeColorMap[dutyTypeLabel] ?? fallbackColor,
				borderColor: dutyTypeColorMap[dutyTypeLabel] ?? fallbackColor,
				borderWidth: 1,
				borderRadius: 4,
				borderSkipped: false,
			})),
		});

		this.chartPlugins.set([createChartTotalLabelPlugin('y', textColor)]);

		this.chartOptions.set({
			indexAxis: 'y',
			responsive: true,
			maintainAspectRatio: false,
			layout: {
				padding: {
					right: 42,
				},
			},
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
					beginAtZero: true,
					ticks: {
						color: textMutedColor,
						precision: 0,
					},
					grid: {
						color: surfaceBorder,
					},
					title: {
						display: true,
						text: 'Number of duties',
						color: textColor,
					},
				},
				y: {
					stacked: true,
					ticks: {
						color: textMutedColor,
					},
					grid: {
						display: false,
					},
				},
			},
		});
	}
}
