import { Types } from "mongoose";

export default interface IVerification extends Document {

    _id?: Types.ObjectId | null
    email: string;
    verificationCode: string;
    createdDate: Date;
}