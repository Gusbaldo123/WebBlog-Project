import type { Author } from "./Author"
import type { Category } from "./Category"

export interface Post {
    id: number,
    title: string,
    content: string,
    author: Author,
    categories:Category[]
}