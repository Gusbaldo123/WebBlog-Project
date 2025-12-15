import { Request, Response, Router } from 'express';
import { PostService } from '../services/PostService';
import { RouterAPI } from '../models/RouterAPI';
import { AuthorResponseDTO, PostCreateDTO, PostResponseDTO } from '../models/dtos';
import { PostSchema } from '../models/validator/PostSchema';

class PostRouter extends RouterAPI<PostService, PostCreateDTO, PostResponseDTO> {
    constructor() {
        super(new PostService());
        this.router = Router();
        this.router.get('/', this.getRecentPosts);
        this.router.get('/:id', this.getById);
        this.router.post('/',this.validate(PostSchema), this.create);
        this.router.post('/generate', this.createWithAgent);
        this.router.put('/:id',this.validate(PostSchema), this.updateById);
        this.router.delete('/:id', this.deleteById)
    }

    public createWithAgent = async (req: Request, res: Response): Promise<Response> => {
        const requester: AuthorResponseDTO | null = await this.checkAuthorToken(req);
        if (!requester) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        if (requester.role != "ADMINISTRATOR") {
            return res.status(403).json({ message: "Unauthorized action" });
        }
        try {
            const resPost = await this.service.createWithAgent();
            if (!resPost)
                return res.status(500).json({ message: "Error on generation" });

            return res.status(201).json(resPost);
        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }
    public override create = async (req: Request, res: Response): Promise<Response> => {
        const requester: AuthorResponseDTO | null = await this.checkAuthorToken(req);
        if (!requester) {
            return res.status(401).json({ message: "Authorization token required" });
        }
        const reqPost: PostCreateDTO = { ...req.body, authorId: requester.id };
        if (reqPost.categoryIds.length <= 0)
            return res.status(500).json({ message: "Post must have categories" });
        try {
            const resPost = await this.service.create(reqPost, requester);
            if (!resPost)
                return res.status(500).json({ message: "Error on insert" });

            return res.status(201).json(resPost);
        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }

    public override updateById = async (req: Request, res: Response): Promise<Response> => {

        const requester: AuthorResponseDTO | null = await this.checkAuthorToken(req);
        if (!requester) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const id = Number(req.params.id);
        const reqPost: PostCreateDTO = req.body;

        if (requester.role != "ADMINISTRATOR" && await !this.service.isAuthorOriginalPoster(requester.id, id)) {
            return res.status(403).json({ message: "Unauthorized action" });
        }

        try {
            const resPost = await this.service.updateById(id, reqPost, requester);
            if (!resPost)
                return res.status(500).json({ message: "Id not found" });
            return res.status(200).json(resPost);
        } catch (e) {
            return res.status(500).json({ message: e });
        }

    }

    public override deleteById = async (req: Request, res: Response): Promise<Response> => {
        const requester: AuthorResponseDTO | null = await this.checkAuthorToken(req);
        if (!requester) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const id = Number(req.params.id);

        if (requester.role != "ADMINISTRATOR" && await !this.service.isAuthorOriginalPoster(requester.id, id)) {
            return res.status(403).json({ message: "Unauthorized action" });
        }

        try {
            const deleted = await this.service.deleteById(id);

            if (!deleted) {
                return res.status(404).json({ message: "Id not found" });
            }

            return res.status(200).json({ message: `Id ${id} deleted` });

        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }

    public getRecentPosts = async(req:Request, res:Response): Promise<Response>=>{
        try {
            const size:number = Number(req.headers.size||5);
            let page:number = Number(req.headers.page||0);
            if(page<0)page=0;
            const resPost = await this.service.getRecentPosts(page,size);
            
            return res.status(200).json(resPost);
        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }
}

export default new PostRouter().getRouter();
