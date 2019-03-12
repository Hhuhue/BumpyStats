import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { LeaderboardsComponent } from './leaderboards/leaderboards.component';
import { HttpClientModule }    from '@angular/common/http';
import { PlayerStatsComponent } from './player-stats/player-stats.component';
import { RegisterComponent } from './register/register.component';
import { CompareComponent } from './compare/compare.component';
import { AboutComponent } from './about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    LeaderboardsComponent,
    PlayerStatsComponent,
    RegisterComponent,
    CompareComponent,
    AboutComponent
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
