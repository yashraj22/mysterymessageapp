import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/app/lib/dbConnect";
import bcryptjs from "bcryptjs";
import UserModel from "@/app/model/User";

export const authOptions : NextAuthOptions = {
    providers : [
        CredentialsProvider({
            name : "Credentials",
            id : "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
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
                    })

                    if(!user){
                        throw new Error("User doesn't exist with this email");
                    }

                    if(!user.isVerified){
                        throw new Error("Please verify your account...");
                    }

                    const isMatched = await bcryptjs.compare(credentials.password , user.password);

                    if(!isMatched){
                        throw new Error("Check your credentials");
                    }

                    else{
                        return user;
                    }


                } catch (error:any) {
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
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }            
            return token
        },
        async session({ session, token }) {

            if(token){
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
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