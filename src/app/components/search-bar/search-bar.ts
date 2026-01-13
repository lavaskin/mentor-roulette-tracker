import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

const DEBOUNCE_DELAY = 300;

@Component({
	selector: 'mrt-search-bar',
	imports: [FormsModule, InputTextModule, IconFieldModule, InputIconModule],
	templateUrl: './search-bar.html',
	styleUrl: './search-bar.scss',
})
export class SearchBar {
	@Input() ngModel: string = '';
	@Output() ngModelChange: EventEmitter<string> = new EventEmitter<string>();

	@Input() placeholder: string = 'Search...';
	@Input() size: 'small' | 'medium' | 'large' = 'medium';

	private debounceTimeout: any;

	public onInputChange(value: string): void {
		clearTimeout(this.debounceTimeout);
		this.debounceTimeout = setTimeout(() => {
			this.ngModelChange.emit(value);
		}, DEBOUNCE_DELAY);
	}
}
