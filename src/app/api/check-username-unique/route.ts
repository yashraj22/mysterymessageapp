import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/User";
import { z } from "zod";
import {NextRequest , NextResponse} from "next/server";
import { UsernameValidation } from "@/app/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username : UsernameValidation,
});


export async function GET(request : NextRequest){

    await dbConnect();

    try {
        const {searchParams} = new URL(request.url);

        const queryParam = {
            username : searchParams.get("username")
        };

        const result = UsernameQuerySchema.safeParse(queryParam);

        if(!result.success){
            const usernameError = result.error.format().username?._errors || [];
            return NextResponse.json({
                success : result.success,
                message : usernameError.length > 0 ? usernameError.join(", ") : "Invalid query parameters"
            },
        {
            status : 400
        }
        )
        }

        const { username } = result.data;

        const existingVerifiedUser = await UserModel.findOne({username , isVerified : true});

        if(existingVerifiedUser){
            return NextResponse.json(
                {
                    success : false,
                    message : "User already exist with given username"
                },
                {
                    status : 400
                }
            )
        }

        return NextResponse.json(
            {
                success : true,
                message : "User is unique"
            }
        )

    } catch (error : any) {
        console.error("Error in username validation..." , error);
        return NextResponse.json({
            success : false,
            message : "Error in checking username"
        },
        {
            status : 500
        }
    )
    }
}