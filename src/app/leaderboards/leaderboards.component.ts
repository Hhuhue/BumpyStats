import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from "../models/model.leaderboard-entry";
import { StatisticsService } from "../statistics.service";
import { RatioEntry } from '../models/models.ratio-entry';

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.css']
})
export class LeaderboardsComponent implements OnInit {
  entries : LeaderboardEntry[];
  statistics : RatioEntry[];
  sectionDisplayed = [true, false];
  count = 0;
  constructor(private bumpyball : StatisticsService) { }

  ngOnInit() {
    this.bumpyball.getLeaderboard(true).subscribe(entries => this.entries = entries);
    this.bumpyball.getRatios(true).subscribe(statistics => this.statistics = statistics);
    this.count = 0;
  }
  
  nextCount() : number{
    this.count++;
    if(this.count > 250) this.count = 1;
    
    return this.count;
  }
  
  onFold(section : number, element) {
    console.log(element);
    this.sectionDisplayed[section-1] = !this.sectionDisplayed[section-1];
  }
}
