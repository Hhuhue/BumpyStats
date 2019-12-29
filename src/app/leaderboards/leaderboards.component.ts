import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from "../models/model.leaderboard-entry";
import { StatisticsService } from "../statistics.service";
import { RatioEntry } from '../models/models.ratio-entry';
import { TableSorterService } from "../table-sorter.service";
import { BoardOptions } from '../models/model.board-options';

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.css']
})
export class LeaderboardsComponent implements OnInit {
  leaderboardOptions: BoardOptions;
  ratioBoardOptions: BoardOptions;
  progressBoardOptions: BoardOptions;

  selectedBoard = 0;
  initialized: boolean[];
  boardSet: boolean[];

  constructor(private statService: StatisticsService,
    public sorter: TableSorterService
  ) { }

  ngOnInit() {
    this.setBoardsOption();
    this.initialized = [true, false, false];
    this.boardSet = [false, false, false];

    this.statService.getLeaderboard(false)
      .subscribe(entries => this.setLeaderboard(entries));
    this.statService.getRatios(false)
      .subscribe(statistics => this.setStatistics(statistics));
    this.statService.getProgresses(false)
      .subscribe(progress => this.setProgresses(progress));
  }

  onSelect(board: number) {
    this.selectedBoard = board;
    this.initialized[board] = true;
  }

  getToday(offset) {
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

    return yyyy + '-' + mmStr + '-' + ddStr;
  }

  private setLeaderboard(leaderboard: LeaderboardEntry[]) {
    for (let index = 0; index < leaderboard.length; index++) {
      leaderboard[index].Position = index + 1;
    }

    this.leaderboardOptions.Data = leaderboard;
    this.boardSet[0] = true;
  }

  private setStatistics(stats: RatioEntry[]) {
    var sortedRatios = this.sorter.sortTable(stats, 'WinGame').reverse();

    for (let index = 0; index < sortedRatios.length; index++) {
      sortedRatios[index].Position = index + 1;
    }

    this.ratioBoardOptions.Data = sortedRatios;
    this.boardSet[1] = true;
  }

  private setProgresses(progresses: LeaderboardEntry[]) {
    for (let index = 0; index < progresses.length; index++) {
      if(progresses[index].Position != NaN) progresses[index].Position *= -1;
    }

    this.progressBoardOptions.Data = progresses;
    this.boardSet[2] = true;
  }

  private setBoardsOption() {
    this.leaderboardOptions = new BoardOptions();
    this.ratioBoardOptions = new BoardOptions();
    this.progressBoardOptions = new BoardOptions();

    this.leaderboardOptions.Labels = ["Position", "Name", "Win", "Loss", "Draw", "Goal", "Assist", "Experience"];
    this.leaderboardOptions.DataOrder = [0, 1, 2, 3, 4, 5, 6, 7];
    this.leaderboardOptions.HasDecimal = [false, false, false, false, false, false, false, false];
    this.leaderboardOptions.Id = "0";

    this.ratioBoardOptions.Labels = ["Position", "Name", "Games", "Goals / Game", "Assists / Game", "Exp / Game", "Loss %", "Win %"];
    this.ratioBoardOptions.DataOrder = [9, 0, 1, 2, 3, 4, 7, 6];
    this.ratioBoardOptions.HasDecimal = [false, false, false, true, true, true, true, true];
    this.ratioBoardOptions.Id = "1";

    this.progressBoardOptions.Labels = ["Name", "Win", "Loss", "Draw", "Goal", "Assist", "Experience"];
    this.progressBoardOptions.DataOrder = [1, 2, 3, 4, 5, 6, 7];
    this.progressBoardOptions.HasDecimal = [false, false, false, false, false, false, false];
    this.progressBoardOptions.Id = "2";
  }
}
