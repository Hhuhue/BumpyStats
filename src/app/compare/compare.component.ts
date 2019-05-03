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
      .subscribe(entries => this.setScatterChart(entries));
  }

  private setScatterChart(entries: LeaderboardEntry[]) {
    var element: any = document.getElementById("myChart");
    var ctx = element.getContext('2d');

    // Define the data 
    var data = [];
    entries.forEach(entry => {
      data.push({
        x: entry.Draws + entry.Losses + entry.Wins,
        y: Math.round(entry.Experience / 1000),
        name : entry.last_name
      });
    });

    // End Defining data
    var options = {
      responsive: true, // Instruct chart js to respond nicely.
      maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height
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
                callback: function(value, index, values) {
                    return value + 'k';
                }
            }
        }]
    }
    };

    // End Defining data
    var myChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Exp / Game  Distribution',
          data: data,
          borderColor: 'rgb(2, 18, 20)',
          backgroundColor: 'rgba(2, 18, 20, 0.2)', 
        }]
      },
      options: options
    });
  }
}
