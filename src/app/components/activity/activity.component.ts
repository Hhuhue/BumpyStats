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

  constructor(private bumpyball : BumpyballService) {  }

  ngOnInit() {
    this.bumpyball.getActivity()
      .subscribe(activity => this.setChart(activity))
  }

  private setChart(activity : ActivityRecord[]){
    var data : any = this.getTimelineChart(activity);
    var element : any = document.getElementById('TimelineChart');
    var ctx = element.getContext('2d');

    var timelineChart = new Chart(ctx, {
      data: data['data'],
      options: data['option']
    });
  }

  private getTimelineChart(activity : ActivityRecord[]) {
    var data = [];
    
    activity.forEach(element => {
      data.push({t: moment(element.DateTime).valueOf(), y: element.PlayerCount});
    });
    
    console.log(data);
    var chart = {
      datasets: [{
        label: 'Player Count',
        backgroundColor: '#23e2bc',
        borderColor: '#23e2bc',
        data: data,
        type: 'line',
        pointRadius: 0,
        fill: false,
        lineTension: 0,
        borderWidth: 2
      }]
    };

    var options = {
      title: { display: true, text: 'Activity Timeline' },
      animation: {
        duration: 0
      },
      scales: {
        xAxes: [{
          type: 'time',
          distribution: 'series',
          offset: true,
          ticks: {
            major: {
              enabled: true,
              fontStyle: 'bold'
            },
            source: 'data',
            autoSkip: true,
            autoSkipPadding: 75,
            maxRotation: 0,
            sampleSize: 100
          },
          afterBuildTicks: function(scale, ticks) {
            var majorUnit = scale._majorUnit;
            var firstTick = ticks[0];
            var i, ilen, val, tick, currMajor, lastMajor;

            val = moment(ticks[0].value);
            if ((majorUnit === 'minute' && val.second() === 0)
                || (majorUnit === 'hour' && val.minute() === 0)
                || (majorUnit === 'day' && val.hour() === 9)
                || (majorUnit === 'month' && val.date() <= 3 && val.isoWeekday() === 1)
                || (majorUnit === 'year' && val.month() === 0)) {
              firstTick.major = true;
            } else {
              firstTick.major = false;
            }
            lastMajor = val.get(majorUnit);

            for (i = 1, ilen = ticks.length; i < ilen; i++) {
              tick = ticks[i];
              val = moment(tick.value);
              currMajor = val.get(majorUnit);
              tick.major = currMajor !== lastMajor;
              lastMajor = currMajor;
            }
            return ticks;
          }
        }],
        yAxes: [{
          gridLines: {
            drawBorder: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Player Count'
          }
        }]
      },
      tooltips: {
        intersect: false,
        mode: 'index',
        callbacks: {
          label: function(tooltipItem, myData) {
            var label = myData.datasets[tooltipItem.datasetIndex].label || '';
            if (label) {
              label += ': ';
            }
            label += parseFloat(tooltipItem.value).toFixed(2);
            return label;
          }
        }
      }      
    };
    return { data: chart, option: options };
  }
}
