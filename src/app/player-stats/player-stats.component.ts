import { Component, OnInit } from '@angular/core';
import { BumpyballService } from '../bumpyball.service';

@Component({
  selector: 'app-player-stats',
  templateUrl: './player-stats.component.html',
  styleUrls: ['./player-stats.component.css']
})

export class PlayerStatsComponent implements OnInit {
  names : string[];

  constructor(private bumpyball : BumpyballService) { }

  ngOnInit() {
    this.bumpyball.getPlayerNames().subscribe(names => this.names = names);
  }

}
