export class RatioEntry{
    Name : string;
    Games : number;
    GoalsGame : number;
    AssistsGame : number;
    ExpGame : number;
    WinLoss : number;
    WinGame : number;
    LossGame : number;
    DrawGame : number;
    Position : number;

    constructor(){
        this.Name = "";
        this.Games = 0;
        this.GoalsGame = 0;
        this.AssistsGame = 0;
        this.ExpGame = 0;
        this.WinLoss = 0;
        this.WinGame = 0;
        this.LossGame = 0;
        this.DrawGame = 0;
        this.Position = 0;
    }
}