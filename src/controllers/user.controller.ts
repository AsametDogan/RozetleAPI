import { Request, Response } from "express";
import { IRequestWithFile, IRequestWithUser, IUser } from "../interfaces";
import { UserModel, VerificationModel } from "../models";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { isValidEmail } from "../helpers/validation.helper";
import { sendVerificationCode } from "../helpers/verification.sender.helper";
import { generateVerificationCode } from "../helpers/verification.code.helper";
import { readFile } from 'fs/promises'
import { decryptData, encryptData } from "../helpers/crypto.helper";


const register = async (req: Request, res: Response) => {
    try {
        let { nickName, name, surname, email, password, phone } = req.body;
        name = name.trim();
        surname = surname.trim();
        email = email.toLowerCase().trim(); // register email string
        phone = phone.trim();
        console.log("Register 1")
        if (!isValidEmail(email)) {
            console.log("Register 2")

            return res.status(409).json({

                message: `${email} mail formatında olmalıdır`, success: false
            })
        }
        try {
            const existingUser = await UserModel.findOne({ email: { $in: [email] } });
            console.log("Register 3")

            if (existingUser) {
                console.log("Register 4")

                return res.status(400).json({ message: `${email} ile bir hesap bulunmakta`, success: false });
            }
        } catch (error) {
            console.log("Register 5")

            return res.status(500).json({ message: `Kontrol sırasında hata oluştu, lütfen bildiriniz`, success: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            nickName,
            name,
            surname,
            email: [email],
            phone,
            role: "0",
            password: hashedPassword,
            profileImg: `http://164.92.184.184:5000/api/user/getImage/profile/${req.file?.filename}`, 
            createdDate: new Date(),
        });
        console.log("Register 6")

        await user.save();
        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN_SECRET || '');
        res.status(201).json({ data: { token }, success: true });
    } catch (error) {
        res.status(500).json({ message: "Kayıt olma sırasında hata meydana geldi", success: false });
    }
};

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await UserModel.find();
        res.status(200).json({ data: users, success: true });
    } catch (error) {
        res.status(500).json({ message: "Hata oluştu", success: false });
    }
}


const login = async (req: Request, res: Response) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();
        const user: IUser | null = await UserModel.findOne({ email: { $in: [email] } });
        if (!user) {
            return res.status(401).json({ message: `${email} ile hesap bulunamadı`, success: false });
        }
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Şifre Yanlış', success: false });
        }
        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN_SECRET || '');

        res.status(200).json({ data: { token }, success: true });

    } catch (error) {
        res.status(500).json({ message: "Giriş Yapılamadı", success: false });
    }
};

const getMyInfo = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
    }

    try {
        const user = await UserModel.findOne(userId).select('-password')

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı', success: false });
        }

        res.status(200).json({ data: user, success: true, message: "Kullanıcı bilgileri oluşturuldu" });
    } catch (error) {
        res.status(500).json({ message: 'Kullanıcı bilgileri getirilirken bir hata oluştu', success: false });
    }
}
const addAnEmail = async (req: IRequestWithUser, res: Response) => {
    const user = req.user;
    let { newEmail } = req.body

    if (!user) {
        return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
    }
    try {
        const founded = await UserModel.findOne({ email: { $in: [newEmail] } }).select('-password')
        if (founded) {
            return res.status(400).json({ message: `${newEmail} ile ilişkilendirilmiş bir hesap bulunmakta`, success: false });
        }
    } catch (error) {
        res.status(500).json({ message: 'Bilinmeyen bir hata oluştu', success: false });
    }
    try {
        const verifiedEmail = await VerificationModel.findOne({ email: newEmail })
        if (!verifiedEmail) {
            return res.status(404).json({ message: "Mail eklenirken bir sorun çıktı, tekrar deneyin", success: false })
        }
        if (!verifiedEmail.verified) {
            return res.status(403).send({ message: "Doğrulanmamış mail adresi, tekrar deneyin", success: false })
        }

        newEmail = newEmail.toLowerCase().trim()
        user.email.push(newEmail)
        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            { $set: user },
            { new: true, select: '-password' }
        )
        if (!updatedUser) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        res.status(200).json({ data: updatedUser, success: true, message: "Mail başarıyla eklendi" })

    } catch (error) {
        res.status(500).json({ message: 'Kullanıcı güncellenirken bir hata oluştu', success: false });
    }
}
const deleteAnEmail = async (req: IRequestWithUser, res: Response) => {

    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
    }

    try {
        let { deleteEmail } = req.body
        deleteEmail = deleteEmail.toLowerCase().trim()
        if (user.email[0] == deleteEmail) {
            return res.status(403).json({ message: 'Birincil email adresiniz silinemez', success: false });
        }

        user.email = user.email.filter((email) => email != deleteEmail)
        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            { $set: user },
            { new: true, select: '-password' }
        )
        if (!updatedUser) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı', success: false });
        }
        res.status(200).json({ data: updatedUser, success: true, message: "Silme başarılı" })

    } catch (error) {
        res.status(500).json({ message: 'Kullanıcı güncellenirken bir hata oluştu', success: false });
    }
}

const updateProfile = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id; // Middleware ile eklenen kullanıcı kimliğini al

    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
    }

    try {
        const { nickName, name, surname, phone, password, profileImg } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                nickName,
                name,
                surname,
                phone,
                password: hashedPassword,
                profileImg,
            },
            { new: true, select: '-password' } // Güncellenmiş kullanıcıyı döndür ve şifreyi hariç tut
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı', success: false });
        }

        res.status(200).json({ data: updatedUser, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Kullanıcı güncellenirken bir hata oluştu', success: false });
    }
}
const verifyMailSender = async (req: Request, res: Response) => {
    let { email } = req.body;
    email = email.toLowerCase().trim();
    try {
        const user: IUser | null = await UserModel.findOne({ email: { $in: [email] } });
        if (user) {
            return res.status(400).json({ message: `${email} ile ilişkilendirilmiş bir hesap bulunmakta`, success: false });
        }
    } catch (error) {
        res.status(500).json({ message: "Doğrulama kodu gönderilirken hata meydana geldi", success: false });

    }
    const verificationCode = generateVerificationCode()
    try {
        const foundedVerify = await VerificationModel.findOne({ email })
        if (foundedVerify) {
            foundedVerify.verificationCode = verificationCode;
            foundedVerify.createdDate = new Date()
            await foundedVerify.save()
        }
        else {
            const verification = new VerificationModel({
                email: email,
                verified: false,
                verificationCode: verificationCode,
                createdDate: new Date(),
            });
            await verification.save();
        }
        try {
            const result = await sendVerificationCode(email, verificationCode)
            if (result) {
                res.status(200).json({ message: "Doğrulama Kodu Gönderildi", success: true });
            }
            else {
                throw new Error("Mail Gönderme başarısız");
            }
        } catch (error) {
            res.status(500).json({ message: "Doğrulama kodu gönderilirken hata meydana geldi", success: false });
        }

    } catch (error) {
        res.status(500).json({ message: "Doğrulama kodu kayıt edilirken hata meydana geldi", success: false });
    }
}

const forgottenPassMailSender = async (req: Request, res: Response) => {
    try {
        let { email } = req.body;
        email = email.toLowerCase().trim();
        const user = await UserModel.findOne({ email: { $in: [email] } });
        if (!user) {
            return res.status(401).json({ message: `${email} ile hesap bulunamadı`, success: false });
        }
        const verificationCode = generateVerificationCode()
        try {
            const foundedVerify = await VerificationModel.findOne({ email })
            if (foundedVerify) {
                foundedVerify.verificationCode = verificationCode;
                foundedVerify.createdDate = new Date()
                await foundedVerify.save()
            }
            else {
                const verification = new VerificationModel({
                    email: email,
                    verified: false,
                    verificationCode: verificationCode,
                    createdDate: new Date(),
                });
                await verification.save();
            }
        } catch (error) {
            res.status(500).json({ message: "Doğrulama kodu kayıt edilirken hata meydana geldi", success: false });
        }
        await sendVerificationCode(email, verificationCode)
        res.status(200).json({ message: "Doğrulama Kodu Gönderildi", success: true });
    } catch (error) {
        res.status(500).json({ message: "Doğrulama kodu gönderilemedi, daha sonra tekrar deneyin", success: false });
    }
}

const verifyPassCode = async (req: Request, res: Response) => {
    let { email, verificationCode } = req.body
    email = email.toLowerCase().trim();
    verificationCode = verificationCode.trim()
    try {
        //const foundedVerify = await VerificationModel.findOne({ email })

        const verification = await VerificationModel.findOne({ email })
        if (!verification) {
            res.status(500).json({ message: "Doğrulama sırasında bir hata meydana geldi, daha sonra tekrar deneyin", success: false });
        }
        if (verification?.verificationCode !== verificationCode) {
            res.status(401).json({ message: "Doğrulama kodu hatalı", success: false })
        }
        const data = await VerificationModel.findByIdAndUpdate(verification._id,
            { verified: true },
            { new: true }
        )
        res.status(200).json({ message: "Doğrulama başarılı", success: true })

    } catch (error) {
        res.status(500).json({ message: "Doğrulama sırasında bir hata meydana geldi", success: false });
    }
}

const setNewPass = async (req: Request, res: Response) => {
    let { email, newPass } = req.body
    email = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(newPass, 10);
    try {
        const user = await UserModel.findOne({ email: { $in: [email] } });
        if (!user) {
            return res.status(401).json({ message: `${email} ile ilişkilendirilmiş hesap bulunamadı`, success: false });
        }

        const verification = await VerificationModel.findOne({ email })
        if (!verification) {
            res.status(404).json({ message: "Doğrulama bilgisi bulunamadı, daha sonra tekrar deneyin", success: false });
        }
        if (verification.verified = false) {
            res.status(403).json({ message: "Doğrulanmamış işlem, lütfen tekrar deneyiniz", success: false })
        }

        user.password = hashedPassword
        await user.save()
        res.status(200).json({ message: "Şifre değiştirme başarılı", success: true })
    } catch (error) {
        res.status(500).json({ message: "Şifre yenilemede bir hata meydana geldi", success: false });
    }
}

const getAllVerification = async (req: Request, res: Response) => {
    try {
        const data = await VerificationModel.find()
        return res.status(200).json({ data })
    } catch (error) {

    }
}

const deactiveProfile = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
    }

    try {
        const deactivatedUser: IUser | null = await UserModel.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true, select: '-password' }
        );

        if (!deactivatedUser) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı', success: false });
        }

        res.status(200).json({ message: 'Kullanıcı hesabı deaktif edildi', success: true });
    } catch (error) {
        res.status(500).json({ message: 'Kullanıcı devre dışı bırakılırken bir hata oluştu', success: false });
    }
}

const deleteProfile = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
    }

    try {
        const deletedUser = await UserModel.findByIdAndDelete(userId).select('-password');

        if (!deletedUser) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı', success: false });
        }

        res.status(200).json({ message: 'Kullanıcı başarıyla silindi', success: true });
    } catch (error) {
        res.status(500).json({ message: 'Kullanıcı silinirken bir hata oluştu', success: false });
    }
}


export {
    deactiveProfile,
    deleteProfile,
    register,
    login,
    updateProfile,
    getMyInfo,
    deleteAnEmail,
    addAnEmail,
    getAllUsers,
    verifyPassCode,
    setNewPass,
    forgottenPassMailSender,
    verifyMailSender,
    getAllVerification,

}