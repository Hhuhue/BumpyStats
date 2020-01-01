import { Component, OnInit } from '@angular/core';
import { BumpyballService } from '../../services/bumpyball.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  result : any;
  message : string;

  constructor(private bumpyball : BumpyballService) { }

  ngOnInit() {
  }

  onEnter(event: any) {
    if(!event) return;

    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode.toString() == '13') {
      this.bumpyball.getPlayerFromUID($("#GUID").val().toString())
        .subscribe(data => this.result = data);
    }
  }

  onConfirm(){
    this.bumpyball.sendPlayerFromUID(this.result['Uid'])
    this.result = undefined;
    this.message = "Enter your name at the player stat page to confirm success"
  }
}
