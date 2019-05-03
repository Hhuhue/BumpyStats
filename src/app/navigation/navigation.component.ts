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
    var url = window.location.href.split("/");
    var location = url[url.length - 1];

    switch(location) {
      case "Leaderboards":
        this.onSelect(1);
        break;
      case "PlayerStats":
        this.onSelect(2);
        break;
        case "Compare":
          this.onSelect(3);
          break;
      case "Register":
        this.onSelect(4);
        break;
      default:
        this.onSelect(1);
    }
  }

  onSelect(index){
    this.selectedIndex = index;
  }
}
