import { AuthorResponseDTO } from "../dtos"

interface ICrud<T,TDTO> {
    create(model: T, requester:AuthorResponseDTO): Promise<TDTO | null>;
    getById(id: number): Promise<TDTO | null>;
    updateById(id: number, model: T, requester:AuthorResponseDTO): Promise<TDTO|null>;
    deleteById(id: number): Promise<boolean>;
}

export { ICrud }