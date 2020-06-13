import { Injectable } from '@angular/core';
import { LeaderboardEntry } from "../models/model.leaderboard-entry";
import { RatioEntry } from "../models/models.ratio-entry";
import { BumpyballService } from "./bumpyball.service";
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayerData } from '../models/model.player-data';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private currentLeaderboard: LeaderboardEntry[] = undefined;
  private currentRatios: RatioEntry[] = undefined;
  private currentProgress: LeaderboardEntry[] = undefined;
  private expPath: number[] = undefined;
  private levelJson = { "levelMap": { "1": { "level": 1, "experience": 100 }, "2": { "level": 2, "experience": 250 }, "3": { "level": 3, "experience": 500 }, "4": { "level": 4, "experience": 750 }, "5": { "level": 5, "experience": 1000 }, "6": { "level": 6, "experience": 1250 }, "7": { "level": 7, "experience": 1500 }, "8": { "level": 8, "experience": 2000 }, "9": { "level": 9, "experience": 2500 }, "10": { "level": 10, "experience": 3000 }, "11": { "level": 11, "experience": 3500 }, "12": { "level": 12, "experience": 4000 }, "13": { "level": 13, "experience": 4500 }, "14": { "level": 14, "experience": 5000 }, "15": { "level": 15, "experience": 6000 }, "16": { "level": 16, "experience": 7000 }, "17": { "level": 17, "experience": 8000 }, "18": { "level": 18, "experience": 9000 }, "19": { "level": 19, "experience": 10000 }, "20": { "level": 20, "experience": 12000 }, "21": { "level": 21, "experience": 15000 }, "22": { "level": 22, "experience": 20000 }, "23": { "level": 23, "experience": 25000 }, "24": { "level": 24, "experience": 30000 }, "25": { "level": 25, "experience": 40000 }, "26": { "level": 26, "experience": 50000 }, "27": { "level": 27, "experience": 60000 }, "28": { "level": 28, "experience": 80000 }, "29": { "level": 29, "experience": 100000 }, "30": { "level": 30, "experience": 120000 }, "31": { "level": 31, "experience": 140000 }, "32": { "level": 32, "experience": 170000 }, "33": { "level": 33, "experience": 200000 }, "34": { "level": 34, "experience": 250000 }, "35": { "level": 35, "experience": 300000 }, "36": { "level": 36, "experience": 400000 }, "37": { "level": 37, "experience": 500000 }, "38": { "level": 38, "experience": 600000 }, "39": { "level": 39, "experience": 700000 }, "40": { "level": 40, "experience": 800000 }, "41": { "level": 41, "experience": 900000 }, "42": { "level": 42, "experience": 1000000 }, "43": { "level": 43, "experience": 1100000 }, "44": { "level": 44, "experience": 1200000 }, "45": { "level": 45, "experience": 1300000 }, "46": { "level": 46, "experience": 1400000 }, "47": { "level": 47, "experience": 1500000 }, "48": { "level": 48, "experience": 1600000 }, "49": { "level": 49, "experience": 1700000 }, "50": { "level": 50, "experience": 1800000 }, "51": { "level": 51, "experience": 1900000 }, "52": { "level": 52, "experience": 2000000 } } };

  constructor(private bumpyball: BumpyballService) { 
    this.init();
  }

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
      /*this.bumpyball.getLevels()
        .subscribe(levels => {
          var keys = Object.keys(levels.levelMap);
          keys.forEach(key => {
            this.expPath.push(levels.levelMap[key].experience)
          });
        });
      */
      var keys = Object.keys(this.levelJson.levelMap);
      keys.forEach(key => {
        this.expPath.push(this.levelJson.levelMap[key].experience)
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

  formatNumber(number : number, withDecimal : boolean = true) : string{
    var formattedNumber = number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

    if(!withDecimal){
      formattedNumber = formattedNumber.substr(0, formattedNumber.length - 3);
    }

    return formattedNumber
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
