import { Component, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ButtonModule } from 'primeng/button';

@Component({
	selector: 'mrt-navbar',
	imports: [RouterLink, ButtonModule],
	templateUrl: './navbar.html',
	styleUrl: './navbar.scss',
})
export class Navbar {
	public links = signal([
		{ label: 'Home', path: '/' },
		{ label: 'Roulettes', path: '/roulettes' },
		{ label: 'Duties', path: '/duties' },
	]);
}
