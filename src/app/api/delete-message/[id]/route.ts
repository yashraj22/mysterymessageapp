import { getServerSession } from "next-auth";
import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function DELETE(request : Request , {params} : {params : {id : string} }){
    const messageId = params.id;
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

    try {
        const updatedMessages = await UserModel.updateOne(
            {_id : user._id},
            {$pull : {messages : {_id : messageId } } }
        )

        if(updatedMessages.modifiedCount == 0){
            return Response.json({
                success : false,
                    message : "No Message found or already message deleted"
            },
            {
                status : 404
            })
        }

        return Response.json({
            success : true,
                message : "Message deleted successfully"
        },
        {
            status : 202
        })

    } catch (error) {
        return Response.json({
            success : false,
                message : "Error in deleting Message..."
        },
        {
            status : 500
        })
    }



    
}