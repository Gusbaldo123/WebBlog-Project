import { InferenceClient, textGeneration } from "@huggingface/inference";
import { PostCreateDTO } from "../dtos";
import { Category } from "../../generated/prisma/client";
const hf = new InferenceClient(process.env.TOKEN_HF);


const prompt = `You are a professional blog writer, create a post with these themes.
Respond in this JSON format:{"title":"Title with a maximum of 64 characters", "content":"Post content with a maximum of 256 characters"}`;

const generatePost = async (categories: Category[], atempt: number = 0): Promise<PostCreateDTO | null> => {
    if (atempt > 2)
        return null;

    const context = categories.map(cat => cat.name).join(";");
    const response = await hf.chatCompletion({
        model: "meta-llama/Llama-3.1-8B-Instruct:nscale",
        messages: [{
            role: "user",
            content: `${prompt}\n${context}`,
        },],
    });

    try {
        const parsed = JSON.parse(response?.choices[0]?.message?.content || "");
        return { title: parsed.title, content: parsed.content, categoryIds: categories.map(cat => cat.id) } as PostCreateDTO;
    } catch (error) {
        console.log(error);
        
        return generatePost(categories, atempt + 1);
    }
}

export default generatePost;