export interface AutocompleteOptionModel {
	label?: string;
	value?: number;
}

export abstract class AutocompleteSelectionBase<TOption extends AutocompleteOptionModel> {
	private _selectedId?: number;
	private _selectedLabel?: string;

	public selectedOption?: TOption;

	protected setSelectedId(value: number | undefined, resolver?: (id: number) => TOption | undefined): void {
		this._selectedId = value;
		this.syncSelectedOption(resolver);
	}

	protected getSelectedId(): number | undefined {
		return this._selectedId;
	}

	protected setSelectedLabel(value: string | undefined, resolver?: (id: number) => TOption | undefined): void {
		this._selectedLabel = value;
		this.syncSelectedOption(resolver);
	}

	protected getSelectedLabel(): string | undefined {
		return this._selectedLabel;
	}

	protected handleModelChange(value: TOption | undefined): number | undefined {
		this.selectedOption = value;
		this._selectedId = value?.value;
		this._selectedLabel = value?.label;
		return value?.value;
	}

	private syncSelectedOption(resolver?: (id: number) => TOption | undefined): void {
		if (this._selectedId == null) {
			this.selectedOption = undefined;
			return;
		}

		this.selectedOption = resolver?.(this._selectedId) ?? {
			value: this._selectedId,
			label: this._selectedLabel ?? this.selectedOption?.label,
		} as TOption;
	}
}