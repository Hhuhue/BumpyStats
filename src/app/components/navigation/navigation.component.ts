import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  selectedIndex = 1;
  constructor(public auth : AuthService) { }

  ngOnInit() {
    var url = window.location.href.split("/");
    var location = url[url.length - 1];

    switch (location) {
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
      case "Graveyard":
        this.onSelect(5);
        break;
      case "About":
        this.onSelect(6);
        break;
      case "Matchmaker":
        this.onSelect(7);
        break;
      default:
        this.onSelect(1);
    }
  }

  onSelect(index) {
    this.selectedIndex = index;
  }

  onLogin(){
    this.auth.login("G3tR4nk3d!");
  }

  onLogout(){
    this.auth.logout();
  }
}
