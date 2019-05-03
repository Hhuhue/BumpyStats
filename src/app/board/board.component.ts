import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})



export class BoardComponent implements OnInit {
  columns : string[]; 
  @Input() data;
  @Input() labels : string[]; 
  @Input() order : number[];
  @Input() id : string;

  constructor() { }

  ngOnInit() {
    if(this.data.length == 0) return;

    var keys = Object.keys(this.data[0]);
    this.columns = Array(this.order.length);

    for (let index = 0; index < this.order.length; index++) {
      this.columns[index] = keys[this.order[index]];
    }
    
    $("#" + this.id + " >> table").floatThead({position: 'fixed'});
    $("#" + this.id + " >> table").floatThead('reflow');
  }
}
