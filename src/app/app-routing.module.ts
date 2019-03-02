import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeaderboardsComponent } from './leaderboards/leaderboards.component';

const routes: Routes = [
  {path: '', redirectTo: 'Leaderboards', pathMatch: 'full'},
  {path: 'Leaderboards', component: LeaderboardsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
