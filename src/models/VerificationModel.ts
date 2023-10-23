import mongoose, { Schema } from "mongoose";
import IVerification from "../interfaces/verification.interface";

const VerificationSchema = new Schema<IVerification>({
   email: { type: String, required: true },
   verificationCode: { type: String, required: true },
   createdDate: { type: Date, required: true },
});

const VerificationModel = mongoose.model<IVerification>('Verification', VerificationSchema);

export default VerificationModel