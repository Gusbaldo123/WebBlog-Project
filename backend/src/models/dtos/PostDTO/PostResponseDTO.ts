import { AuthorResponseDTO } from "../AuthorDTO/AuthorProfileDTO";
import { Category } from "../../../generated/prisma/client";
import { Post } from "../../../generated/prisma/client";

export class PostResponseDTO {
    constructor(
        public id: number,
        public title: string,
        public content: string,
        public author: AuthorResponseDTO,
        public categories: Category[]
    ) { }
    static fromEntity(post: Post, author: AuthorResponseDTO, categories: Category[]): PostResponseDTO {
        return new PostResponseDTO(post.id, post.title, post.content, author, categories);
    }
}