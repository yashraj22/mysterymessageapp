import { NextRequest , NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import UserModel from '@/app/model/User';
import bcryptjs from 'bcryptjs';
import { sendVerificationEmail } from '../../../../helpers/sendVerificationEmail';

import randomize from "randomatic";


export async function POST(request:NextRequest) {  // Guruji used Request instead of NextRequest
    await dbConnect();

    try {
        const reqBody = await request.json();
        const {email , username , password} = reqBody;

        if(!username || !email || !password){
            return Response.json({
                success : false,
                message : "Provide all required details"
            })
        }

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username ,
            isVerified : true
        });


        if(existingUserVerifiedByUsername){
            return Response.json(
            {
                success : false,
                message : "username is already taken"
            },
            {
                status : 400
            }
        )
        }

        const existingUserByEmail = await UserModel.findOne({email});

        const verificationCode = randomize('0' , 6);


        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json(
                    {
                        success : false,
                        message : "User already exist with this email"
                    },
                {
                    status : 400
                }
            )
            }

            else{
                const hashedPassword = await bcryptjs.hash(password , 10);

                existingUserByEmail.password = hashedPassword;

                existingUserByEmail.verifyCode = verificationCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

                await existingUserByEmail.save();
            }


        }

        else{
            const hashedPassword = await bcryptjs.hash(password , 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                email,
                username,
                password : hashedPassword,
                verifyCode : verificationCode,
                verifyCodeExpiry : expiryDate,
                isVerified : false,
                isAcceptingMessage : true,
                messages : []
            })

            await newUser.save();

        }

        const emailResponse = await sendVerificationEmail(email , username , verificationCode);

        if(!emailResponse.success){
            return Response.json(
                {
                    success : false,
                    message : emailResponse.message
                },
            {
                status : 500
            }
        )
        }
        return Response.json(
            {
                success : true,
                message : "Signed up successfully"
            },
            {
                status : 201
            }
        )

    } catch (error) {
        console.error("Error in registering user" , error);
        return Response.json({
            success : false,
            message : "Error in Registring User",
        },
    {
        status : 500,
    }
    )
    }
}

