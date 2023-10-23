import { Types } from "mongoose";

export default interface ICategory extends Document {
    _id?: Types.ObjectId | null
    title: string;
}