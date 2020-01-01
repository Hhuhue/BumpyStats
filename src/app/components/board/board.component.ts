import { Component, OnInit, Input } from '@angular/core';
import { BoardOptions } from '../../models/model.board-options';
import { StatisticsService } from '../../services/statistics.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})

export class BoardComponent implements OnInit {
  columns : string[]; 
  formatOption : any; 
  @Input() Options : BoardOptions;

  constructor(private statService : StatisticsService) { }

  ngOnInit() {
    if(this.Options.Data.length == 0) return;

    var keys = Object.keys(this.Options.Data[0]);
    this.columns = Array(this.Options.DataOrder.length);
    this.formatOption = {};

    for (let index = 0; index < this.Options.DataOrder.length; index++) {
      var column = keys[this.Options.DataOrder[index]];
      this.columns[index] = column;
      this.formatOption[column] = this.Options.HasDecimal[index];
    }
    
    $("#" + this.Options.Id + " >> table").floatThead({position: 'fixed'});
    $("#" + this.Options.Id + " >> table").floatThead('reflow');
  }

  format(number : number, withDecimal : boolean){
    return this.statService.formatNumber(number, withDecimal);
  }

  isNaN(value : any){
    return !Number.isInteger(value);
  }
}
