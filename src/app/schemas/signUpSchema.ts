import { z } from "zod";

export const UsernameValidation = z.string().min(2 , "Username must be atlease of 2 characted").max(20 , "No more than 20 characters").regex(/^[a-zA-Z0-9_]+$/ , "Username must not contain special characters");

export const SignUpSchema = z.object({
    username : UsernameValidation,
    email : z.string().email({
        message : "Invalid Email Address"
    }),
    password : z.string().min(6 , {
        message : "minimum password should be atleast 6 characters long"
    })
})