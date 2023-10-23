import { Types } from "mongoose";

export default interface IUser extends Document {
    _id?: Types.ObjectId | null
    nickName: string;
    name: string;
    surname: string;
    email: string[];
    phone?: string;
    password: string;
    profileImg?: string;
    role: number;
    createdDate?: Date;
    isActive?: boolean;
}

// _id,nickName,name,surname,email,phone,password,profileImg,role,createdDate,isActive