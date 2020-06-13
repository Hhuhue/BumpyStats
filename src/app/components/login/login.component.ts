import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(public auth : AuthService) { }

  ngOnInit() {
  }
  
  onLogin(){
    this.auth.login($("#Password").val());
  }

  onLogout(){
    this.auth.logout();
  }

}
