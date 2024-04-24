import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/User";
import { z } from "zod";
import {NextRequest , NextResponse} from "next/server";
import { VerifySchema } from "@/app/schemas/verifySchema";
import { UsernameValidation } from "@/app/schemas/signUpSchema";

// const VerificationCodeSchema = z.object({
//     verifyCode : VerifySchema
// });

const UsernameSchema = z.object({
    username : UsernameValidation
});


export async function POST(request : NextRequest){
    await dbConnect();

    try {
        const {username ,code} = await request.json();

        const decodedUsername = decodeURIComponent(username);

         // zod for username

         const usernameCheck = {
            username : decodedUsername
        };

        const usernameResult = UsernameSchema.safeParse(usernameCheck);

        if(!usernameResult.success){
            const usernameError = usernameResult.error.format().username?._errors || [];
            return NextResponse.json({
                success : usernameResult.success,
                message : usernameError.length > 0 ? usernameError.join(", ") : "Invalid Username"
            },
        {
            status : 400
        }
        )
        }


        // zod for verifyCode

        const result = VerifySchema.safeParse({
            verifyCode : code
        });

        if(!result.success){
            const verificationCodeError = result.error.format().verifyCode?._errors || [];
            return NextResponse.json({
                success : result.success,
                message : verificationCodeError.length > 0 ? verificationCodeError.join(", ") : "Invalid verification code"
            },
        {
            status : 400
        }
        )
        }


        const user = await UserModel.findOne({username : decodedUsername});

        if(!user){
            return NextResponse.json(
                {
                    success : false,
                    message : "User not exist with given username"
                },
                {
                    status : 400
                }
            )
        }

        const isValidCode = user.verifyCode == code;
        const isValidExpiry = new Date(user.verifyCodeExpiry) > new Date();

        if( isValidCode && isValidExpiry ){
            user.isVerified = true;

            await user.save();

            return NextResponse.json(
                {
                    success : true,
                    message : "User verified successfully"
                },
                {
                    status : 201
                }
            )
        }

        else if(!isValidCode){
            return NextResponse.json(
                {
                    success : false,
                    message : "check your code"
                },
                {
                    status : 400
                }
            )
        }

        else if(!isValidExpiry){
            return NextResponse.json(
                {
                    success : false,
                    message : "Code Expired already..."
                },
                {
                    status : 400
                }
            )
        }

        

    } catch (error) {
        console.error("Error in verifying code");
        return NextResponse.json({
            success : false,
            message : "Error in verifying code"
        },
        {
            status : 500
        }
    )
    }
}