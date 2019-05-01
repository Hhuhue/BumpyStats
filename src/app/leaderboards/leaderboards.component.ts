import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from "../models/model.leaderboard-entry";
import { StatisticsService } from "../statistics.service";
import { RatioEntry } from '../models/models.ratio-entry';
import { TableSorterService } from "../table-sorter.service";
import { BumpyballService } from '../bumpyball.service';

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.css']
})
export class LeaderboardsComponent implements OnInit {
  entries : LeaderboardEntry[];
  progress : LeaderboardEntry[];
  statistics : RatioEntry[];

  leaderboardLabels : string[];
  leaderboardOrder : number[];
  progressOrder : number[];
  ratioLabels : string[];
  ratioOrder : number[];
  
  selectedBoard = 0;
  initialized : boolean[];

  constructor(private statService : StatisticsService,
    private bumpyball : BumpyballService,
    public sorter : TableSorterService
  ) { }

  ngOnInit() {
    this.initialized = [true, false, false];

    this.statService.getLeaderboard(false)
      .subscribe(entries => this.setLeaderboard(entries));
    this.statService.getRatios(false)
      .subscribe(statistics => this.setStatistics(statistics));
    this.statService.getProgresses(false)
      .subscribe(progress => this.setProgresses(progress));

    this.leaderboardLabels = ["Position", "Name", "Win", "Loss", "Draw", "Goal", "Assist", "Experience"];
    this.leaderboardOrder = [7,6,3,5,4,1,2,0];
    this.progressOrder = [6,7,3,5,4,1,2,0];

    this.ratioLabels = ["Position", "Name", "Games", "Goals / Game", "Assists / Game", "Exp / Game", "Loss %", "Win %"];
    this.ratioOrder = [9,0,1,2,3,4,7,6];
  }
  
  onSelect(board : number) {
    this.selectedBoard = board;
    this.initialized[board] = true;
  }

  getToday(offset){
    var today = new Date();
    var dd = today.getDate() + offset;
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    
    var ddStr = dd.toString();
    if (dd < 10) {
      ddStr = '0' + dd;
    }

    var mmStr = mm.toString();
    if (mm < 10) {
      mmStr = '0' + mm;
    }

    return yyyy + '-' + mmStr  + '-' + ddStr;
  }

  private setLeaderboard(leaderboard : LeaderboardEntry[]){
    for (let index = 0; index < leaderboard.length; index++) {
      leaderboard[index].Position = index + 1;      
    }

    this.entries = leaderboard;
  }

  private setStatistics(stats : RatioEntry[]){
    var sortedRatios = this.sorter.sortTable(stats, 'WinGame').reverse();

    for (let index = 0; index < sortedRatios.length; index++) {
      sortedRatios[index].Position = index + 1;      
    }

    this.statistics = sortedRatios;
  }

  private setProgresses(progresses : LeaderboardEntry[]){
    for (let index = 0; index < progresses.length; index++) {
      progresses[index].Position *= -1;
    }

    this.progress = progresses;
  }
}
