import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from "../models/model.leaderboard-entry";
import { StatisticsService } from "../statistics.service";
import { RatioEntry } from '../models/models.ratio-entry';
import { TableSorterService } from "../table-sorter.service";

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.css']
})
export class LeaderboardsComponent implements OnInit {
  entries : LeaderboardEntry[];
  statistics : RatioEntry[];
  selectedBoard = 0;

  constructor(private bumpyball : StatisticsService,
    public sorter : TableSorterService
  ) { }

  ngOnInit() {
    this.bumpyball.getLeaderboard(false)
      .subscribe(entries => this.setLeaderboard(entries));
    this.bumpyball.getRatios(false)
      .subscribe(statistics => this.setStatistics(statistics));
    console.log($);

    $("#ExpBoard").floatThead({position: 'fixed'});
    $("#RatioBoard").floatThead({position: 'fixed'});
  }
  
  onSelect(board : number) {
    this.selectedBoard = board;
  }

  private setLeaderboard(leaderboard : LeaderboardEntry[]){
    for (let index = 0; index < leaderboard.length; index++) {
      leaderboard[index].Position = index + 1;      
    }

    this.entries = leaderboard;
  }

  private setStatistics(stats : RatioEntry[]){
    var sortedRatios = this.sorter.sortTable(stats, 'WinLoss').reverse();

    for (let index = 0; index < sortedRatios.length; index++) {
      sortedRatios[index].Position = index + 1;      
    }

    this.statistics = sortedRatios;
  }
}
