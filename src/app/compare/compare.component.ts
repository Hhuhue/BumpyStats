import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from '../models/model.leaderboard-entry';
import { StatisticsService } from '../statistics.service';
import { TableSorterService } from '../table-sorter.service';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css']
})
export class CompareComponent implements OnInit {
  constructor(private statService: StatisticsService, private sorter: TableSorterService) { }

  ngOnInit() {
    this.statService.getLeaderboard(false)
      .subscribe(entries => this.setScatterCharts(entries));
  }

  private setScatterCharts(entries: LeaderboardEntry[]) {
    var data = [];
    entries.forEach(entry => {
      let x = entry.Draws + entry.Losses + entry.Wins;
      let y = Math.round(entry.Experience / 1000);

      data.push({
        x: x,
        y: y,
        name: entry.last_name
      });
    });

    data = this.sorter.sortTable(data, 'x');
    this.setScatterChart(data, this.getExpScatterOptions(), "myChart", true);

    data = [];
    entries.forEach(entry => {
      let x = entry.Draws + entry.Losses + entry.Wins;
      let y = Math.round(entry.Wins / x * 10000) / 100;

      data.push({
        x: x,
        y: y,
        name: entry.last_name
      });
    });

    data = this.sorter.sortTable(data, 'x');
    this.setScatterChart(data, this.getWinScatterOptions(), "myChart2", false);

    data = [];
    entries.forEach(entry => {
      let x = entry.Draws + entry.Losses + entry.Wins;
      let y = Math.round(entry.goals / x * 100) / 100;

      data.push({
        x: x,
        y: y,
        name: entry.last_name
      });
    });

    data = this.sorter.sortTable(data, 'x');
    this.setScatterChart(data, this.getGoalScatterOptions(), "myChart3", false);
  }

  private setScatterChart(points : any[], options : object, id : string, round : boolean){
    var element: any = document.getElementById(id);
    var ctx = element.getContext('2d');

    var regression = this.statService.linearRegression(points, 20, points[0].x, points[points.length-1].x + 100);
    var CI = this.statService.regressionConfidenceInterval(points, regression);
    if(round){
      regression = this.roudPoints(regression);
      CI[0] = this.roudPoints(CI[0]);
      CI[1] = this.roudPoints(CI[1]);
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
        },{
          label: '',
          data: CI[0],
          borderColor: 'rgb(178, 74, 74)',
          backgroundColor: 'rgba(178, 74, 74, 0.2)',
          showLine: true,
          fill: false
        },{
          label: 'Error Margin',
          data: CI[1],
          borderColor: 'rgb(178, 74, 74)',
          backgroundColor: 'rgba(178, 74, 74, 0.2)',
          showLine: true,
          fill: false
        },{
          label: 'Distribution',
          data: points,
          borderColor: 'rgb(2, 18, 20)',
          backgroundColor: 'rgba(2, 18, 20, 0.2)',
        }]
      },
      options: options
    });
  }

  private getExpScatterOptions(){
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

  private getWinScatterOptions(){
    return {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          title: (items, data) => data.datasets[items[0].datasetIndex].data[items[0].index].name,
          label: (item, data) => {
            var entry = data.datasets[item.datasetIndex].data[item.index];
            return "(games: " + entry.x + ", Win %: " + entry.y + "%)";
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
            labelString: 'Win %'
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

  private getGoalScatterOptions(){
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

  private roudPoints(points : any[]){
    for (let i = 0; i < points.length; i++) {
      points[i].x = Math.round(points[i].x);
      points[i].y = Math.round(points[i].y);
    }

    return points;
  }
}
