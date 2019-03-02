import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaderboardEntry } from "./models/model.leaderboard-entry";
import { Observable } from '../../node_modules/rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BumpyballService {
  private leaderboardURL = "http://listing.usemapsettings.com/Leaderboard?Limit=250";
  constructor(private http: HttpClient) { }

  getLeaderboard() : Observable<LeaderboardEntry[]>{
    return this.http.get<LeaderboardEntry[]>(this.leaderboardURL);
  }
}
