import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/User";
import { User } from "next-auth"; // You can use

async function POST(request : Request) {
    await dbConnect();

    try {
        const session = await getServerSession(authOptions);

        if(!session){
            return Response.json({
                success : false,
                message : "Error in getting session..."
            },
            {
                status : 400
            }
        )
        }

        const user = session?.user;

        if(!user){
            return Response.json({
                success : false,
                message : "No Logged in User..."
            },
            {
                status : 400
            }
        )
        }

        const userId = user._id;

        const {acceptMessages} = await request.json();

        
        const updatedUser = await UserModel.findByIdAndUpdate(userId,{
            isAcceptingMessages : acceptMessages
        },
        {new : true}
    )

        if(!updatedUser){
            return Response.json({
                success : false,
                message : "Failed to update user accept message status.."
            },
            {
                status : 401
            }
        )
        }

        return Response.json({
            success : true,
            message : "updated user accept message status successfully..",
            updatedUser
        },
        {
            status : 201
        }
    )        



    } catch (error) {
        console.error("Error in accepting messages..." , error);
        return Response.json({
            success : false,
            message : "Error in Accepting Messages..."
        },
        {
            status : 500
        }
    )
    }
}

async function GET(request : Request) {
    await dbConnect();

    try {
        const session = await getServerSession(authOptions);

        if(!session){
            return Response.json({
                success : false,
                message : "Error in getting session..."
            },
            {
                status : 400
            }
        )
        }

        const user = session?.user;

        if(!user){
            return Response.json({
                success : false,
                message : "No Logged in User..."
            },
            {
                status : 400
            }
        )
        }

        const userId = user._id;

        const LoggedInUser = await UserModel.findById(userId);

        if(!LoggedInUser){
            return Response.json({
                success : false,
                message : "No User found..."
            },
            {
                status : 404
            }
        )
        }

        return Response.json({
            success : true,
            message : "User found...",
            isAcceptingMessages : LoggedInUser.isAcceptingMessage
        },
        {
            status : 200
        }
    )

    } catch (error) {
        console.error("Error in getting accepting message status..." , error);
        return Response.json({
            success : false,
            message : "Error in getting Accepting Message status..."
        },
        {
            status : 500
        }
    )
    }
}