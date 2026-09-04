/**
 * Role labels as returned by the API (JobRoleEnum.GetLabel), in the order they
 * should be stacked. Tank / Healer / DPS collapses the melee, magical ranged and
 * physical ranged sub-roles into a single DPS bucket.
 */
export const JOB_ROLE_LABELS: string[] = ['Tank', 'Healer', 'DPS'];

export function getOrderedJobRoleLabels(availableLabels: Iterable<string>): string[] {
	const availableLabelSet = new Set(availableLabels);

	return JOB_ROLE_LABELS.filter((label) => availableLabelSet.has(label));
}

export function getJobRoleColorMap(documentStyle: CSSStyleDeclaration): Record<string, string> {
	return {
		'Tank': documentStyle.getPropertyValue('--p-blue-300') || '#93c5fd',
		'Healer': documentStyle.getPropertyValue('--p-emerald-300') || '#6ee7b7',
		'DPS': documentStyle.getPropertyValue('--p-rose-300') || '#fda4af',
	};
}
