import { Component } from '@angular/core';
import * as $ from 'jquery';
import { StatisticsService } from './services/statistics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'BumpyStats';
  JQuery = $;

  constructor() {
  }
}
