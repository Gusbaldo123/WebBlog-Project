import { Author } from "../../../generated/prisma/client";

export class AuthorLoginDTO {
    constructor(
        public email: string,
        public password: string
    ) {}
}