import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/User";
import { Message } from "@/app/model/User";

export async function GET(request:Request) {
    await dbConnect();

    try {
        const {content , username} = await request.json();

        const user = await UserModel.findOne(username);

        if(!user){
            return Response.json({
                success : false,
                message : "No User found..."
            },
            {
                status : 404
            }
        )
    }

        if(!user.isAcceptingMessage){
            return Response.json({
                success : false,
                message : "User is not accepting messages..."
            },
            {
                status : 403
            }
        )
        }

        const newMessage = {
            content,
            createdAt : new Date()
        }

        user.messages.push(newMessage as Message);

        await user.save();

        return Response.json({
            success : true,
            message : "Message sent successfully..."
        },
        {
            status : 200
        }
    )


    } catch (error) {
        return Response.json({
            success : false,
            message : "Error in sending message..."
        },
        {
            status : 500
        }
    )
    }
}