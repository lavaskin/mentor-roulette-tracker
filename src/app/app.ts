import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./components/navbar/navbar";
import { ToastModule } from 'primeng/toast';

@Component({
	selector: 'mrt-root',
	imports: [RouterOutlet, Navbar, ToastModule],
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App { }
