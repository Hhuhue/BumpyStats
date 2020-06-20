import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaderboardEntry } from "../models/model.leaderboard-entry";
import { Observable } from 'rxjs';
import { ActivityRecord } from '../models/models.activity-record';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BumpyballService {
  private leaderboardURL = "http://listing.usemapsettings.com/Leaderboard?Limit=1000";
  private uidUrl = "http://nifty-condition-169823.appspot.com/GetPlayerRecord?Game=BumpyBall&Uid=";
  private levelsUrl = "http://www.usemapsettings.com/data/levels.json";
  private getPlayerProgressApiUrl = environment.APIEndpoint + "/snapshot-preview";
  private getPlayerDataApiUrl = environment.APIEndpoint + "/data/";
  private getPlayerTimelineApiUrl = environment.APIEndpoint + "/timeline/";
  private getLatestProgressesApiUrl = environment.APIEndpoint + "/latest-progress";
  private getPlayerAvergageTimeApiUrl = environment.APIEndpoint + "/average-time/";
  private getPlayersNameApiUrl = environment.APIEndpoint + "/names";
  private setPlayerUidApiUrl = environment.APIEndpoint + "/setPlayerUID/";
  private getActivityApiUrl = environment.APIEndpoint + "/activity";
  private getTeamNamesApiUrl = environment.APIEndpoint + "/team-names";
  private getEventNamesApiUrl = environment.APIEndpoint + "/event-names";
  private getTeamDataApiUrl = environment.APIEndpoint + "/team/";
  private getEventDataApiUrl = environment.APIEndpoint + "/event/";
  private postTeamDataApiUrl = environment.APIEndpoint + "/submit-team";
  private postEventDataApiUrl = environment.APIEndpoint + "/submit-event";
  private postMatchDataApiUrl = environment.APIEndpoint + "/submit-match";
  private getMatchesApiUrl = environment.APIEndpoint + "/match-search";
  private getMatchApiUrl = environment.APIEndpoint + "/match/";
  private postAuthApiUrl = environment.APIEndpoint + "/login";

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

  getActivity(dateRange : string) : Observable<ActivityRecord[]> {
    return this.http.post<ActivityRecord[]>(this.getActivityApiUrl, dateRange);
  }

  getTeamNames() : Observable<string[]> {
    return this.http.get<string[]>(this.getTeamNamesApiUrl);
  }

  getEventNames() : Observable<string[]> {
    return this.http.get<string[]>(this.getEventNamesApiUrl);
  }

  getTeamData(name : string) : Observable<any> {
    return this.http.get<any>(this.getTeamDataApiUrl + name);
  }

  getEventData(name : string) : Observable<any> {
    return this.http.get<any>(this.getEventDataApiUrl + name);
  }

  getMatches(filter: any) : Observable<any[]>{
    return this.http.post<any[]>(this.getMatchesApiUrl, filter);
  }

  getMatch(matchId: number){
    return this.http.get(this.getMatchApiUrl + matchId);
  }

  postTeamData(teamData: any) {
    return this.http.post(this.postTeamDataApiUrl, teamData);
  }

  postEventData(eventData: any) {
    return this.http.post(this.postEventDataApiUrl, eventData);
  }

  postMatchData(matchData: any) {
    return this.http.post(this.postMatchDataApiUrl, matchData);
  }

  postAuthCredentials(password: string) : Observable<any> {
    return this.http.post(this.postAuthApiUrl, password, {responseType: 'text'});
  }
}
