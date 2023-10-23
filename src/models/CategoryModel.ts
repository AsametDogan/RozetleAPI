import mongoose, { Schema } from "mongoose";
import ICategory from "../interfaces/category.interface";

const CategorySchema = new Schema<ICategory>({
    title: { type: String, required: true },
});

const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);

export default CategoryModel