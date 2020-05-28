import { Component, OnInit } from '@angular/core';
import { BumpyballService } from 'src/app/services/bumpyball.service';
import { Team } from 'src/app/models/models.team';
import { TournamentEvent } from 'src/app/models/models.tournament-event';

@Component({
  selector: 'app-matchmaker',
  templateUrl: './matchmaker.component.html',
  styleUrls: ['./matchmaker.component.css']
})
export class MatchmakerComponent implements OnInit {
  teams: string[];
  players: string[];
  events: string[];
  selectedTeam: Team;
  selectedEvent: TournamentEvent;
  selectedTeamExists = false;

  constructor(private bumpyball: BumpyballService) { }

  ngOnInit() {
    this.bumpyball.getPlayersName()
      .subscribe(names => this.players = names);
    this.initTeamManager();
    this.initEventManager();
  }

  initTeamManager(){
    this.teams = [];
    this.bumpyball.getTeamNames()
      .subscribe(names => this.teams = names);
    this.selectedTeam = new Team(null);
    $("#SelectedTeam").val("");
    $("#NewTeamName").val("");
    $("#NewMemberName").val("");
    this.onTeamNameChanged();
  }

  initEventManager(){
    this.events = [];
    this.bumpyball.getEventNames()
      .subscribe(names => this.events = names);
    this.selectedEvent = new TournamentEvent(null);
    $("#SelectedEvent").val("");
    $("#NewEventName").val("");
    this.onEventNameChanged();
  }

  onTeamNameChanged(){
    if (!this.teams) return;

    this.selectedTeam.Name = $("#SelectedTeam").val().toString();
    if (this.teams.indexOf(this.selectedTeam.Name) == -1){
      $("#TeamSubmit").removeClass("btn-warning");
      $("#TeamSubmit").addClass("btn-success");
      $("#TeamSubmit").text("Create");
      $("#AddMemberForm").hide();
      $("#TeamMembers").hide();  
      $("#NewTeamNameForm").hide();
      this.selectedTeam = new Team(null);
    } else {
      $("#TeamSubmit").removeClass("btn-success");
      $("#TeamSubmit").addClass("btn-warning");
      $("#TeamSubmit").text("Save");
      this.bumpyball.getTeamData(this.selectedTeam.Name)
        .subscribe(team => {this.selectedTeam = new Team(team); this.loadTeamData()});
    }
  }

  onEventNameChanged(){
    if (!this.events) return;

    this.selectedEvent.Name = $("#SelectedEvent").val().toString();
    if (this.events.indexOf(this.selectedEvent.Name) == -1){
      $("#NewEventNameForm").hide();
      $("#EventSubmit").removeClass("btn-warning");
      $("#EventSubmit").addClass("btn-success");
      $("#EventSubmit").text("Create");
    } else {
      $("#EventSubmit").removeClass("btn-success");
      $("#EventSubmit").addClass("btn-warning");
      $("#EventSubmit").text("Save");
      this.bumpyball.getEventData(this.selectedEvent.Name)
        .subscribe(team => {this.selectedEvent = new TournamentEvent(team); this.loadEventData()});
    }
  }

  onAddPlayer(){
    var newPlayer = $("#NewMemberName").val().toString();
    this.selectedTeam.Teammates.push(newPlayer);
    this.loadTeamData();
    $("#NewMemberName").val("");
  }

  onRemovePlayer(event){
    var teamMember = event.target.parentNode;
    teamMember.remove();
  }

  onTeamSave(){
    var newTeamName = $("#NewTeamName").val().toString();
    if(this.selectedTeam.Name == ""){
      this.selectedTeam.Name = $("#SelectedTeam").val().toString();
    } else if(newTeamName != ""){
      this.selectedTeam.Name = newTeamName;
    }
    var memberList = $("#MemberList").children().get();
    var newTeammates = [];
    memberList.forEach(member => {
      var textNode : any = member.childNodes[0];
      newTeammates.push(textNode.wholeText);
    });
    this.selectedTeam.Teammates = newTeammates;

    console.log(this.selectedTeam);
    var teamData = JSON.stringify(this.selectedTeam);
    console.log(teamData);
    this.bumpyball.postTeamData(teamData).subscribe();
    this.initTeamManager();
  }

  onEventSave(){
    var newEventName = $("#NewEventName").val().toString();
    if(this.selectedEvent.Name == ""){
      this.selectedEvent.Name = $("#SelectedTeam").val().toString();
    } else if(newEventName != ""){
      this.selectedEvent.Name = newEventName;
    }

    var eventData = JSON.stringify(this.selectedEvent);
    console.log(eventData);
    this.bumpyball.postEventData(eventData).subscribe();
    this.initEventManager();
  }

  loadTeamData(){
    $("#MemberList").html(""); 

    this.selectedTeam.Teammates.forEach(teammate => {
      var element = document.createElement("i");
      var text = document.createTextNode(teammate)
      element.classList.add("fa", "fa-times", "delete-btn");
      element.addEventListener("click", this.onRemovePlayer);
      var span = document.createElement("span");
      span.appendChild(text);
      span.appendChild(element)
      
      $("#MemberList").append(span); 
    });
  
    $("#AddMemberForm").show();
    $("#TeamMembers").show();  
    $("#NewTeamNameForm").show();
  }

  loadEventData(){
    $("#NewEventNameForm").show();
  }

}
