import { Author } from "../generated/prisma/client"
import { AuthorRegisterDTO, AuthorUpdateDTO, AuthorResponseDTO, AuthorLoginDTO } from '../models/dtos';
import { Prisma } from "../managers/Prisma";
import { Crud } from "../models/Crud";
import * as bcrypt from 'bcrypt';

class AuthorService extends Crud<Author, AuthorResponseDTO> {
    public override async create(author: AuthorRegisterDTO): Promise<AuthorResponseDTO | null> {
        try {
            let { name, email, password } = author;
            let saltRounds: number = 10;

            let hashPassword = await bcrypt.hash(password, saltRounds);

            let createdAuthor: Author = await Prisma.author.create({
                data: { name, email, password: hashPassword }
            })
            return AuthorResponseDTO.fromEntity(createdAuthor);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public override async getById(id: number): Promise<AuthorResponseDTO | null> {
        let foundAuthor: Author | null = await Prisma.author.findFirst({
            where: { id: id }
        });
        if (foundAuthor)
            return AuthorResponseDTO.fromEntity(foundAuthor);
        return null;
    }

    public override async updateById(id: number, author: AuthorUpdateDTO): Promise<AuthorResponseDTO | null> {
        try {
            let { name, email, password } = author;
            let saltRounds: number = 10;

            let hashPassword = await bcrypt.hash(password, saltRounds);

            let updatedAuthor: Author = await Prisma.author.update({
                where: { id },
                data: { email, name, password: hashPassword }
            });
            if (updatedAuthor)
                return AuthorResponseDTO.fromEntity(updatedAuthor);
            return null;
        } catch (error) {
            return null;
        }
    }

    public override async deleteById(id: number): Promise<boolean> {
        try {
            await Prisma.author.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    public async login(author: AuthorLoginDTO): Promise<AuthorResponseDTO | null> {
        try {
            let { email, password } = author;

            const authorWithEmail: Author | null = await Prisma.author.findUnique({
                where: { email: email.toLocaleLowerCase().trim() }
            });

            if (!authorWithEmail) return null;

            const match: boolean = await bcrypt.compare(password, authorWithEmail.password);
            if (!match) return null;

            return AuthorResponseDTO.fromEntity(authorWithEmail);
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

const authorService = new AuthorService();

export { authorService, AuthorService };