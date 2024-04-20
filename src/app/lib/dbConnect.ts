import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?:number
}

export const connection : ConnectionObject = {};

async function dbConnect(): Promise<void> {

    if(connection.isConnected){
        console.log("Already connectec to DB...");
        return;
    }

    try {
        const resp = await mongoose.connect(process.env.MONGO_URI || "" , {});

        resp.connection.on("connected" , () => {
            console.log("MONGO DB CONNECTED...");
        })

        connection.isConnected = resp.connections[0].readyState

    } catch (error:any) {
        console.log("DB CONNECTION FAILED..." , error)
        process.exit(1);
    }
}

export default dbConnect;