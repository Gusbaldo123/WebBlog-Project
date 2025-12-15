import { z } from "zod";

export const AuthorLoginSchema = z.object({
  email: z.email("Insert a valid email"),
  password: z.string().min(8,"Password must have between 8 and 32 characters").max(32,"Password must have between 8 and 32 characters")
});

export const AuthorRegisterSchema = z.object({
  name: z.string().min(3,"Name must have at least 3 characters"),
  email: z.email("Insert a valid email"),
  password: z.string().min(8,"Password must have between 8 and 32 characters").max(32,"Password must have between 8 and 32 characters")
});