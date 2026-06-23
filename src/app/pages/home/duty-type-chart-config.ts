import { DutiesSelectOptions } from '@app/data/select-options.data';

export function getOrderedDutyTypeLabels(availableLabels: Iterable<string>): string[] {
	const availableLabelSet = new Set(availableLabels);

	return DutiesSelectOptions
		.map((option) => option.label)
		.filter((label) => availableLabelSet.has(label));
}

export function getDutyTypeColorMap(documentStyle: CSSStyleDeclaration): Record<string, string> {
	return {
		'Guildhest': documentStyle.getPropertyValue('--p-emerald-300') || '#6ee7b7',
		'Dungeon': documentStyle.getPropertyValue('--p-cyan-300') || '#67e8f9',
		'Trial': documentStyle.getPropertyValue('--p-orange-300') || '#fdba74',
		'Extreme Trial': documentStyle.getPropertyValue('--p-rose-300') || '#fda4af',
		'Normal Raid': documentStyle.getPropertyValue('--p-indigo-300') || '#a5b4fc',
		'Alliance Raid': documentStyle.getPropertyValue('--p-amber-300') || '#fcd34d',
		// 'Unreal Trial': documentStyle.getPropertyValue('--p-teal-300') || '#5eead4',
		// 'Chaotic Alliance Raid': documentStyle.getPropertyValue('--p-violet-300') || '#c4b5fd',
		// 'Ultimate Raid': documentStyle.getPropertyValue('--p-lime-300') || '#bef264',
	};
}
