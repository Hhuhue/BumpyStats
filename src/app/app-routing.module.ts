import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeaderboardsComponent } from './leaderboards/leaderboards.component';
import { PlayerStatsComponent } from './player-stats/player-stats.component';
import { RegisterComponent } from './register/register.component';
import { CompareComponent } from './compare/compare.component';
import { AboutComponent } from './about/about.component';
import { GraveyardComponent } from './graveyard/graveyard.component';

const routes: Routes = [
  {path: '', redirectTo: 'Leaderboards', pathMatch: 'full'},
  {path: 'Leaderboards', component: LeaderboardsComponent},
  {path: 'PlayerStats', component: PlayerStatsComponent},  
  {path: 'Compare', component: CompareComponent},  
  {path: 'Register', component: RegisterComponent},
  {path: 'Graveyard', component: GraveyardComponent},
  {path: 'About', component: AboutComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
