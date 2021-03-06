import { Component, OnInit } from '@angular/core';
import { BumpyballService } from 'src/app/services/bumpyball.service';
import { Team } from 'src/app/models/models.team';
import { TournamentEvent } from 'src/app/models/models.tournament-event';
import { TournamentMatch } from 'src/app/models/models.tournament-match';
import * as moment from 'moment';
import slugify from 'slugify';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-matchmaker',
  templateUrl: './matchmaker.component.html',
  styleUrls: ['./matchmaker.component.css']
})
export class MatchmakerComponent implements OnInit {
  teams: string[];
  players: string[];
  events: string[];
  servers = ["NY", "FF", "AMS", "SGP", "SF"];
  selectedTeam: Team;
  selectedEvent: TournamentEvent;
  selectedMatch: TournamentMatch;
  selectedTeamExists = false;
  searchedMatches = [];
  gameIndex = 1;

  constructor(private bumpyball: BumpyballService, private flashMessage : FlashMessagesService) { }

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
    $("#EnterPersonalGoals").prop("checked", false);
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
    this.bumpyball.postTeamData(teamData)
      .subscribe(() => this.flashMessage.show("Team submited", { cssClass: 'alert-success', timeout: 3000 }));
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
    this.bumpyball.postEventData(eventData)
      .subscribe(() => this.flashMessage.show("Event submited", { cssClass: 'alert-success', timeout: 3000 }));
    this.initEventManager();
  }

  onMatchSave(){
    this.selectedMatch.Event = $("#MatchEvent").val().toString();
    this.selectedMatch.IsAggregateWin = $("#AggregateScore").prop("checked") ? 1 : 0;
    this.selectedMatch.Date = moment().format("YYYY-MM-DD");

    if ($("#EnterResults").prop("checked")){
      this.selectedMatch.VideoLink = $("#VideoLink").val().toString();
      var opponent1Goals = $("input[name=opp1]").map((idx, elem) => {return parseInt($(elem).val().toString());}).get();
      var opponent2Goals = $("input[name=opp2]").map((idx, elem) => {return parseInt($(elem).val().toString());}).get();
      var gameLocations = $("select[name=loc]").map((idx, elem) => {return $(elem).val().toString();}).get();
      this.selectedMatch.Results = [];
      for(var i = 0; i < opponent1Goals.length; i++){
        this.selectedMatch.Results.push([opponent1Goals[i], opponent2Goals[i], gameLocations[i]])
      }
      if($("#EnterPersonalGoals").prop("checked")){
        var personalGoals = $("#PersonalGoalSection>*").map((idx, elem1) => {
          var personalData = [];
          var id = $(elem1).attr("id");
          var goalsAssists = $(elem1).find("input[type=number]").map((idx, elem2) => {return parseInt($(elem2).val().toString());}).get();
          personalData.push($(elem1).find("label").text());
          personalData = personalData.concat(goalsAssists);
          personalData.push($("#" + id + "-check").prop("checked"));
          return [personalData];
        });
        this.selectedMatch.PersonalGoals = personalGoals.get();
      }
    }    
    var matchData = JSON.stringify(this.selectedMatch);
    this.bumpyball.postMatchData(matchData)
      .subscribe(() => {
        this.initMatchManager();
        this.flashMessage.show("Match submited", { cssClass: 'alert-success', timeout: 3000 });
      });    
  }

  onMatchModeChange(){
    var teamMatch = $("#MatchMode").prop("checked");
    this.selectedMatch.IsTeamMatch = teamMatch;
    this.selectedMatch.Opponent1 = "";
    this.selectedMatch.Opponent2 = "";
    if(teamMatch){
      $("#1v1Form").hide();
      $("#TvTForm").show();
      $("#Player1").val("");
      $("#Player2").val("");
      this.selectedMatch.PersonalGoals = [];
      this.togglePersonalGoals();
    } else {
      $("#1v1Form").show();
      $("#TvTForm").hide();
      $("#Team1").val("");
      $("#Team2").val("");
      this.togglePersonalGoals();
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
              var allActive = team1.Teammates.length + team2.Teammates.length <= 6;
              this.selectedMatch.PersonalGoals = team1.Teammates.concat(team2.Teammates)
                .map((elem, idx) => [elem, 0, 0, allActive]);
        }));
    } else {
      this.selectedMatch.PersonalGoals = []
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
      this.selectedMatch.Opponent1 = $("#Team1").val().toString();
      this.selectedMatch.Opponent2 = $("#Team2").val().toString();
      this.togglePersonalGoals();
    } else {
      this.selectedMatch.Opponent1 = $("#Player1").val().toString();
      this.selectedMatch.Opponent2 = $("#Player2").val().toString();
    }
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
      .subscribe(match => this.loadMatchData(match));
  }

  onTogglePlayer(player){
    if($("#" + player + "-check").prop("checked")){
      $("#" + player + ">input").removeAttr("disabled");
    } else {
      $("#" + player + ">input").attr("disabled", "disabled");
    }
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

  toSlug(name){
    return slugify(name, {remove: /[&/,+()$~%.'":*?<>{}#]/g});
  }

  private togglePersonalGoals(){
    var isTeamMatch = $("#MatchMode").prop("checked");
    var opponentsAreDefined = this.selectedMatch.Opponent1 && this.selectedMatch.Opponent2;
    if(isTeamMatch && opponentsAreDefined) {
      $("#EnterPersonalGoals").removeAttr("disabled");
      $("#EnterPersonalGoals").prop("checked", false);
    } else {
      $("#EnterPersonalGoals").attr("disabled","disabled");
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

  private loadMatchData(matchData){
    var match = new TournamentMatch(matchData);
    this.selectedMatch = match;

    $("#AggregateScore").prop("checked", match.IsAggregateWin);
    $("#MatchMode").prop("checked", match.IsTeamMatch);
    if(match.IsTeamMatch){
      $("#Team1").val(match.Opponent1);
      $("#Team2").val(match.Opponent2);
      $("#1v1Form").hide();
      $("#TvTForm").show();

    } else {
      $("#Player1").val(match.Opponent1);
      $("#Player2").val(match.Opponent2);
      $("#1v1Form").show();
      $("#TvTForm").hide();
    }
    $("#EnterResults").prop("checked", match.Results.length > 0);
    if(match.Results.length > 0){
      $("#ResultsForm").show();
      $("#EnterPersonalGoals").prop("checked", match.PersonalGoals.length > 0);
      if(match.PersonalGoals.length > 0){
        $("#EnterPersonalGoals").removeAttr("disabled");
        $("#PersonalGoalSection").show();
      } else {        
        $("#PersonalGoalSection").hide();
      }
    } else {      
      $("#ResultsForm").hide();
    }
  }
}
