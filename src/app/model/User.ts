import mongoose , {Schema , Document} from "mongoose";

export interface Message extends Document{
    content : string;
    createdAt : Date;
}

const MessageSchema:Schema<Message> = new Schema({
    content : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        required : true,
        default : Date.now()
    }
})

export interface User extends Document {
    username : string;
    email : string;
    password : string;
    verifyCode : string;
    verifyCodeExpiry : Date;
    isVerified : boolean;
    isAcceptingMessage : boolean;
    messages : Message[];
}

const UserSchema:Schema<User> = new Schema({
    username : {
        type : String,
        required : [true , "Provide your username"],
        unique : true,
        trim : true
    },
    email : {
        type : String,
        required : [true , "Provide your email"],
        unique : true,
        match : [ /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email address"]
    },
    password : {
        type : String,
        required : [true , "Provide your password"]
    },
    verifyCode : {
        type : String,
        required : [true , "Provide your verify code"]   
    },
    verifyCodeExpiry : {
        type : Date,
        required : [true , "Provide your verify Code Expiry"],
        // default : Date.now()
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    isAcceptingMessage : {
        type : Boolean,
        default : true
    },
    messages : [MessageSchema]
})

const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User", UserSchema);

export default UserModel;