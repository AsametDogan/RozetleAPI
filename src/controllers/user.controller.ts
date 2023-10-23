import { Request, Response } from "express";
import { IRequestWithFile, IRequestWithUser, IUser } from "../interfaces";
import { UserModel, VerificationModel } from "../models";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { isValidEmail } from "../helpers/validation.helper";
import { sendVerificationCode } from "../helpers/verification.sender.helper";
import { generateVerificationCode } from "../helpers/verification.code.helper";
import { upload } from "../helpers/storage.helper";


const register = async (req: Request, res: Response) => {
    try {
        let { nickName, name, surname, email, password, phone, role, profileImg } = req.body;
        name = name.trim();
        surname = surname.trim();
        email = email.toLowerCase().trim(); // register email string
        phone = phone.trim();

        if (!isValidEmail(email)) {
            return res.status(409).json({
                message: `${email} mail formatında olmalıdır`, success: false
            })
        }
        try {
            const existingUser = await UserModel.findOne({ email: { $in: [email] } });

            if (existingUser) {
                return res.status(400).json({ message: `${email} ile bir hesap bulunmakta`, success: false });
            }
        } catch (error) {
            return res.status(500).json({ message: `Kontrol sırasında hata oluştu, lütfen bildiriniz`, success: false });
        }

        try {

            const uploadedProfileImage = await upload.single('profileImg')
            
        } catch (error) {
            return res.status(500).json({ message: 'Profile image yüklenirken hata oluştu', success: false });
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            nickName,
            name,
            surname,
            email: [email],
            phone,
            password: hashedPassword,
            role,
            profileImg: req.file.path,
            createdDate: new Date(),
        });

        await user.save();
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.TOKEN_SECRET || '');
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
        console.log(req.body)
        if (!user) {
            return res.status(401).json({ message: `${email} ile hesap bulunamadı`, success: false });
        }
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Şifre Yanlış' });
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
        const user = await UserModel.find(userId).select('-password')

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı', success: false });
        }

        res.status(200).json({ data: user, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Kullanıcı bilgileri getirilirken bir hata oluştu', success: false });
    }
}
const addAnEmail = async (req: IRequestWithUser, res: Response) => {

    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Yetkilendirme hatası', success: false });
    }

    try {
        let { newEmail } = req.body
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
        res.status(200).json({ data: updatedUser, success: true })

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
        res.status(200).json({ data: updatedUser, success: true })

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
        const { nickName, name, surname, phone, password, profileImg, role } = req.body;
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
                role,
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

const forgotPassMailSender = async (req: Request, res: Response) => {
    try {
        let { email } = req.body;
        email = email.toLowerCase().trim();
        const user = await UserModel.findOne({ email: { $in: [email] } });
        if (!user) {
            return res.status(401).json({ message: `${email} ile hesap bulunamadı` });
        }
        const verificationCode = generateVerificationCode()

        try {
            const verification = new VerificationModel({
                email: email,
                verificationCode: verificationCode,
                createdDate: new Date(),
            });

            await verification.save();
        } catch (error) {

            res.status(500).json({ message: "Doğrulama kodu kayıt edilirken hata meydana geldi" });
        }
        await sendVerificationCode(email, verificationCode)
        res.status(200).json({ message: "Doğrulama Kodu Gönderildi" });
    } catch (error) {
        res.status(500).json({ message: "Doğrulama kodu gönderilemedi, daha sonra tekrar deneyin" });
    }
}

const verifyForgettenPassCode = async (req: Request, res: Response) => {
    let { email, verificationCode } = req.body
    email = email.toLowerCase().trim();
    verificationCode = verificationCode.trim()
    try {
        const verification = await VerificationModel.findOne({ email })
        if (!verification) {
            res.status(500).json({ message: "Doğrulama sırasında bir hata meydana geldi, daha sonra tekrar deneyin", success: false });
        }
        if (verification?.verificationCode !== verificationCode) {
            res.status(401).json({ message: "Doğrulama kodu hatalı", success: false })
        }
        res.status(200).json({ message: "Doğrulama başarılı", success: true })
    } catch (error) {
        res.status(500).json({ message: "Doğrulama sırasında bir hata meydana geldi", success: false });

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
    deactiveProfile, deleteProfile, register, login, updateProfile, getMyInfo, deleteAnEmail, addAnEmail, getAllUsers, verifyForgettenPassCode,
}