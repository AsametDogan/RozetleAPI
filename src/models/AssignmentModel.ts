import mongoose, { Schema } from "mongoose";
import { IAssignment } from "../interfaces";

const AssignmentSchema: Schema<IAssignment> = new Schema({

    description: { type: String },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverInfo: { type: String, required: true },
    badgeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    assignDate: { type: Date, required: true }  
});

const AssignmentModel = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default AssignmentModel