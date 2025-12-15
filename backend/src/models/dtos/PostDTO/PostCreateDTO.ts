export class PostCreateDTO {
    constructor(
        public title: string,
        public content: string,
        public categoryIds: number[]
    ) {
        this.content = this.content
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\b/g, '\\b')
            .replace(/\t/g, '\\t');
    }
}