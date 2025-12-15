export class CategoryCreateDTO{
    constructor(
        public name:string
    ){
        this.name = this.name.toLowerCase().replace(/^./, (firstChar) => firstChar.toUpperCase());
    }
}