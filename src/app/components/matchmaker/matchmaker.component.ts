import { Component, OnInit } from '@angular/core';
import { BumpyballService } from 'src/app/services/bumpyball.service';
import { Team } from 'src/app/models/models.team';
import { TournamentEvent } from 'src/app/models/models.tournament-event';
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
  searchedMatches = [];
  opponentsPlayers = [];
  gameIndex = 1;

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
    this.searchedMatches = [];
    this.opponentsPlayers = [];
    this.gameIndex = 1;
    $("#MatchEvent").val("");
    $("#Player1").val("");
    $("#Player2").val("");
    $("#Team1").val("");
    $("#Team2").val("");
    $("#Opponent1").html("");
    $("#Opponent2").html("");
    $("#VideoLink").val("");
    $("#VideoLink").val("");
    $("#Games").html("");
    $("#MatchMode").prop("checked", false);
    $("#EnterResults").prop("checked", false);
    $("#AggregateScore").prop("checked", false);
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

    var teamData = JSON.stringify(this.selectedTeam);
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
    this.selectedMatch.Date = moment().format("YYYY-MM-DD");

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
    var matchData = JSON.stringify(this.selectedMatch);
    this.bumpyball.postMatchData(matchData).subscribe();
    this.initMatchManager();
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
              this.opponentsPlayers = team1.Teammates.concat(team2.Teammates);
        }));
    } else {
      this.opponentsPlayers = []
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

  onRemoveGame(){
    this.selectedMatch.Results.pop();
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
    this.selectedMatch.Results.push([0,0])
  }

  onSearchMatches(){
    var searchParams = {
      "team": $("#TeamSearch").val().toString(),
      "player": $("#PlayerSearch").val().toString(),
      "event": $("#EventSearch").val().toString(),
      "fromDate": $("#FromDate").val().toString(),
      "toDate": $("#ToDate").val().toString()
    };

    this.bumpyball.getMatches(JSON.stringify(searchParams))
      .subscribe(searchResult => this.searchedMatches = searchResult);
  }

  onLoadMatch(matchId){
    this.bumpyball.getMatch(matchId)
      .subscribe(match => {this.selectedMatch = new TournamentMatch(match); this.loadMatchData()});
  }

  getGameIndex(){
    if(this.gameIndex == this.selectedMatch.Results.length){
      this.gameIndex = 1;
      return this.selectedMatch.Results.length;
    } else {
      this.gameIndex++;
      return this.gameIndex - 1;
    }
  }

  private loadTeamData(){
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

  private loadEventData(){
    $("#NewEventNameForm").show();
  }

  private loadMatchData(){
  }
}
