import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FlashMessagesModule } from 'angular2-flash-messages';
import { HttpClientModule }    from '@angular/common/http';

import { NavigationComponent } from './navigation/navigation.component';
import { LeaderboardsComponent } from './leaderboards/leaderboards.component';
import { PlayerStatsComponent } from './player-stats/player-stats.component';
import { RegisterComponent } from './register/register.component';
import { CompareComponent } from './compare/compare.component';
import { AboutComponent } from './about/about.component';
import { BoardComponent } from './board/board.component';
import { PlayerGraphsComponent } from './player-graphs/player-graphs.component';
import { GraveyardComponent } from './graveyard/graveyard.component';

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
    GraveyardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FlashMessagesModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
