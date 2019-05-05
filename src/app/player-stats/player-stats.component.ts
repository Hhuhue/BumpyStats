import { Component, OnInit } from '@angular/core';
import { BumpyballService } from '../bumpyball.service';
import { PlayerData } from '../models/model.player-data';
import { StatisticsService } from '../statistics.service';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-player-stats',
  templateUrl: './player-stats.component.html',
  styleUrls: ['./player-stats.component.css']
})

export class PlayerStatsComponent implements OnInit {
  name: string;
  playerData: PlayerData[];
  rawData: any;
  level : number = 0;

  constructor(private bumpyball: BumpyballService,
    private statService: StatisticsService,
    private flashMessage: FlashMessagesService
  ) { }

  ngOnInit() {
    //this.bumpyball.getPlayerNames().subscribe(names => this.names = names);
  }

  onEnter(event: any) {
    if (!event) return;
    var keycode = (event.keyCode ? event.keyCode : event.which);

    if (keycode && keycode.toString() == '13') {
      this.rawData = undefined;
      this.name = $("#SearchedPlayer").val().toString();
      this.bumpyball.getPlayerData(encodeURIComponent(this.name)).subscribe(data => this.setData(data));
    }
  }
  
  private setData(data){
    if(data == -1){
      this.flashMessage.show("Player <b>" + this.name + "</b> not found", {cssClass : 'alert-danger', timeout : 5000})
      this.name = "";
    } else {
      this.playerData = this.statService.buildPlayerData(data);
      this.level = this.statService.expToLevel(this.playerData[this.playerData.length - 1].State.Experience);
      var state = this.playerData[this.playerData.length - 1].State;
      var ratio = this.statService.entryToRatio(state);
      this.rawData = { state, ratio };
    }
  }
}
