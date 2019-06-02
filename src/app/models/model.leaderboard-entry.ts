export class LeaderboardEntry {
    Position : number;
    Name : string;
    Wins : number;
    Losses : number;
    Draws : number;
    Goals : number;
    Assists: number;
    Experience : number; 

    constructor(source : any){
        if(!source){
            this.Position = 0;
            this.Name = "";
            this.Wins = 0;
            this.Losses = 0;
            this.Draws = 0;
            this.Goals = 0;
            this.Assists = 0;
            this.Experience = 0;
        } else {
            this.Position = (source.Position === undefined) ? NaN : source.Position;
            this.Name = source.last_name;
            this.Wins = source.Wins;
            this.Losses = source.Losses;
            this.Draws = source.Draws;
            this.Goals = source.goals;
            this.Assists = source.assists;
            this.Experience = source.Experience;
        }
    }
}