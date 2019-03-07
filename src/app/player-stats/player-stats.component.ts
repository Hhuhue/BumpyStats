import { Component, OnInit } from '@angular/core';
import { BumpyballService } from '../bumpyball.service';
import { PlayerData } from '../models/model.player-data';
import { StatisticsService } from '../statistics.service';
import * as Chart from 'chart.js';
import { LeaderboardEntry } from '../models/model.leaderboard-entry';

@Component({
  selector: 'app-player-stats',
  templateUrl: './player-stats.component.html',
  styleUrls: ['./player-stats.component.css']
})

export class PlayerStatsComponent implements OnInit {
  names: string[];
  playerData: PlayerData[];
  data : LeaderboardEntry;

  constructor(private bumpyball: BumpyballService,
    private statService : StatisticsService
  ) { }

  ngOnInit() {
    this.bumpyball.getPlayerNames().subscribe(names => this.names = names);
  }

  onEnter(event: any) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode.toString() == '13') {
      this.bumpyball.getPlayerData($("#SearchedPlayer").val().toString())
        .subscribe(data => {
          this.playerData = this.statService.buildPlayerData(data);
          this.data = this.playerData[this.playerData.length - 1].State;
          this.setCharts();
        });
    }
  }

  private setCharts(){
    var data : any = this.getGameChart();
    var element : any = document.getElementById('GameChart');
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
      fill: false
    });
  }

  private getGameChart(){
    var labels = [];
    var winSet = [];
    var drawSet = [];
    var lossSet = [];

    this.playerData.forEach(data => {
      labels.push(data.DataDate);

      if(data.Progress){
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
        { label: 'Losses', backgroundColor: '#b24a4a', data : lossSet },
        { label: 'Draws', backgroundColor: '#999999', data : drawSet },
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

    return {data : chart, option : options};
  }

  private getPerformanceChart(){
    var labels = [];
    var goalSet = [];
    var assistSet = [];

    this.playerData.forEach(data => {
      labels.push(data.DataDate);

      if(data.Progress){
        goalSet.push(data.Progress.goals);
        assistSet.push(data.Progress.assists);
      } else {        
        goalSet.push(0);
        assistSet.push(0);
      }
    });

    var chart = {
      labels: labels,
      datasets: [
        { label: 'Assists', backgroundColor: '#b24a4a', data : assistSet },
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

    return {data : chart, option : options};
  }

  private getProgressionChart(){
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

    console.log(chart);
    return {data : chart, option : options};
  }
}
