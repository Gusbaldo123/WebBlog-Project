import { Router, Request, Response, NextFunction } from 'express';
import { ICrud } from '../models/interfaces/ICrud';
import { AuthorResponseDTO } from './dtos';
import { decodeJwt, JwtPayload } from '../managers/AuthManager';
import * as z from "zod";

class RouterAPI<S extends ICrud<M, DTO>, M, DTO> {
    protected router = Router();
    protected service: S;

    public constructor(service: S) {
        this.service = service;
    }
    protected validate = (schema: z.ZodType) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const { fieldErrors } = result.error.flatten();
            return res.status(400).json({
                message: "Validation error",
                errors: fieldErrors
            });
        }

        req.body = result.data; // já validado
        next();
    };


    protected checkAuthorToken = async (req: Request): Promise<AuthorResponseDTO | null> => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return null;
        }
        const token = authHeader.substring(7);
        const decoded: JwtPayload = await decodeJwt(token);
        const author: AuthorResponseDTO = decoded.user;
        return author;
    }

    public getById = async (req: Request, res: Response): Promise<Response> => {
        const id = Number(req.params.id);
        try {
            const foundObj = await this.service.getById(id);

            if (!foundObj)
                return res.status(404).json({ message: `Not found: ${id}` });

            return res.status(200).json(foundObj);

        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }

    public create = async (req: Request, res: Response): Promise<Response> => {
        const requester: AuthorResponseDTO | null = await this.checkAuthorToken(req);
        if (!requester) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const reqPost: M = req.body;
        try {
            const resPost = await this.service.create(reqPost, requester);
            if (!resPost)
                return res.status(500).json({ message: "Error on insert" });
            return res.status(201).json(resPost);
        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }

    public updateById = async (req: Request, res: Response): Promise<Response> => {
        const requester: AuthorResponseDTO | null = await this.checkAuthorToken(req);
        if (!requester) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const id = Number(req.params.id);
        const reqPost: M = req.body;
        try {
            const resPost = await this.service.updateById(id, reqPost, requester);
            if (!resPost)
                return res.status(500).json({ message: "Id not found" });
            return res.status(200).json(resPost);
        } catch (e) {
            return res.status(500).json({ message: e });
        }
    }

    public deleteById = async (req: Request, res: Response): Promise<Response> => {
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

    public getRouter(): Router {
        const clone = Router();
        clone.stack = [...this.router.stack];

        return clone;
    }
}

export { RouterAPI };
