import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaderboardEntry } from "./models/model.leaderboard-entry";
import { Observable } from '../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class BumpyballService {
  private leaderboardURL = "http://listing.usemapsettings.com/Leaderboard?Limit=250";
  private getPlayerNamesApiUrl = "http://localhost:8080/names";
  private getPlayerProgressApiUrl = "http://localhost:8080/snapshot-preview";
  private getPlayerDataApiUrl = "http://localhost:8080/data/";
  constructor(private http: HttpClient) { }

  getLeaderboard() : Observable<LeaderboardEntry[]>{
    return this.http.get<LeaderboardEntry[]>(this.leaderboardURL);
  }

  getPlayerNames() : Observable<string[]>{
    return this.http.get<string[]>(this.getPlayerNamesApiUrl);
  }

  getPlayerProgress() : Observable<LeaderboardEntry[]>{
    return this.http.get<LeaderboardEntry[]>(this.getPlayerProgressApiUrl);
  }

  getPlayerData(name : string) : Observable<any>{
    return this.http.get<any>(this.getPlayerDataApiUrl + name);
  }
}
