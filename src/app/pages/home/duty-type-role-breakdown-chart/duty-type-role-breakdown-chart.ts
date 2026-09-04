import { isPlatformBrowser } from '@angular/common';
import { ChartData, ChartOptions, Plugin } from 'chart.js';
import { Component, effect, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { DutyTypeRoleBreakdownStatModel } from '@app/models/duty-type-role-breakdown-stat.model';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { createChartTotalLabelPlugin } from '../chart-total-label.plugin';
import { getJobRoleColorMap, getOrderedJobRoleLabels } from '../job-role-chart-config';

@Component({
	selector: 'mrt-duty-type-role-breakdown-chart',
	imports: [CardModule, ChartModule, SkeletonModule, TagModule],
	templateUrl: './duty-type-role-breakdown-chart.html',
	styleUrl: './duty-type-role-breakdown-chart.scss',
})
export class DutyTypeRoleBreakdownChart {
	private _platformId = inject(PLATFORM_ID);

	public breakdown = input<DutyTypeRoleBreakdownStatModel[]>([]);
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

	private initializeChart(breakdown: DutyTypeRoleBreakdownStatModel[]): void {
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
		const roleLabels = getOrderedJobRoleLabels(
			breakdown.flatMap((group) => group.roles.map((role) => role.roleLabel)),
		);
		const roleColorMap = getJobRoleColorMap(documentStyle);

		// The API already orders duty types by total frequency descending, but sort
		// defensively so the chart never relies on payload ordering.
		const sortedBreakdown = [...breakdown].sort((first, second) => second.count - first.count);

		this.chartHeight.set(Math.max(384, sortedBreakdown.length * 52));

		this.chartData.set({
			labels: sortedBreakdown.map((group) => group.dutyTypeLabel),
			datasets: roleLabels.map((roleLabel) => ({
				type: 'bar',
				label: roleLabel,
				data: sortedBreakdown.map(
					(group) => group.roles.find((role) => role.roleLabel === roleLabel)?.count ?? 0,
				),
				backgroundColor: roleColorMap[roleLabel] ?? fallbackColor,
				borderColor: roleColorMap[roleLabel] ?? fallbackColor,
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
