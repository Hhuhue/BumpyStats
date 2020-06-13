import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BumpyballService } from './bumpyball.service';
import { FlashMessagesService } from 'angular2-flash-messages';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    public jwtHelper: JwtHelperService, 
    public bumpyball: BumpyballService,
    private flashMessage: FlashMessagesService) { }

  public login(password){
    this.bumpyball.postAuthCredentials(password)
      .subscribe(result => this.logUser(result));
  }

  public logout(){
      localStorage.removeItem('token');
      this.flashMessage.show("Logout successful", { cssClass: 'alert-success', timeout: 2000 })
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    // Check whether the token is expired and return
    // true or false
    return !this.jwtHelper.isTokenExpired(token);
  }

  private logUser(data){
    if(data != -1){
      localStorage.setItem('token',data);
      this.flashMessage.show("Login successful", { cssClass: 'alert-success', timeout: 2000 })
    } else {
      this.flashMessage.show("Login failed", { cssClass: 'alert-danger', timeout: 2000 })
    }
  }
}
