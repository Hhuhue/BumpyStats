import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaderboardEntry } from "../models/model.leaderboard-entry";
import { Observable } from 'rxjs';
import { ActivityRecord } from '../models/models.activity-record';

@Injectable({
  providedIn: 'root'
})
export class BumpyballService {
  private localBase = "http://localhost:8080";
  private prodBase = "http://bumpystats.gearhostpreview.com/src/public";

  private leaderboardURL = "http://listing.usemapsettings.com/Leaderboard?Limit=250";
  private uidUrl = "http://nifty-condition-169823.appspot.com/GetPlayerRecord?Game=BumpyBall&Uid=";
  private levelsUrl = "http://www.usemapsettings.com/data/levels.json";
  private getPlayerProgressApiUrl = this.getUrlBase() + "/snapshot-preview";
  private getPlayerDataApiUrl = this.getUrlBase() + "/data/";
  private getPlayerTimelineApiUrl = this.getUrlBase() + "/timeline/";
  private getLatestProgressesApiUrl = this.getUrlBase() + "/latest-progress";
  private getPlayerAvergageTimeApiUrl = this.getUrlBase() + "/average-time/";
  private getPlayersNameApiUrl = this.getUrlBase() + "/names";
  private setPlayerUidApiUrl = this.getUrlBase() + "/setPlayerUID/";
  private getActivityApiUrl = this.getUrlBase() + "/activity";

  constructor(private http: HttpClient) { }

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(this.leaderboardURL);
  }

  getLevels(): Observable<any> {
    return this.http.get<any>(this.levelsUrl);
  }

  getPlayerProgress(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(this.getPlayerProgressApiUrl);
  }

  getPlayerData(name: string): Observable<any> {
    return this.http.get<any>(this.getPlayerDataApiUrl + name);
  }

  getPlayerTimeline(name: string): Observable<any> {
    return this.http.get<any>(this.getPlayerTimelineApiUrl + name);
  }

  getPlayerAverageTime(name: string): Observable<any> {
    return this.http.get<any>(this.getPlayerAvergageTimeApiUrl + name);
  }

  getLatestProgresses(): Observable<any[]> {
    return this.http.get<any[]>(this.getLatestProgressesApiUrl);
  }

  getPlayerFromUID(uid: string): Observable<any> {
    return this.http.get<any>(this.uidUrl + uid);
  }

  getPlayersName(): Observable<string[]> {
    return this.http.get<any>(this.getPlayersNameApiUrl);
  }

  sendPlayerFromUID(uid: string) {
    this.http.get<any>(this.setPlayerUidApiUrl + uid).subscribe();
  }

  getActivity() : Observable<ActivityRecord[]> {
    return this.http.get<ActivityRecord[]>(this.getActivityApiUrl);
  }

  private getUrlBase() {
    return this.localBase;
  }
}
