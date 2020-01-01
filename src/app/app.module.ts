import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

import { FlashMessagesModule } from 'angular2-flash-messages';
import { HttpClientModule }    from '@angular/common/http';

import { NavigationComponent } from './components/navigation/navigation.component';
import { LeaderboardsComponent } from './components/leaderboards/leaderboards.component';
import { PlayerStatsComponent } from './components/player-stats/player-stats.component';
import { RegisterComponent } from './components/register/register.component';
import { CompareComponent } from './components/compare/compare.component';
import { AboutComponent } from './components/about/about.component';
import { BoardComponent } from './components/board/board.component';
import { PlayerGraphsComponent } from './components/player-graphs/player-graphs.component';
import { GraveyardComponent } from './components/graveyard/graveyard.component';

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
    FormsModule,
    FlashMessagesModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
