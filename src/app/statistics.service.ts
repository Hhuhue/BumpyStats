import { Injectable } from '@angular/core';
import { LeaderboardEntry } from "./models/model.leaderboard-entry";
import { RatioEntry } from "./models/models.ratio-entry";
import { BumpyballService } from "./bumpyball.service";
import { Observable, of } from '../../node_modules/rxjs';
import { map } from 'rxjs/operators';
import { PlayerData } from './models/model.player-data';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  currentLeaderboard : LeaderboardEntry[] = undefined;
  currentRatios : RatioEntry[] = undefined;

  constructor(private bumpyball : BumpyballService) { }

  getLeaderboard(getNew :boolean) : Observable<LeaderboardEntry[]>{
    if (this.currentLeaderboard && !getNew){
      return of (this.currentLeaderboard);
    } else {
      var promise = this.bumpyball.getLeaderboard();
      promise.subscribe(leaderboard => this.currentLeaderboard = leaderboard);
      return promise;
    }
  }

  getRatios(getNew :boolean) : Observable<RatioEntry[]>{
    if(this.currentRatios && !getNew){
      return of (this.currentRatios);
    } else if (!this.currentRatios && this.currentLeaderboard && !getNew){
      return of(this.treatLeaderboard(this.currentLeaderboard));
    } else {
      var promise = this.getLeaderboard(true);
      promise.subscribe(leaderboard => this.currentRatios = this.treatLeaderboard(leaderboard));
      return promise.pipe(map(leaderboard => this.treatLeaderboard(leaderboard)));
    }
  }

  buildPlayerData(raw : any) : PlayerData[]{
    var rawStates = raw.states;
    var rawProgress = raw.progress;

    var ratios = this.treatLeaderboard(rawStates);
    var playerData : PlayerData[] = [];

    var j = 0;
    for (let i = 0; i < rawStates.length; i++) {
      var data : PlayerData = {
        DataDate : rawStates[i].Date,
        State : rawStates[i],
        Progress : undefined,
        Ratios : ratios[i]
      }
      delete data.State['Date'];

      if(rawProgress.length > j && rawProgress[j].Date == data.DataDate){
        data.Progress = rawProgress[j];
        delete data.Progress['Date'];
        j++;
      }   
      playerData.push(data);
    }
    
    return playerData;
  }

  entryToRatio(entry : LeaderboardEntry) : any{    
    var games = entry.Wins + entry.Draws + entry.Losses;
    var ratio = {
      Name : entry.last_name,
      Games : games,
      GoalsGame : this.roundFloat(entry.goals / games),
      AssistsGame : this.roundFloat(entry.assists / games),
      ExpGame : this.roundFloat(entry.Experience / games),
      WinLoss : this.roundFloat(entry.Wins / entry.Losses),
      WinGame : this.roundFloat(entry.Wins / games),      
      LossGame : this.roundFloat(entry.Losses / games),     
      DrawGame : this.roundFloat(entry.Draws / games),
    };
    return ratio;
  }

  private treatLeaderboard(leaderboard : LeaderboardEntry[]) : RatioEntry[]{
    var ratios = [];
    leaderboard.forEach(element => {
      ratios.push(this.entryToRatio(element));
    });

    return ratios;
  }

  private roundFloat(num : number) : number{
    return Math.round(num*10000)/100;
  } 
}
