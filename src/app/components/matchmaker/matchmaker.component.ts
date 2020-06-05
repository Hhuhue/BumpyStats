import { Component, OnInit } from '@angular/core';
import { BumpyballService } from 'src/app/services/bumpyball.service';
import { Team } from 'src/app/models/models.team';
import { TournamentEvent } from 'src/app/models/models.tournament-event';
import { toDate } from '@angular/common/src/i18n/format_date';
import { TournamentMatch } from 'src/app/models/models.tournament-match';
import * as moment from 'moment';

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
  selectedMatch: TournamentMatch;
  selectedTeamExists = false;

  constructor(private bumpyball: BumpyballService) { }

  ngOnInit() {
    this.bumpyball.getPlayersName()
      .subscribe(names => this.players = names);
    this.initTeamManager();
    this.initEventManager();
    this.initMatchManager();
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

  initMatchManager(){
    this.selectedMatch = new TournamentMatch(null);
    this.onMatchModeChange();
    this.onEnterResultsChange();
    this.onEnterPersonalGoalsChange();
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
    this.bumpyball.postEventData(eventData).subscribe();
    this.initEventManager();
  }

  onMatchSave(){
    this.selectedMatch.Event = $("#MatchEvent").val().toString();
    this.selectedMatch.IsAggregateWin = $("#AggregateScore").prop("checked");
    this.selectedMatch.Name = $("#Opponent1").text() + " VS " + $("#Opponent2").text();
    this.selectedMatch.Date = moment().toString();

    if ($("#EnterResults").prop("checked")){
      this.selectedMatch.VideoLink = $("#VideoLink").val().toString();
      var opponent1Goals = $("input[name=opp1]").map((idx, elem) => {return parseInt($(elem).val().toString());}).get();
      var opponent2Goals = $("input[name=opp2]").map((idx, elem) => {return parseInt($(elem).val().toString());}).get();
      for(var i = 0; i < opponent1Goals.length; i++){
        this.selectedMatch.Results.push([opponent1Goals[i], opponent2Goals[i]])
      }
      if($("#EnterPersonalGoals").prop("checked")){
        var personalGoals = $("#PersonalGoalSection>*").map((idx, elem) => {
          var personalData = [];
          var goalsAssists = $(elem).find("input").map((idx, elem) => {return parseInt($(elem).val().toString());}).get();
          personalData.push($(elem).attr("id"));
          return [personalData.concat(goalsAssists)];
        });
        this.selectedMatch.PersonalGoals = personalGoals.get();
      }
    }    
    console.log(this.selectedMatch);
  }

  onMatchModeChange(){
    var teamMatch = $("#MatchMode").prop("checked");
    this.selectedMatch.IsTeamMatch = teamMatch;
    if(teamMatch){
      $("#1v1Form").hide();
      $("#TvTForm").show();
      $("#Player1").val("");
      $("#Player2").val("");
      $("#EnterPersonalGoals").removeAttr("disabled");
      $("#EnterPersonalGoals").prop("checked", false);
      this.onEnterPersonalGoalsChange();
    } else {
      $("#1v1Form").show();
      $("#TvTForm").hide();
      $("#Team1").val("");
      $("#Team2").val("");
      $("#EnterPersonalGoals").attr("disabled","disabled");
    }
  }

  onEnterResultsChange(){
    var enterResults = $("#EnterResults").prop("checked");
    if(enterResults){
      $("#ResultsForm").show();
    } else {
      $("#ResultsForm").hide();
    }
  }

  onEnterPersonalGoalsChange(){
    var enterPersonalGoals = $("#EnterPersonalGoals").prop("checked");
    if(enterPersonalGoals && this.selectedMatch.IsTeamMatch){
      $("#PersonalGoalSection").show();
        this.bumpyball.getTeamData(this.selectedMatch.Opponent1)
          .subscribe(t1 => this.bumpyball.getTeamData(this.selectedMatch.Opponent2)
            .subscribe(t2 => {
              var team1 = (t1 == -1) ? new Team(null) : new Team(t1);
              var team2 = (t2 == -1) ? new Team(null) : new Team(t2);
              this.loadMatchIndividuals(team1.Teammates.concat(team2.Teammates));
        }));
    } else {
      this.loadMatchIndividuals([]);
      $("#PersonalGoalSection").hide();
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

  onRemoveGame(row){
    row.remove();
  }

  onOpponentsChanged(){
    var teamMatch = $("#MatchMode").prop("checked");
    if(teamMatch){
      $("#Opponent1").text($("#Team1").val().toString());
      $("#Opponent2").text($("#Team2").val().toString());
      this.onEnterPersonalGoalsChange()
    } else {
      $("#Opponent1").text($("#Player1").val().toString());
      $("#Opponent2").text($("#Player2").val().toString());
    }
    this.selectedMatch.Opponent1 = $("#Opponent1").text();
    this.selectedMatch.Opponent2 = $("#Opponent2").text();
  }

  onAddGame(){
    var row = document.createElement("tr");
    var opponent1Goals = document.createElement("input");
    var opponent2Goals = document.createElement("input");
    var td0 = document.createElement("td");
    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    var td3 = document.createElement("td");
    var deleteBtn = document.createElement("span");

    var deleteFunc = this.onRemoveGame;
    var updateIndexFunc = this.updateGameIndex;

    opponent1Goals.setAttribute("type", "text");
    opponent2Goals.setAttribute("type", "text");
    opponent1Goals.setAttribute("name", "opp1");
    opponent2Goals.setAttribute("name", "opp2");
    opponent1Goals.setAttribute("class", "form-control");
    opponent2Goals.setAttribute("class", "form-control");
    deleteBtn.setAttribute("class", "btn btn-outline-danger");
    deleteBtn.innerHTML = "<i class='fa fa-times'></i>";
    deleteBtn.addEventListener("click", () => {    
      deleteFunc(row);
      updateIndexFunc();    
    }); 

    td0.setAttribute("name", "index");
    td1.appendChild(opponent1Goals);
    td2.appendChild(opponent2Goals);
    td3.appendChild(deleteBtn);

    row.appendChild(td0);
    row.appendChild(td1);
    row.appendChild(td2);
    row.appendChild(td3);

    $("#Games").append(row);
    this.updateGameIndex();
  }

  updateGameIndex(){
    var index = 1;
    $("td[name='index']").get().forEach(td => {
      td.innerText = index.toString();
      index++;
    });
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

  loadMatchIndividuals(players : any[]){
    var html = "";
    players.forEach(player =>{
      var playerGoals = "<div id='" + player + "' class='input-group col-md-6'>"+
        "<div class='input-group-prepend' style='margin-bottom: 15px;'>"+
          "<span class='input-group-text'>" + player + "</span>"+
        "</div>"+
        "<input type='text' class='form-control' placeholder='Goals'/>"+          
        "<input type='text' class='form-control' placeholder='Assists'/>"+
      "</div>";
      html += playerGoals;
    });
    console.log(players);
    $("#PersonalGoalSection").html(html);
  }
}
