import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

import { FlashMessagesModule } from 'angular2-flash-messages';
import { HttpClientModule }    from '@angular/common/http';
import { JwtModule } from "@auth0/angular-jwt";

import { NavigationComponent } from './components/navigation/navigation.component';
import { LeaderboardsComponent } from './components/leaderboards/leaderboards.component';
import { PlayerStatsComponent } from './components/player-stats/player-stats.component';
import { RegisterComponent } from './components/register/register.component';
import { CompareComponent } from './components/compare/compare.component';
import { AboutComponent } from './components/about/about.component';
import { BoardComponent } from './components/board/board.component';
import { PlayerGraphsComponent } from './components/player-graphs/player-graphs.component';
import { GraveyardComponent } from './components/graveyard/graveyard.component';
import { ActivityComponent } from './components/activity/activity.component';
import { MatchmakerComponent } from './components/matchmaker/matchmaker.component';
import { LoginComponent } from './components/login/login.component';

export function tokenGetter() {
  return localStorage.getItem("access_token");
}

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    LeaderboardsComponent,
    PlayerStatsComponent,
    RegisterComponent,
    CompareComponent,
    AboutComponent,
    BoardComponent,
    PlayerGraphsComponent,
    GraveyardComponent,
    ActivityComponent,
    MatchmakerComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    FlashMessagesModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter
      },
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
