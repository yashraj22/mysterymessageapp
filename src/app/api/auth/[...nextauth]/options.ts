import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/app/lib/dbConnect";
import bcryptjs from 'bcryptjs';
import UserModel from "@/app/model/User";
import { NextAuthOptions } from "next-auth";

export const AuthOptions : NextAuthOptions = {
    providers : [
        CredentialsProvider({
            name : "Credentials",
            id : "credentials",
            credentials : {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials : any) : Promise<any> {
                await dbConnect();

                try {
                    const user = await UserModel.findOne({
                        $or : [
                            {username : credentials.identifier},
                            {email : credentials.identifier},
                        ]
                    });

                    if(!user){
                        throw new Error("No user exist with this email");
                    }

                    if(!user.isVerified){
                        throw new Error("Please verify before login");
                    }

                    const isPasswordMatched = await bcryptjs.compare(credentials.password , user.password);

                    if(!isPasswordMatched){
                        throw new Error("Check your credentials...");
                    }
                    else{
                        return user;
                    }

                } catch (error : any) {
                    throw new Error(error);
                }
            }
        }),
    ],
    callbacks : {
        async jwt({ token, user }) {
            if(user){
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessage;
                token.username = user.username;
            }
            return token
        },
        async session({ session, token }) {

            if(token){
                session.user._id = token._id;
                session.user.isAcceptingMessage = token.isAcceptingMessage;
                session.user.isVerified = token.isVerified;
                session.user.username = token.username;
            }

            return session
        },
    },
    pages : {
        signIn : "/sign-in"
    },
    session : {
        strategy : "jwt"
    },
    secret : process.env.NEXTAUTH_SECRET
}