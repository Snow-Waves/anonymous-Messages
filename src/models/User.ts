import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document {
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content: { 
        type: String,  // im mongoose all the types are capitalized unlike in typescript
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
})

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verificatinCode: string;
    verifyCodeExpires: Date;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    messages: Message[]; // This is an array of Message documents
}

const UserSchema: Schema<User> = new Schema({
    username: { 
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
    },
    email: { 
        type: String,
        required: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    },
    password: {
        type: String,
        required: true
    },
    verificatinCode: {
        type: String,
        required: true
    },
    verifyCodeExpires: {
        type: Date,
        required: true
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    messages: [MessageSchema]
})


const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>('User', UserSchema);

export default UserModel;