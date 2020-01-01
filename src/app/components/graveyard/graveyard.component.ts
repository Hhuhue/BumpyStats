import { Component, OnInit } from '@angular/core';
import { BumpyballService } from '../../services/bumpyball.service';
import { TableSorterService } from '../../services/table-sorter.service';

@Component({
  selector: 'app-graveyard',
  templateUrl: './graveyard.component.html',
  styleUrls: ['./graveyard.component.css']
})
export class GraveyardComponent implements OnInit {

  progressEntries: any[];

  constructor(private bumpyball: BumpyballService, private sorter: TableSorterService) { }

  ngOnInit() {
    this.bumpyball.getLatestProgresses()
      .subscribe(entries => this.setProgresses(entries));

    $("#GraveyardBoard").floatThead({ position: 'fixed' });
    $("#GraveyardBoard").floatThead('reflow');
  }

  private setProgresses(progresses: any[]) {
    var minimumDaysInactive = 3;
    var dyingPlayers = []
    for (let index = 0; index < progresses.length; index++) {
      var daysIncative = this.daysSinceDate(progresses[index].progressDate);

      if(daysIncative >= minimumDaysInactive){
        progresses[index].daysCount = daysIncative;
        dyingPlayers.push(progresses[index]);
      }
    }   

    this.progressEntries = this.sorter.sortTable(dyingPlayers, 'daysCount');
  }

  private daysSinceDate(date) {
    const date1 = new Date();

    var parts = date.split('-');
    var date2 = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])); 

    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
