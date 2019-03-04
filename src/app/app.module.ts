import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { LeaderboardsComponent } from './leaderboards/leaderboards.component';
import { HttpClientModule }    from '@angular/common/http';
import { PlayerStatsComponent } from './player-stats/player-stats.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    LeaderboardsComponent,
    PlayerStatsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
