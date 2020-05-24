import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeaderboardsComponent } from './components/leaderboards/leaderboards.component';
import { PlayerStatsComponent } from './components/player-stats/player-stats.component';
import { RegisterComponent } from './components/register/register.component';
import { CompareComponent } from './components/compare/compare.component';
import { AboutComponent } from './components/about/about.component';
import { GraveyardComponent } from './components/graveyard/graveyard.component';
import { ActivityComponent } from './components/activity/activity.component';
import { MatchmakerComponent } from './components/matchmaker/matchmaker.component';

const routes: Routes = [
  {path: '', redirectTo: 'Leaderboards', pathMatch: 'full'},
  {path: 'Leaderboards', component: LeaderboardsComponent},
  {path: 'PlayerStats', component: PlayerStatsComponent},  
  {path: 'Compare', component: CompareComponent},  
  {path: 'Register', component: RegisterComponent},
  {path: 'Graveyard', component: GraveyardComponent},
  {path: 'About', component: AboutComponent},
  {path: 'Matchmaker', component: MatchmakerComponent},
  {path: 'Activity', component: ActivityComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
