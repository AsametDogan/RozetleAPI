import { NextFunction, Response } from "express";
import { IDataToken, IRequestWithUser } from "../interfaces";
import { UserModel } from "../models";
import jwt from 'jsonwebtoken';

export const adminMiddleware = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ message: "Erişim engellendi" });

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET || "") as IDataToken;

        const userInToken = await UserModel.findById(decoded._id)

        if (!userInToken || userInToken.role != 1) {
            return res.status(403).json({ error: 'Yetkisiz erişim' });
        }

        next();
    } catch (error) {
        res.status(400).json({ message: "Oturum Hatası admin",success:false });
    }
};