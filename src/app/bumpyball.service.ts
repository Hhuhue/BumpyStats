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
  private getPlayerProgressApiUrl = "http://localhost:8080/progress/2019-03-03";
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
}
