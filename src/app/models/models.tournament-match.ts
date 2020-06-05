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
            this.Id = source.id;
            this.Name = source.name;
        }
    }
}