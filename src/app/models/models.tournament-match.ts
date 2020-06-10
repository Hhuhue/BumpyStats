export class TournamentMatch{
    Id : number;
    Name : string;
    Opponent1 : string;
    Opponent2 : string;
    IsTeamMatch : boolean;
    IsAggregateWin : boolean;
    Event : string;
    Date : string;
    VideoLink : string;
    Results : any[];
    PersonalGoals : any[];

    constructor(source : any){
        if(!source){
            this.Id = -1;
            this.Name = "";
            this.Opponent1 = "";
            this.Opponent2 = "";
            this.IsTeamMatch = false;
            this.IsAggregateWin = false;
            this.Event = "";
            this.Date = "";
            this.VideoLink = "";
            this.Results = [];
            this.PersonalGoals = [];
        } else {
            this.Id = source.Id;
            this.Name = "";
            this.Id = source.id;
            this.Date = source.date;
            this.Event = source.event;
            this.Opponent1 = source.opponent_1;
            this.Opponent2 = source.opponent_2;
            this.IsTeamMatch = source.team_match > 0;
            this.IsAggregateWin = source.aggregate_win;
            if (source.result){
                var resultData = JSON.parse(source.result);
                this.Results = resultData.scores;
                this.VideoLink = resultData.VideoLink;
                this.PersonalGoals = resultData.personals;

                if (!this.VideoLink) this.VideoLink = "";
                if (!this.PersonalGoals) this.PersonalGoals = [];
            } else {
                this.VideoLink = "";
                this.Results = [];
                this.PersonalGoals = [];
            }
        }
    }
}