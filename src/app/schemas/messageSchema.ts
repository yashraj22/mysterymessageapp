import { z } from "zod";

export const MessageSchema = z.object({
    content : z.string().min(10 , "Content must be atlest 10 character long").max(300 , "Content must be no longer than 300 characters")
})