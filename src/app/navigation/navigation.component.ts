import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  selectedIndex = 1;
  constructor() { }

  ngOnInit() {
  }

  onSelect(index){
    this.selectedIndex = index;
  }

}
