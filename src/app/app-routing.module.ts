import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeaderboardsComponent } from './leaderboards/leaderboards.component';
import { PlayerStatsComponent } from './player-stats/player-stats.component';
import { RegisterComponent } from './register/register.component';
import { CompareComponent } from './compare/compare.component';

const routes: Routes = [
  {path: '', redirectTo: 'Leaderboards', pathMatch: 'full'},
  {path: 'Leaderboards', component: LeaderboardsComponent},
  {path: 'PlayerStats', component: PlayerStatsComponent},  
  {path: 'Compare', component: CompareComponent},  
  {path: 'Register', component: RegisterComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
