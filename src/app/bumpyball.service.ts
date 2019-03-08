import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaderboardEntry } from "./models/model.leaderboard-entry";
import { Observable } from '../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class BumpyballService {
  private localBase = "http://localhost:8080";
  private prodBase = "http://bumpystats.gearhostpreview.com/src/public";

  private leaderboardURL = "http://listing.usemapsettings.com/Leaderboard?Limit=250";
  private getPlayerNamesApiUrl = this.prodBase + "/names";
  private getPlayerProgressApiUrl = this.prodBase + "/snapshot-preview";
  private getPlayerDataApiUrl = this.prodBase + "/data/";
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
