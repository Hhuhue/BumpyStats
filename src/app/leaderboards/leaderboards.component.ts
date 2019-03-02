import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from "../models/model.leaderboard-entry";
import { BumpyballService } from "../bumpyball.service";

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.css']
})
export class LeaderboardsComponent implements OnInit {
  entries : LeaderboardEntry[];
  count = 0;
  constructor(private bumpyball : BumpyballService) { }

  ngOnInit() {
    this.bumpyball.getLeaderboard().subscribe(entries => this.entries = entries);
    this.count = 0;
  }
  
  nextCount() : number{
    this.count++;
    if(this.count > 250) this.count = 1;
    
    return this.count;
  }
}
