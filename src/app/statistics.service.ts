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
  private currentLeaderboard: LeaderboardEntry[] = undefined;
  private currentRatios: RatioEntry[] = undefined;
  private currentProgress: LeaderboardEntry[] = undefined;

  private expPath: number[] = [
    100, 250, 500, 750, 1000, 1250, 1500,
    2000, 2500, 3000, 3500, 4000, 4500, 5000,
    6000, 7000, 8000, 9000, 10000, 11000, 12000,
    19000, 26000, 33000, 41000, 50000, 60000,
    80000, 100000, 120000, 140000, 160000, 180000, 200000
  ];

  constructor(private bumpyball: BumpyballService) { }

  getLeaderboard(getNew: boolean): Observable<LeaderboardEntry[]> {
    if (this.currentLeaderboard && !getNew) {
      return of(this.currentLeaderboard);
    } else {
      var promise = this.bumpyball.getLeaderboard();
      promise.subscribe(leaderboard => this.currentLeaderboard = leaderboard);
      return promise;
    }
  }

  getRatios(getNew: boolean): Observable<RatioEntry[]> {
    if (this.currentRatios && !getNew) {
      return of(this.currentRatios);
    } else if (!this.currentRatios && this.currentLeaderboard && !getNew) {
      return of(this.treatLeaderboard(this.currentLeaderboard));
    } else {
      var promise = this.getLeaderboard(true);
      promise.subscribe(leaderboard => this.currentRatios = this.treatLeaderboard(leaderboard));
      return promise.pipe(map(leaderboard => this.treatLeaderboard(leaderboard)));
    }
  }

  getProgresses(getNew: boolean): Observable<LeaderboardEntry[]> {
    if (this.currentProgress && !getNew) {
      return of(this.currentProgress);
    } else {
      var promise = this.bumpyball.getPlayerProgress();
      promise.subscribe(progresses => this.currentProgress = progresses);
      return promise;
    }
  }

  buildPlayerData(raw: any): PlayerData[] {
    var rawStates = raw.states;
    var rawProgress = raw.progress;

    var ratios = this.treatLeaderboard(rawStates);
    var playerData: PlayerData[] = [];

    var j = 0;
    for (let i = 0; i < rawStates.length; i++) {
      var data: PlayerData = {
        DataDate: rawStates[i].Date,
        State: rawStates[i],
        Progress: undefined,
        Ratios: ratios[i]
      }
      delete data.State['Date'];

      if (rawProgress.length > j && rawProgress[j].Date == data.DataDate) {
        data.Progress = rawProgress[j];
        delete data.Progress['Date'];
        j++;
      }
      playerData.push(data);
    }

    return playerData;
  }

  entryToRatio(entry: LeaderboardEntry): any {
    var games = entry.Wins + entry.Draws + entry.Losses;
    var ratio = {
      Name: entry.last_name,
      Games: games,
      GoalsGame: this.roundFloat(entry.goals / games),
      AssistsGame: this.roundFloat(entry.assists / games),
      ExpGame: this.roundFloat(entry.Experience / games),
      WinLoss: this.roundFloat(entry.Wins / entry.Losses),
      WinGame: this.roundPercent(entry.Wins / games),
      LossGame: this.roundPercent(entry.Losses / games),
      DrawGame: this.roundPercent(entry.Draws / games),
    };
    return ratio;
  }

  expToLevel(exp: number) {
    var level = 0;
    while (exp >= 0) {
      exp -= this.expPath[level];
      level++;
    }

    return level;
  }

  linearRegression(points: any[], count: number, from: number, to: number) {
    var sumX = 0;
    var sumY = 0;
    points.forEach(point => {
      sumX += point.x;
      sumY += point.y;
    });

    var avgX = sumX / points.length;
    var avgY = sumY / points.length;
    var sumXX = 0;
    var sumXY = 0;
    points.forEach(point => {
      sumXX += Math.pow(point.x - avgX, 2);
      sumXY += (point.x - avgX) * (point.y - avgY);
    });

    var slope = sumXY / sumXX;
    var origin = avgY - slope * avgX;

    var regressionPoints = [];
    var step = (to - from) / count;

    for (let index = 0; index < count; index++) {
      let x = from + step * index;
      regressionPoints.push({ x: x, y: origin + x * slope });
    }

    return regressionPoints;
  }

  regressionConfidenceInterval(points: any[], regressionPoints: any[]) {
    var sumX = 0;
    var sumY = 0;
    var n = points.length;
    points.forEach(point => {
      sumX += point.x;
      sumY += point.y;
    });

    var avgX = sumX / n;
    var avgY = sumY / n;
    var sumXX = 0;
    var sumYY = 0;
    points.forEach(point => {
      sumXX += Math.pow(point.x - avgX, 2);
      sumYY += Math.pow(point.y - avgY, 2);
    });

    var studentVal = 3.291; //Confidence of 99.9%
    var variance = sumYY / (n - 1);
    var CI = [[], []];

    regressionPoints.forEach(point => {
      let margin = studentVal * Math.pow(variance * (1 / n + Math.pow(point.x - avgX, 2) / sumXX), 0.5);
      CI[0].push({x: point.x, y: point.y - margin});
      CI[1].push({x: point.x, y: point.y + margin});
    });

    return CI;
  }

  private treatLeaderboard(leaderboard: LeaderboardEntry[]): RatioEntry[] {
    var ratios = [];
    leaderboard.forEach(element => {
      ratios.push(this.entryToRatio(element));
    });

    return ratios;
  }

  private roundFloat(num: number): number {
    return Math.round(num * 100) / 100;
  }

  private roundPercent(num: number): number {
    return Math.round(num * 10000) / 100;
  }
}
