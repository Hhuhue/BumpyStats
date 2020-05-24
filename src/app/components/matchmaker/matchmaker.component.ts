import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-matchmaker',
  templateUrl: './matchmaker.component.html',
  styleUrls: ['./matchmaker.component.css']
})
export class MatchmakerComponent implements OnInit {
  teams: string[];
  selectedTeam: string;

  constructor() { }

  ngOnInit() {

  }

}
