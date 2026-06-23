import { Chart, Plugin } from 'chart.js';

type SupportedAxis = 'x' | 'y';

function getNumericValue(value: unknown): number {
	return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function getStackTotals(chart: Chart<'bar'>): number[] {
	const labelCount = chart.data.labels?.length ?? 0;

	return Array.from({ length: labelCount }, (_, dataIndex) =>
		chart.data.datasets.reduce((sum, dataset, datasetIndex) => {
			if (!chart.isDatasetVisible(datasetIndex)) {
				return sum;
			}

			return sum + getNumericValue(dataset.data[dataIndex]);
		}, 0),
	);
}

export function createChartTotalLabelPlugin(indexAxis: SupportedAxis, color: string): Plugin<'bar'> {
	return {
		id: `chart-total-labels-${indexAxis}`,
		afterDatasetsDraw(chart) {
			const totals = getStackTotals(chart);
			const xScale = chart.scales['x'];
			const yScale = chart.scales['y'];

			if (!xScale || !yScale) {
				return;
			}

			const { ctx } = chart;
			ctx.save();
			ctx.fillStyle = color;
			ctx.font = '600 12px system-ui';

			if (indexAxis === 'y') {
				ctx.textAlign = 'left';
				ctx.textBaseline = 'middle';

				totals.forEach((total, dataIndex) => {
					if (total <= 0) {
						return;
					}

					ctx.fillText(`${total}`, xScale.getPixelForValue(total) + 8, yScale.getPixelForValue(dataIndex));
				});
			} else {
				ctx.textAlign = 'center';
				ctx.textBaseline = 'bottom';

				totals.forEach((total, dataIndex) => {
					if (total <= 0) {
						return;
					}

					ctx.fillText(`${total}`, xScale.getPixelForValue(dataIndex), yScale.getPixelForValue(total) - 6);
				});
			}

			ctx.restore();
		},
	};
}
