import { Types } from "mongoose";

export default interface IBadge extends Document {
    _id?: Types.ObjectId | null
    title: string;
    imgUrl: string;
    categoryId: Types.ObjectId;
    totalCount: number;
    restCount: number;
    price: number;
    attainerRoles: number[];
    createdDate: Date;
    isActive: boolean;
}