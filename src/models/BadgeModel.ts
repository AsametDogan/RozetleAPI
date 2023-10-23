import mongoose, { Schema } from "mongoose";
import { IBadge } from "../interfaces";

const BadgeSchema: Schema<IBadge> = new Schema({
    title: { type: String, required: true },
    imgUrl: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    totalCount: { type: Number, required: true },
    restCount: { type: Number, required: true },
    price: { type: Number, required: true },
    attainerRoles: [{ type: Number, required: true }],
    createdDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

const BadgeModel = mongoose.model<IBadge>('Badge', BadgeSchema);

export default BadgeModel;