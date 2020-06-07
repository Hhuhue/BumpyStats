import { Component, OnInit } from '@angular/core';
import { BumpyballService } from '../../services/bumpyball.service'
import * as Chart from 'chart.js';
import * as moment from 'moment';
import { ActivityRecord } from 'src/app/models/models.activity-record';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {
  fromDate = moment().subtract(7, 'days').format("YYYY-MM-DD");
  toDate = moment().format("YYYY-MM-DD");
  activityChart = null;

  constructor(private bumpyball : BumpyballService) {  }

  ngOnInit() {
    $("#FromDate").val(this.fromDate);
    $("#ToDate").val(this.toDate);
    this.displayActivity();
  }

  displayActivity(){
    var dateRange = [this.fromDate, this.toDate];
    this.bumpyball.getActivity(JSON.stringify(dateRange))
      .subscribe(activity => this.setChart(activity))
  }

  private setChart(activity : ActivityRecord[]){
    var data : any = this.getTimelineChart(activity);
    var element : any = document.getElementById('TimelineChart');
    var ctx = element.getContext('2d');
    if (this.activityChart){
      this.activityChart.data = data['data'];
      this.activityChart.update();
    } else {
      this.activityChart = new Chart(ctx, {
        type: 'line',
        data: data['data'],
        options: data['option']
      });
    }
  }
  
  private getTimelineChart(activity : ActivityRecord[]) {
    var data = [];
    
    activity.forEach(element => {
      data.push({t: moment(element.DateTime).format("YYYY-MM-DD hh:mm:ss a"), y: element.PlayerCount});
    });
    
    var chart = {
      datasets: [{
        label: 'Player Count',
        backgroundColor: '#23e2bc',
        borderColor: '#23e2bc',
        data: data,
        pointRadius: 0,
        fill: false,
        lineTension: 0,
        borderWidth: 2
      }]
    };

    var options = {
      responsive: true,
      title: {
        display: true,
        text: 'Activity Timeline'
      },
      scales: {
        xAxes: [{
          type: 'time',
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Date'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Player Count'
          }
        }]
      }
    };
    return { data: chart, option: options };
  }
}
