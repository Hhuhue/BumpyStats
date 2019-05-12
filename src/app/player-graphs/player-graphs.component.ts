import { Component, OnInit, Input } from '@angular/core';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import { PlayerData } from '../models/model.player-data';

@Component({
  selector: 'app-player-graphs',
  templateUrl: './player-graphs.component.html',
  styleUrls: ['./player-graphs.component.css']
})
export class PlayerGraphsComponent implements OnInit {

  constructor() { }

  @Input() rawData : any;
  @Input() playerData : PlayerData[];

  ngOnInit() {
    this.setCharts();
  }

  private setCharts() {
    var data: any = this.getGameChart();
    var element: any = document.getElementById('GameChart');
    var ctx = element.getContext('2d');

    var gameChart = new Chart(ctx, {
      type: 'bar',
      data: data['data'],
      options: data['option']
    });

    data = this.getPerformanceChart();
    element = document.getElementById('PerformanceChart');
    ctx = element.getContext('2d');

    var performanceChart = new Chart(ctx, {
      type: 'bar',
      data: data['data'],
      options: data['option']
    });

    data = this.getProgressionChart();
    element = document.getElementById('ProgressionChart');
    ctx = element.getContext('2d');

    var performanceChart = new Chart(ctx, {
      type: 'line',
      data: data['data'],
      options: data['option'],
      fill : false
    });

    data = this.getGameDistribution();
    element = document.getElementById('GameRatioChart');
    ctx = element.getContext('2d');

    var gameRatiosChart = new Chart(ctx, {
      type: 'doughnut',
      data: data['data'],
      options: data['option'],
    });
  }

  private getGameChart() {
    var labels = [];
    var winSet = [];
    var drawSet = [];
    var lossSet = [];

    this.playerData.forEach(data => {
      var date = moment(data.DataDate).subtract(1, 'days').format('YYYY-MM-DD');
      labels.push(date);

      if (data.Progress) {
        winSet.push(data.Progress.Wins);
        drawSet.push(data.Progress.Draws);
        lossSet.push(data.Progress.Losses);
      } else {
        winSet.push(0);
        drawSet.push(0);
        lossSet.push(0);
      }
    });

    var chart = {
      labels: labels,
      datasets: [
        { label: 'Losses', backgroundColor: '#b24a4a', data: lossSet },
        { label: 'Draws', backgroundColor: '#999999', data: drawSet },
        { label: 'Wins', backgroundColor: '#23e2bc', data: winSet }
      ]
    };

    var options = {
      title: { display: true, text: 'Game Results' },
      tooltips: { mode: 'index', intersect: false },
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [{ stacked: true }]
      }
    }

    return { data: chart, option: options };
  }

  private getPerformanceChart() {
    var labels = [];
    var goalSet = [];
    var assistSet = [];

    this.playerData.forEach(data => {      
      var date = moment(data.DataDate).subtract(1, 'days').format('YYYY-MM-DD');
      labels.push(date);

      if (data.Progress) {
        goalSet.push(data.Progress.Goals);
        assistSet.push(data.Progress.Assists);
      } else {
        goalSet.push(0);
        assistSet.push(0);
      }
    });

    var chart = {
      labels: labels,
      datasets: [
        { label: 'Assists', backgroundColor: '#b24a4a', data: assistSet },
        { label: 'Goals', backgroundColor: '#23e2bc', data: goalSet }
      ]
    };

    var options = {
      title: { display: true, text: 'Performance Results' },
      tooltips: { mode: 'index', intersect: true },
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [{ stacked: true }]
      }
    }

    return { data: chart, option: options };
  }

  private getProgressionChart() {
    var labels = [];
    var expSet = [];

    this.playerData.forEach(data => {
      labels.push(data.DataDate);
      expSet.push(data.State.Experience);
    });

    var chart = {
      labels: labels,
      datasets: [
        {
          label: 'Experience',
          backgroundColor: '#23e2bc',
          borderColor: '#23e2bc',
          data: expSet,
          fill: false
        }
      ]
    };

    var options = {
      title: { display: true, text: 'Progression' },
      tooltips: { mode: 'index', intersect: true },
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        xAxes: [{ display: true }],
        yAxes: [{ display: true }]
      },
      elements: {
        line: {
          tension: 0
        }
      }
    }

    return { data: chart, option: options };
  }

  private getGameDistribution() {
    var labels = ['Win %', 'Draw %', 'Loss%'];
    var dataSet = [
      this.rawData.ratio.WinGame,
      this.rawData.ratio.DrawGame,
      this.rawData.ratio.LossGame
    ];

    var chart = {
      labels: labels,
      datasets: [
        {
          backgroundColor: ['#23e2bc', '#999999', '#b24a4a'],
          data: dataSet,
          fill: false
        }
      ]
    };

    var options = {
      title: { display: true, text: 'Game Ratios' },
      responsive: true,
      legend: {
        position: 'top',
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }

    return { data: chart, option: options };
  }

}
