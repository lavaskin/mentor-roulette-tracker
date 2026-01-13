import { DutyTypeEnum } from "@app/models/enums/duty-type.enum";
import { ExpansionEnum } from "@app/models/enums/expansion.enum";
import { JobEnum } from "@app/models/enums/jobs.enum";
import { SelectOptionModel } from "@app/models/select-option.model";

export const DutiesSelectOptions: SelectOptionModel[] = [
	{ label: 'Guildhest', value: DutyTypeEnum.Guildhest },
	{ label: 'Dungeon', value: DutyTypeEnum.Dungeon },
	{ label: 'Trial', value: DutyTypeEnum.Trial },
	{ label: 'Extreme Trial', value: DutyTypeEnum.ExtremeTrial },
	{ label: 'Normal Raid', value: DutyTypeEnum.NormalRaid },
	{ label: 'Alliance Raid', value: DutyTypeEnum.AllianceRaid },
	{ label: 'Unreal Trial', value: DutyTypeEnum.UnrealTrial },
	{ label: 'Chaotic Alliance Raid', value: DutyTypeEnum.ChaoticAllianceRaid },
	{ label: 'Ultimate Raid', value: DutyTypeEnum.UltimateRaid },
];

export const ExpansionsSelectOptions: SelectOptionModel[] = [
	{ label: 'A Realm Reborn', value: ExpansionEnum.ARealmReborn },
	{ label: 'Heavensward', value: ExpansionEnum.Heavensward },
	{ label: 'Stormblood', value: ExpansionEnum.Stormblood },
	{ label: 'Shadowbringers', value: ExpansionEnum.Shadowbringers },
	{ label: 'Endwalker', value: ExpansionEnum.Endwalker },
	{ label: 'Dawntrail', value: ExpansionEnum.Dawntrail },
];

export const JobSelectOptions: SelectOptionModel[] = [
	{ label: 'PLD | Paladin', value: JobEnum.Paladin },
	{ label: 'WAR | Warrior', value: JobEnum.Warrior },
	{ label: 'DRK | Dark Knight', value: JobEnum.DarkKnight },
	{ label: 'GNB | Gunbreaker', value: JobEnum.Gunbreaker },

	{ label: 'WHM | White Mage', value: JobEnum.WhiteMage },
	{ label: 'SCH | Scholar', value: JobEnum.Scholar },
	{ label: 'AST | Astrologian', value: JobEnum.Astrologian },
	{ label: 'SGE | Sage', value: JobEnum.Sage },

	{ label: 'MNK | Monk', value: JobEnum.Monk },
	{ label: 'DRG | Dragoon', value: JobEnum.Dragoon },
	{ label: 'NIN | Ninja', value: JobEnum.Ninja },
	{ label: 'SAM | Samurai', value: JobEnum.Samurai },
	{ label: 'RPR | Reaper', value: JobEnum.Reaper },
	{ label: 'VPR | Viper', value: JobEnum.Viper },

	{ label: 'BLM | Black Mage', value: JobEnum.BlackMage },
	{ label: 'SMN | Summoner', value: JobEnum.Summoner },
	{ label: 'RDM | Red Mage', value: JobEnum.RedMage },
	{ label: 'PCT | Pictomancer', value: JobEnum.Pictomancer },

	{ label: 'BRD | Bard', value: JobEnum.Bard },
	{ label: 'MCH | Machinist', value: JobEnum.Machinist },
	{ label: 'DNC | Dancer', value: JobEnum.Dancer },

	{ label: 'BLU | Blue Mage', value: JobEnum.BlueMage },
	{ label: 'BST | Beast Master', value: JobEnum.BeastMaster },
];
