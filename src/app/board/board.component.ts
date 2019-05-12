import { Component, OnInit, Input } from '@angular/core';
import { BoardOptions } from '../models/model.board-options';
import { Options } from 'selenium-webdriver/ie';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})



export class BoardComponent implements OnInit {
  columns : string[]; 
  @Input() Options : BoardOptions;

  constructor() { }

  ngOnInit() {
    if(this.Options.Data.length == 0) return;

    console.log(JSON.stringify(this.Options.Data[0]));

    var keys = Object.keys(this.Options.Data[0]);
    this.columns = Array(this.Options.DataOrder.length);

    for (let index = 0; index < this.Options.DataOrder.length; index++) {
      this.columns[index] = keys[this.Options.DataOrder[index]];
    }
    
    $("#" + this.Options.Id + " >> table").floatThead({position: 'fixed'});
    $("#" + this.Options.Id + " >> table").floatThead('reflow');
  }
}
