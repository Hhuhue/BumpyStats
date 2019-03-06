import { Component, OnInit } from '@angular/core';
import { BumpyballService } from '../bumpyball.service';

@Component({
  selector: 'app-player-stats',
  templateUrl: './player-stats.component.html',
  styleUrls: ['./player-stats.component.css']
})

export class PlayerStatsComponent implements OnInit {
  names: string[];
  playerData: any;

  constructor(private bumpyball: BumpyballService) { }

  ngOnInit() {
    this.bumpyball.getPlayerNames().subscribe(names => this.names = names);
  }

  onEnter(event: any) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode.toString() == '13') {
      this.bumpyball.getPlayerData($("#SearchedPlayer").val().toString())
        .subscribe(data => this.playerData = JSON.stringify(data));
    }
  }
}
