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
	{ label: 'Paladin', value: JobEnum.Paladin },
	{ label: 'Warrior', value: JobEnum.Warrior },
	{ label: 'Dark Knight', value: JobEnum.DarkKnight },
	{ label: 'Gunbreaker', value: JobEnum.Gunbreaker },

	{ label: 'White Mage', value: JobEnum.WhiteMage },
	{ label: 'Scholar', value: JobEnum.Scholar },
	{ label: 'Astrologian', value: JobEnum.Astrologian },
	{ label: 'Sage', value: JobEnum.Sage },

	{ label: 'Monk', value: JobEnum.Monk },
	{ label: 'Dragoon', value: JobEnum.Dragoon },
	{ label: 'Ninja', value: JobEnum.Ninja },
	{ label: 'Samurai', value: JobEnum.Samurai },
	{ label: 'Reaper', value: JobEnum.Reaper },
	{ label: 'Viper', value: JobEnum.Viper },

	{ label: 'Black Mage', value: JobEnum.BlackMage },
	{ label: 'Summoner', value: JobEnum.Summoner },
	{ label: 'Red Mage', value: JobEnum.RedMage },
	{ label: 'Pictomancer', value: JobEnum.Pictomancer },

	{ label: 'Bard', value: JobEnum.Bard },
	{ label: 'Machinist', value: JobEnum.Machinist },
	{ label: 'Dancer', value: JobEnum.Dancer },

	{ label: 'Blue Mage', value: JobEnum.BlueMage },
	{ label: 'Beast Master', value: JobEnum.BeastMaster },
];
