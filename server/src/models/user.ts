import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    fullname: string;
    username: string;
    email: string;
    password: string;
}

const userSchema: Schema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

export default mongoose.model<IUser>('User', userSchema);
