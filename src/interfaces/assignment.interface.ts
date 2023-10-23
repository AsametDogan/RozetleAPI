import { Types } from "mongoose";

export default interface IAssignment extends Document {
    _id?: Types.ObjectId | null
    description: { type: String },
    senderId: { type: Types.ObjectId, required: true },
    receiverInfo: { type: String, required: true },
    badgeId: { type: Types.ObjectId, required: true },
    assignDate: { type: Date, required: true }
}