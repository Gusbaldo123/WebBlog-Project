import { Author } from "../../../generated/prisma/client";

export class AuthorResponseDTO {
    constructor(
        public id: number,
        public name: string | null,
        public email: string,
        public role: string
    ) { }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role
        };
    }

    static fromEntity(author: Author): AuthorResponseDTO {
        return new AuthorResponseDTO(author.id, author.name, author.email, author.role);
    }
}