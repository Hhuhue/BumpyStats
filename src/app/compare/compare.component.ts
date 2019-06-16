import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from '../models/model.leaderboard-entry';
import { StatisticsService } from '../statistics.service';
import { TableSorterService } from '../table-sorter.service';
import { BoardOptions } from '../models/model.board-options';
import { PlayerData } from '../models/model.player-data';
import { BumpyballService } from '../bumpyball.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import * as Chart from 'chart.js';
import * as md5 from 'md5';
import { RatioEntry } from '../models/models.ratio-entry';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css']
})
export class CompareComponent implements OnInit {
  selectedView: number;

  initialized: boolean;
  dataSet: boolean;
  scoreBoardOptions: BoardOptions;

  names : string[] = [];
  player1Name: string;
  player2Name: string;
  player1Data: PlayerData;
  player2Data: PlayerData;
  playerDiffData: PlayerData;

  constructor(private statService: StatisticsService,
    private sorter: TableSorterService,
    private bumpyball: BumpyballService,
    private flashMessage: FlashMessagesService
  ) { }

  ngOnInit() {
    this.selectedView = 0;
    this.initialized = false;
    this.dataSet = false;
    this.scoreBoardOptions = new BoardOptions();

    this.statService.getLeaderboard(false)
      .subscribe(entries => this.setDistributionCharts(entries));

    this.bumpyball.getPlayersName()
      .subscribe(names => this.names = names);

    this.scoreBoardOptions.Labels = ["Name", "Raw Score", "Survive Rate Penalty", "Goal per Game Penalty", "Final Score"];
    this.scoreBoardOptions.DataOrder = [0, 1, 2, 3, 4];
    this.scoreBoardOptions.HasDecimal = [false, false, true, true, false];
    this.scoreBoardOptions.Id = "1";
  }

  onSelect(index: number) {
    this.selectedView = index;
    if (index === 1) {
      this.initialized = true;
    }
  }

  onCompare() {
    this.bumpyball.getPlayerData(md5(this.player1Name))
      .subscribe(playerData1 => {
        if (playerData1 == -1) {
          this.flashMessage.show("Player <b>" + this.player1Name + "</b> not found", { cssClass: 'alert-danger', timeout: 5000 })
          this.player1Name = "";
        } else {
          this.player1Data = this.statService.buildPlayerData(playerData1)[0];
          this.bumpyball.getPlayerData(md5(this.player2Name))
            .subscribe(playerData2 => {
              if (playerData2 == -1) {
                this.flashMessage.show("Player <b>" + this.player2Name + "</b> not found", { cssClass: 'alert-danger', timeout: 5000 })
                this.player2Name = "";
              } else {
                this.player2Data = this.statService.buildPlayerData(playerData2)[0];
                this.setPlayerDiff();
              }
            });
          }
        });
  }

  formatNumber(number : number, withDecimal : boolean = false){
    return this.statService.formatNumber(number, withDecimal);
  }

  formatDiff(number : number, withDecimal : boolean = false){
    var formattedNumber = this.formatNumber(number, withDecimal);

    if(number > 0){
      formattedNumber = '+ ' + formattedNumber;
    }

    return formattedNumber;
  }

  private setPlayerDiff(){
    this.playerDiffData = new PlayerData();
    this.playerDiffData.Ratios = new RatioEntry();
    this.playerDiffData.State = new LeaderboardEntry(0);

    var ratioKeys = Object.keys(this.playerDiffData.Ratios);
    ratioKeys.forEach(key => {
      this.playerDiffData.Ratios[key] = Math.round((this.player1Data.Ratios[key] - this.player2Data.Ratios[key]) * 100) / 100;
    });

    var stateKeys = Object.keys(this.playerDiffData.State);
    stateKeys.forEach(key => {
      this.playerDiffData.State[key] = Math.round((this.player1Data.State[key] - this.player2Data.State[key]) * 100) / 100;
    });

    console.log(this.playerDiffData);
    console.log(this.playerDiffData.State);
    console.log(this.playerDiffData.Ratios);
  }

  private setDistributionCharts(entries: LeaderboardEntry[]) {
    var expGameData = [];
    var surviveRateData = [];
    var goalGameData = [];
    var scatterScoreData = [];
    this.scoreBoardOptions.Data = [];

    entries.forEach(entry => {
      let games = entry.Draws + entry.Losses + entry.Wins;
      let kExp = Math.round(entry.Experience / 1000);
      let surviveRate = Math.round((entry.Wins + entry.Draws) / games * 10000) / 100;
      let goalGame = Math.round(entry.Goals / games * 100) / 100;
      let score = this.getScore(entry);

      this.scoreBoardOptions.Data.push(score);

      expGameData.push({
        x: games,
        y: kExp,
        name: entry.Name
      });

      surviveRateData.push({
        x: games,
        y: surviveRate,
        name: entry.Name
      });

      goalGameData.push({
        x: games,
        y: goalGame,
        name: entry.Name
      });

      scatterScoreData.push({
        x: games,
        y: score.score,
        name: entry.Name
      });
    });

    this.scoreBoardOptions.Data = this.sorter.sortTable(this.scoreBoardOptions.Data, 'score');
    this.dataSet = true;

    expGameData = this.sorter.sortTable(expGameData, 'x');
    this.setScatterChart(expGameData, this.getExpScatterOptions(), "myChart", true);

    surviveRateData = this.sorter.sortTable(surviveRateData, 'x');
    this.setScatterChart(surviveRateData, this.getWinScatterOptions(), "myChart2", false);

    goalGameData = this.sorter.sortTable(goalGameData, 'x');
    this.setScatterChart(goalGameData, this.getGoalScatterOptions(), "myChart3", false);

    scatterScoreData = this.roundPoints(this.sorter.sortTable(scatterScoreData, 'x'));
    this.setScatterChart(scatterScoreData, this.getScoreScatterOptions(), "myChart4", true);
  }

  private setScatterChart(points: any[], options: object, id: string, round: boolean) {
    var element: any = document.getElementById(id);
    var ctx = element.getContext('2d');

    var regression = this.statService.linearRegression(points, 20, points[0].x, points[points.length - 1].x + 100);
    var CI = this.statService.regressionConfidenceInterval(points, regression);
    if (round) {
      regression = this.roundPoints(regression);
      CI[0] = this.roundPoints(CI[0]);
      CI[1] = this.roundPoints(CI[1]);
    }

    // End Defining data
    var myChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Mean curve',
          data: regression,
          borderColor: 'rgb(61, 61, 211)',
          backgroundColor: 'rgba(61, 61, 211, 0.2)',
          showLine: true,
          fill: false
        }, {
          label: '',
          data: CI[0],
          borderColor: 'rgb(178, 74, 74)',
          backgroundColor: 'rgba(178, 74, 74, 0.2)',
          showLine: true,
          fill: false
        }, {
          label: 'Error Margin',
          data: CI[1],
          borderColor: 'rgb(178, 74, 74)',
          backgroundColor: 'rgba(178, 74, 74, 0.2)',
          showLine: true,
          fill: false
        }, {
          label: 'Distribution',
          data: points,
          borderColor: 'rgb(2, 18, 20)',
          backgroundColor: 'rgba(2, 18, 20, 0.2)',
        }]
      },
      options: options
    });
  }

  private getExpScatterOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          title: (items, data) => data.datasets[items[0].datasetIndex].data[items[0].index].name,
          label: (item, data) => {
            var entry = data.datasets[item.datasetIndex].data[item.index];
            return "(games: " + entry.x + ", exp: " + entry.y + "k)";
          }
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            callback: function (value, index, values) {
              return value + 'k';
            }
          },
          scaleLabel: {
            display: true,
            labelString: 'Experience Gained'
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Games Played'
          }
        }]
      }
    };
  }

  private getWinScatterOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          title: (items, data) => data.datasets[items[0].datasetIndex].data[items[0].index].name,
          label: (item, data) => {
            var entry = data.datasets[item.datasetIndex].data[item.index];
            return "(games: " + entry.x + ", survive %: " + entry.y + "%)";
          }
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            callback: function (value, index, values) {
              return value + '%';
            }
          },
          scaleLabel: {
            display: true,
            labelString: 'Survive %'
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Games Played'
          }
        }]
      }
    };
  }

  private getGoalScatterOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          title: (items, data) => data.datasets[items[0].datasetIndex].data[items[0].index].name,
          label: (item, data) => {
            var entry = data.datasets[item.datasetIndex].data[item.index];
            return "(games: " + entry.x + ", Gpg: " + entry.y + ")";
          }
        }
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Goals per game'
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Games Played'
          }
        }]
      }
    };
  }

  private getScoreScatterOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          title: (items, data) => data.datasets[items[0].datasetIndex].data[items[0].index].name,
          label: (item, data) => {
            var entry = data.datasets[item.datasetIndex].data[item.index];
            return "(games: " + entry.x + ", score: " + entry.y + ")";
          }
        }
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Score'
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Total games'
          }
        }]
      }
    };
  }

  private roundPoints(points: any[]) {
    for (let i = 0; i < points.length; i++) {
      points[i].x = Math.round(points[i].x);
      points[i].y = Math.round(points[i].y);
    }

    return points;
  }

  private getScore(entry: LeaderboardEntry) {
    const surviveRateThreshold = 75.0;
    const goalGameThreshold = 2;

    var games = entry.Draws + entry.Losses + entry.Wins;
    var surviveRate = Math.round((entry.Wins + entry.Draws) / games * 10000) / 100;
    var surviveRateModifier = Math.pow(Math.E, surviveRate - surviveRateThreshold - 10) / 10 + 1;

    var goalGame = entry.Goals / games;
    var goalGameModifier = Math.pow(Math.E, 3 * goalGame - goalGameThreshold - 6) + 1;

    surviveRateModifier = Math.max(1, surviveRateModifier);
    goalGameModifier = Math.max(1, goalGameModifier);

    var rawScore = entry.Experience / 100;
    var score = rawScore / (surviveRateModifier * goalGameModifier);
    //console.log(entry.last_name + "| rs: " + rawScore + " | sp: " + surviveRateModifier + " | gp: " + goalGameModifier);
    return {
      name: entry.Name,
      rawScore: Math.round(rawScore),
      srm: Math.round(surviveRateModifier * 100) / 100,
      ggm: Math.round(goalGameModifier * 100) / 100,
      score: Math.round(score)
    };
  }
}
