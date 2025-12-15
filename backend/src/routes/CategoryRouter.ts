import { CategoryService } from '../services/CategoryService';
import { Category } from '../generated/prisma/client';
import { CategoryCreateDTO } from '../models/dtos';
import { RouterAPI } from '../models/RouterAPI';
import { Request, Response } from 'express';
import { AuthorResponseDTO } from '../models/dtos';
import { CategorySchema } from '../models/validator/CategorySchema';

class CategoryRouter extends RouterAPI<CategoryService, Category, Category> {
    constructor() {
        super(new CategoryService());
        this.router.get('/', this.listAll);
        this.router.get('/:id', this.getById);
        this.router.post('/', this.validate(CategorySchema), this.create);
        this.router.put('/:id', this.validate(CategorySchema), this.updateById);
        this.router.delete('/:id', this.deleteById);
    }

    public listAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            const categories = await this.service.listAll();
            return res.status(200).json(categories);
        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }

    public override create = async (req: Request, res: Response): Promise<Response> => {
        const requester: AuthorResponseDTO | null = await this.checkAuthorToken(req);
        if (!requester)
            return res.status(401).json({ message: "Authorization token required" });
        if (requester.role != "ADMINISTRATOR")
            return res.status(500).json({ message: "Unauthorized action" });

        const dto: CategoryCreateDTO = req.body;
        try {
            const resPost = await this.service.create(dto);
            if (!resPost)
                return res.status(500).json({ message: "Error on insert" });

            return res.status(201).json(resPost);
        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }

    public override updateById = async (req: Request, res: Response): Promise<Response> => {
        const requester: AuthorResponseDTO | null = await this.checkAuthorToken(req);
        if (!requester)
            return res.status(401).json({ message: "Authorization token required" });
        if (requester.role != "ADMINISTRATOR")
            return res.status(500).json({ message: "Unauthorized action" });

        const id: number = Number(req.params.id);
        const dto: CategoryCreateDTO = req.body;
        try {
            const resPost = await this.service.updateById(id, dto);
            if (!resPost)
                return res.status(500).json({ message: "Error on insert" });

            return res.status(201).json(resPost);
        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }
}

export default new CategoryRouter().getRouter();
