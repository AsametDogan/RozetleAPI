import { Types } from "mongoose";

export default interface IVerification extends Document {

    _id?: Types.ObjectId | null
    email: string;
    verified: boolean;
    verificationCode: string;
    createdDate: Date;
}