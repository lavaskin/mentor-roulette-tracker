/**
 * Mirrors the API's `JobSubRoleEnum`: a job's role with DPS split into melee, magical ranged and
 * physical ranged. Sent to the API as the `subRoles` filter. (The API's `JobRoleEnum` is the coarser
 * Tank / Healer / DPS grouping its stats report on.)
 */
export enum JobSubRoleEnum {
	Tank = 0,
	Healer = 1,
	MeleeDps = 2,
	MagicalRangedDps = 3,
	PhysicalRangedDps = 4,
}
