export class Team{
    Name : string;
    Teammates : string[];
    Id : number;

    constructor(source : any){
        if(!source){
            this.Id = -1;
            this.Name = "";
            this.Teammates = [];
        } else {
            this.Id = source.id;
            this.Name = source.name;
            this.Teammates = source.teammates;
        }
    }
}