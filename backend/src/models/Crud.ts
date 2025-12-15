import { ICrud } from "../models/interfaces/ICrud";
import { AuthorResponseDTO } from "./dtos";

class Crud<T, TDTO> implements ICrud<T, TDTO> {
    async create(t: T, requester:AuthorResponseDTO): Promise<TDTO | null> { return null; }
    async getById(id: number): Promise<TDTO | null> { return null; }
    async updateById(id: number, t: T, requester:AuthorResponseDTO): Promise<TDTO | null> { return null; }
    async deleteById(id: number): Promise<boolean> { return false;}
}
export { Crud };
