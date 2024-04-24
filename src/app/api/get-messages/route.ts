import { getServerSession } from "next-auth";
import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/User";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function GET(request : Request){
    await dbConnect();

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

const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const user = await UserModel.aggregate([
            { $match : {id : userId} },  // Here I think _id should be their but lets see in testing...
            { $unwind : '$messages' },
            { $sort : { 'messages.createdAt' : -1 } },
            { $group : { _id : "$_id" , messages : { $push : "$messages" } } }
        ]);

        if(!user || user.length == 0){
            return Response.json({
                success : false,
                message : "User not found"
            },
            {
                status : 401
            }
        )
        }

        return Response.json({
            success : true,
            messages : user[0].messages
        }
    )

    } catch (error) {
        return Response.json({
            success : false,
            message : "Error in getting messages..."
        },
        {
            status : 500
        }
    )
    }
}