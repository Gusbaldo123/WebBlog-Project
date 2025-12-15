import { Category } from "../generated/prisma/client"
import { Prisma } from "../managers/Prisma";
import { Crud } from "../models/Crud";
import { CategoryCreateDTO } from "../models/dtos";

class CategoryService extends Crud<Category, Category> {
    public override async create(category: CategoryCreateDTO): Promise<Category> {
        let { name } = category;
        let createdCategory: Category = await Prisma.category.create({
            data: { name }
        })
        return createdCategory;
    }

    public override async getById(id: number): Promise<Category | null> {
        let foundCategory: Category | null = await Prisma.category.findFirst({
            where: { id: id }
        });
        return foundCategory;
    }

    public override async updateById(id: number, category: CategoryCreateDTO): Promise<Category> {
        let { name } = category;

        let updatedCategory: Category = await Prisma.category.update({
            where: { id },
            data: { name }
        });
        return updatedCategory;
    }

    public override async deleteById(id: number): Promise<boolean> {
        try {
            await Prisma.category.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    public async getRandomCategories(quantity: number): Promise<Category[] | null> {
        const posts: Category[] | null = await Prisma.$queryRaw`SELECT * FROM public."Category" ORDER BY RANDOM() LIMIT ${quantity};`;
        if (posts && posts.length > 0)
            return posts;
        return null;
    }

    public async listAll(): Promise<Category[]> {
        const categories: Category[] = await Prisma.category.findMany();
        return categories;
    }
}

export { CategoryService };