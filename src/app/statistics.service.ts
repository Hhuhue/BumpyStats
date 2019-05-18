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
  private expPath: number[] = undefined;

  constructor(private bumpyball: BumpyballService) { }

  init() {
    this.getExpPath();
    this.getLeaderboard(true);
    this.getProgresses(true);
  }

  getLeaderboard(getNew: boolean): Observable<LeaderboardEntry[]> {
    if (this.currentLeaderboard && !getNew) {
      return of(this.currentLeaderboard);
    } else {
      var promise = this.bumpyball.getLeaderboard();
      promise.subscribe(leaderboard => this.currentLeaderboard = this.sourceToLeaderboardEntries(leaderboard));
      return promise.pipe(map(leaderboard => this.sourceToLeaderboardEntries(leaderboard)));;
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
      promise.subscribe(progresses => this.currentProgress = this.sourceToLeaderboardEntries(progresses));
      return promise.pipe(map(progresses => this.sourceToLeaderboardEntries(progresses)));;;
    }
  }

  buildPlayerData(playerHistory: any): PlayerData[] {
    var stateHistory = this.sourceToLeaderboardEntries(playerHistory.states);
    var progressHistory = this.sourceToLeaderboardEntries(playerHistory.progress);

    var ratioHistory = this.treatLeaderboard(stateHistory);
    var playerData: PlayerData[] = [];

    var progressIndex = 0;
    for (let i = 0; i < stateHistory.length; i++) {
      var data: PlayerData = {
        DataDate: playerHistory.states[i].Date,
        State: stateHistory[i],
        Progress: undefined,
        Ratios: ratioHistory[i]
      }

      if (progressHistory.length > progressIndex && playerHistory.progress[progressIndex].Date == data.DataDate) {
        data.Progress = progressHistory[progressIndex];
        progressIndex++;
      }
      playerData.push(data);
    }

    return playerData;
  }

  getExpPath() {
    if (!this.expPath) {
      this.expPath = [];
      this.bumpyball.getLevels()
        .subscribe(levels => {
          var keys = Object.keys(levels.levelMap);
          keys.forEach(key => {
            this.expPath.push(levels.levelMap[key].experience)
          });
        });
    }
  }

  entryToRatio(entry: LeaderboardEntry): RatioEntry {
    var games = entry.Wins + entry.Draws + entry.Losses;
    var ratios = new RatioEntry();

    ratios.Name = entry.Name;
    ratios.Games = games;
    ratios.GoalsGame = this.roundFloat(entry.Goals / games);
    ratios.AssistsGame = this.roundFloat(entry.Assists / games);
    ratios.ExpGame = this.roundFloat(entry.Experience / games);
    ratios.WinLoss = this.roundFloat(entry.Wins / entry.Losses);
    ratios.WinGame = this.roundPercent(entry.Wins / games);
    ratios.LossGame = this.roundPercent(entry.Losses / games);
    ratios.DrawGame = this.roundPercent(entry.Draws / games);

    return ratios;
  }

  expToLevel(exp: number) {
    if (!this.expPath) return;
    var level = 0;
    while (exp >= 0) {
      exp -= this.expPath[level];
      level++;
    }

    return level;
  }

  getExpForNextLevel(level: number) {
    return this.expPath[level - 1];
  }

  getAccumulatedExpAtLevel(level: number) {
    var accumulatedExp = 0;
    for (let index = 0; index < level; index++) {
      accumulatedExp += this.expPath[index];
    }
    return accumulatedExp;
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
      CI[0].push({ x: point.x, y: point.y - margin });
      CI[1].push({ x: point.x, y: point.y + margin });
    });

    return CI;
  }

  sourceToLeaderboardEntries(source: any[]) {
    var leaderboardEntries = [];
    source.forEach(element => {
      leaderboardEntries.push(new LeaderboardEntry(element));
    });

    return leaderboardEntries;
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
