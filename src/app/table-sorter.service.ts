import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableSorterService {

  constructor() { }

  sortTable(table, element){
    if(!table) return [];
    if(table.length == 0) return [];

    if(table.length == 1){
      return table;
    } else if (table.length == 2){
      if (table[0][element] > table[1][element]){
        var temp = table[0]; 
        table[0] = table[1];
        table[1] = temp;
      }
      return table;
    } else {
      var middle =  Math.round(table.length / 2);
      var first = this.sortTable(table.slice(0, middle), element);
      var second = this.sortTable(table.slice(middle), element);

      return this.fusion(first, second, element);
    }
  }

  private fusion(table1, table2, element){
    var i = 0;
    var j = 0;
    var size = table1.length + table2.length;
    var table = [];

    for (let index = 0; index < size; index++) {
      var val1 = (i == table1.length) ? Number.MAX_SAFE_INTEGER : table1[i][element];
      var val2 = (j == table2.length) ? Number.MAX_SAFE_INTEGER : table2[j][element];

      if(val1 < val2){
        table.push(table1[i]);
        i++;
      } else {
        table.push(table2[j]);
        j++;
      }      
    }

    return table;
  }
}
