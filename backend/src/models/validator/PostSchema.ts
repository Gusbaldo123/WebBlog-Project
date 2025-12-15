import { z } from "zod";

export const PostSchema = z.object({
  title: z.string().min(3,"Title must have between 3 and 64 characters").max(64,"Title must have between 3 and 64 characters"),
  content: z.string().min(3,"Title must have between 3 and 32 characters").max(256,"Title must have between 3 and 256 characters"),
  categoryIds:z.array(z.number()).min(1,"At least 1 category have to be included")
});