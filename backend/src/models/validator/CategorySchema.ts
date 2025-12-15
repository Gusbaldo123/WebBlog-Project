import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(3,"Name must have between 3 and 32 characters").max(32,"Name must have between 3 and 32 characters")
});