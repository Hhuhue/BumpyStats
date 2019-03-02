import { Injectable } from '@angular/core';
import { LeaderboardEntry } from "./models/model.leaderboard-entry";
import { RatioEntry } from "./models/models.ratio-entry";
import { BumpyballService } from "./bumpyball.service";
import { Observable, of } from '../../node_modules/rxjs';
import { map } from 'rxjs/operators';

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

  private treatLeaderboard(leaderboard : LeaderboardEntry[]) : RatioEntry[]{
    var ratios = [];
    leaderboard.forEach(element => {
      var games = element.Wins + element.Draws + element.Losses;
      ratios.push({
        Name : element.last_name,
        Games : games,
        GoalsGame : this.roundFloat(element.goals / games),
        AssistsGame : this.roundFloat(element.assists / games),
        ExpGame : this.roundFloat(element.Experience / games),
        WinLoss : this.roundFloat(element.Wins / element.Losses)
      });
    });

    return ratios;
  }

  private roundFloat(num : number) : number{
    return Math.round(num*100)/100;
  } 
}
