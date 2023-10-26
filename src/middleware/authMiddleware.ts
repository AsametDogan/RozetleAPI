import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { IDataToken, IRequestWithUser } from '../interfaces';
import { UserModel } from '../models';

export const authMiddleware = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const token = req.header('auth-token');
    console.log("------------------- MIDDLEWARE TOKEN -------------------" + token)
    if (!token) return res.status(401).json({ message: "Erişim engellendi", success: false });

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET || "") as IDataToken;
        console.log(decoded)
        const userInToken = await UserModel.findById(decoded._id)
        if (!userInToken) {
            return res.status(404).json({ message: 'Oturum bulunamadı', success: false });
        }
        if (!userInToken.isActive) {
            return res.status(404).json({ message: 'Hesap devredışı', success: false });
        }
        req.user = userInToken
        next();
    } catch (error) {
        res.status(401).json({ message: error, success: false });
    }
};

