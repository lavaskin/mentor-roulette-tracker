import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { DutiesPage } from './pages/duties/duties.page';
import { RoulettesPage } from './pages/roulettes.page/roulettes.page';

export const routes: Routes = [
	{ path: '', component: HomePage, },
	{ path: 'roulettes', component: RoulettesPage, },
	{ path: 'duties', component: DutiesPage, },
	{ path: '**', redirectTo: '', },
];
