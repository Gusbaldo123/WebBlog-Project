import { Request, Response, Router } from 'express';
import { RouterAPI } from '../models/RouterAPI';
import { PostService } from '../services/PostService';
import { AuthorService } from '../services/AuthorService';
import { Author } from '../generated/prisma/client';
import { AuthorResponseDTO, AuthorRegisterDTO, AuthorLoginDTO } from '../models/dtos';
import { authSigner } from '../managers/AuthManager';
import { AuthorRegisterSchema, AuthorLoginSchema } from '../models/validator/AuthorSchema';

class AuthorRouter extends RouterAPI<AuthorService, Author, AuthorResponseDTO> {
    constructor() {
        super(new AuthorService());
        this.router = Router();
        this.router.get('/:id/posts', this.getPostList);
        this.router.get('/:id', this.getById);
        this.router.post('/register', this.validate(AuthorRegisterSchema), this.create);
        this.router.post('/', this.validate(AuthorRegisterSchema), this.create);
        this.router.put('/:id', this.validate(AuthorRegisterSchema), this.updateById);
        this.router.delete('/:id', this.deleteById);
        this.router.post('/login', this.validate(AuthorLoginSchema), this.login);
    }

    public override create = async (req: Request, res: Response): Promise<Response> => {
        const reqPost: AuthorRegisterDTO = req.body;
        try {
            const resPost = await this.service.create(reqPost);
            if (!resPost)
                return res.status(500).json({ message: "Error on insert" });

            const jwt = authSigner(resPost);
            return res.status(201).json(jwt);
        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }

    public override deleteById = async (req: Request, res: Response): Promise<Response> => {
        const id = Number(req.params.id);
        const requester: AuthorResponseDTO | null = await this.checkAuthorToken(req);
        if (!requester) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        try {
            if (id !== requester.id && requester.role !== "ADMINISTRATOR") {
                return res.status(401).json({ message: "Unauthorized action" });
            }
            const deleted = await this.service.deleteById(id);

            if (!deleted) {
                return res.status(404).json({ message: "Id not found" });
            }

            return res.status(200).json({ message: `Id ${id} deleted` });

        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }

    public override updateById = async (req: Request, res: Response): Promise<Response> => {
        const id: number = Number(req.params.id);
        const requester: AuthorResponseDTO | null = await this.checkAuthorToken(req);

        if (!requester)
            return res.status(401).json({ message: "Authorization token required" });

        if (id !== requester.id && requester.role !== "ADMINISTRATOR") {
            return res.status(401).json({ message: "Unauthorized action" });
        }

        try {
            const body = req.body;
            const updated = await this.service.updateById(id, body);

            if (!updated) {
                return res.status(404).json({ message: "Id not found" });
            }

            return res.status(200).json(updated);

        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }

    public getPostList = async (req: Request, res: Response): Promise<Response> => {        
        const size: number = Number(req.headers.size||5);
        let page: number = Number(req.headers.page||0);
        if (page < 0) page = 0;

        const id: number = Number.parseInt(req.params.id);
        const postService = new PostService();
        
        const postsFromAuthor = await postService.listByAuthor(id, page,size);
        return res.status(200).json(postsFromAuthor);
    }

    public login = async (req: Request, res: Response): Promise<Response> => {
        const reqPost: AuthorLoginDTO = req.body;

        const resPost = await this.service.login(reqPost);
        if (!resPost)
            return res.status(404).json({ message: "Invalid email or password" });
        const jwt = authSigner(resPost);

        return res.status(201).json(jwt);
    }
}

export default new AuthorRouter().getRouter();
