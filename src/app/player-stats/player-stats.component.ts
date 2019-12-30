import { Component, OnInit } from '@angular/core';
import { BumpyballService } from '../bumpyball.service';
import { PlayerData } from '../models/model.player-data';
import { StatisticsService } from '../statistics.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import * as md5 from 'md5';

@Component({
  selector: 'app-player-stats',
  templateUrl: './player-stats.component.html',
  styleUrls: ['./player-stats.component.css']
})

export class PlayerStatsComponent implements OnInit {
  name: string;
  playerData: PlayerData[];
  rawData: any;

  level: number = 0;
  expNeededForLevelUp: number = 0;
  expAccumulated: number = 0;
  levelUpProgress: string = "";
  gamesUntilLevelUp: number = 0;
  averageSessionTime: number = -1;
  names: string[] = [];

  constructor(private bumpyball: BumpyballService,
    private statService: StatisticsService,
    private flashMessage: FlashMessagesService
  ) { }

  ngOnInit() {
    this.bumpyball.getPlayersName()
      .subscribe(names => this.names = names);
  }

  onEnter(event: any) {
    if (!event) return;
    var keycode = (event.keyCode ? event.keyCode : event.which);

    if (keycode && keycode.toString() == '13') {
      this.rawData = undefined;
      this.name = $("#SearchedPlayer").val().toString();

      this.bumpyball.getPlayerData(md5(this.name))
        .subscribe(data => this.setData(data));

      this.bumpyball.getPlayerAverageTime(md5(this.name))
        .subscribe(avg => this.averageSessionTime = Math.round(avg));
    }
  }

  private setData(data) {
    if (data == -1) {
      this.flashMessage.show("Player <b>" + this.name + "</b> not found", { cssClass: 'alert-danger', timeout: 5000 })
      this.name = "";
    } else {
      this.playerData = this.statService.buildPlayerData(data);
      var state = this.playerData[this.playerData.length - 1].State;
      var ratio = this.statService.entryToRatio(state);
      this.rawData = { state, ratio };

      this.level = this.statService.expToLevel(this.playerData[this.playerData.length - 1].State.Experience);
      this.expNeededForLevelUp = this.statService.getExpForNextLevel(this.level);
      this.expAccumulated = state.Experience - this.statService.getAccumulatedExpAtLevel(this.level - 1);
      this.levelUpProgress = Math.round(this.expAccumulated / this.expNeededForLevelUp * 100) + '%';
      this.gamesUntilLevelUp = Math.round((this.expNeededForLevelUp - this.expAccumulated) / ratio.ExpGame);
    }
  }
}
