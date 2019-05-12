export class LeaderboardEntry {
    Position : any;
    Name : string;
    Wins : number;
    Losses : number;
    Draws : number;
    Goals : number;
    Assists: number;
    Experience : number; 

    constructor(source : any){
        if(!source) return;

        this.Position = source.Position;
        this.Name = source.last_name;
        this.Wins = source.Wins;
        this.Losses = source.Losses;
        this.Draws = source.Draws;
        this.Goals = source.goals;
        this.Assists = source.assists;
        this.Experience = source.Experience;
    }
}