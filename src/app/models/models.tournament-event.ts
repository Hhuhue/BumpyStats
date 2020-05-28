export class TournamentEvent{
    Name : string;
    Id : number;

    constructor(source : any){
        if(!source){
            this.Id = -1;
            this.Name = "";
        } else {
            this.Id = source.id;
            this.Name = source.name;
        }
    }
}