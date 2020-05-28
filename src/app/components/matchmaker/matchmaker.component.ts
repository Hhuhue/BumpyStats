import { Component, OnInit } from '@angular/core';
import { BumpyballService } from 'src/app/services/bumpyball.service';
import { Team } from 'src/app/models/models.team';

@Component({
  selector: 'app-matchmaker',
  templateUrl: './matchmaker.component.html',
  styleUrls: ['./matchmaker.component.css']
})
export class MatchmakerComponent implements OnInit {
  teams: string[];
  players: string[];
  selectedTeam: Team;
  selectedTeamExists = false;

  constructor(private bumpyball: BumpyballService) { }

  ngOnInit() {
    this.initTeamManager();
  }

  initTeamManager(){
    this.bumpyball.getTeamNames()
      .subscribe(names => this.teams = names);
    this.bumpyball.getPlayersName()
      .subscribe(names => this.players = names);
    this.selectedTeam = new Team(null);
    this.teams = [];
    this.onTeamNameChanged(null);
    $("#SelectedTeam").val("");
    $("#NewTeamName").val("");
    $("#NewMemberName").val("");
  }

  onTeamNameChanged(event: any){
    if (!this.teams) return;

    this.selectedTeam.Name = $("#SelectedTeam").val().toString();
    if (this.teams.indexOf(this.selectedTeam.Name) == -1){
      $("#TeamSubmit").removeClass("btn-warning");
      $("#TeamSubmit").addClass("btn-success");
      $("#TeamSubmit").text("Create");
      $("#AddMemberForm").hide();
      $("#TeamMembers").hide();  
      $("#NewNameForm").hide();
      this.selectedTeam = new Team(null);
    } else {
      $("#TeamSubmit").removeClass("btn-success");
      $("#TeamSubmit").addClass("btn-warning");
      $("#TeamSubmit").text("Save");
      this.bumpyball.getTeamData(this.selectedTeam.Name)
        .subscribe(team => {this.selectedTeam = new Team(team); this.loadTeamData()});
    }
  }

  onAddPlayer(){
    var newPlayer = $("#NewMemberName").val().toString();
    this.selectedTeam.Teammates.push(newPlayer);
    this.loadTeamData();
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
    $("#NewNameForm").show();
  }

}
