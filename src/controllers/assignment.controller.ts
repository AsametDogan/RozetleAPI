import { Response } from "express";
import { IAssignment, IRequestWithUser, IUser } from "../interfaces";
import { AssignmentModel, BadgeModel, UserModel } from "../models";



const newAssign = async (req: IRequestWithUser, res: Response) => {
    try {
        const { description, receiverInfo, badgeId } = req.body;
        const userId = req.user?._id;
        const userRole = req.user?.role;

        if (!userId) {
            return res.status(401).json({ message: 'Yetkilendirme hatası' });
        }

        const existingAssignment: IAssignment | null = await AssignmentModel.findOne({
            senderId: userId,
            receiverInfo,
            badgeId,
        });

        if (existingAssignment) {
            return res.status(400).json({ message: 'Bu rozeti zaten atadınız' });
        }

        const badge = await BadgeModel.findById(badgeId)

        if (!badge) {
            return res.status(404).json({ message: 'Rozet Bulunamadı' });
        }
        if (!userRole) {
            return res.status(401).json({ message: 'Yetkilendirme hatası' });
        }
        if (!badge.attainerRoles.includes(userRole)) {
            return res.status(401).json({ message: 'Bu rozeti almaya yetkiniz yoktur' });
        }
        if (badge.restCount <= 0) {
            return res.status(400).json({ message: 'Rozet stoğu kalmamıştır' });
        }
        // restCount değerini azalt
        badge.restCount--;
        const updatedBadge = await BadgeModel.findByIdAndUpdate(
            badgeId,
            { $set: badge },
            { new: true }
        );

        if (!updatedBadge) {
            return res.status(500).json({ message: 'Rozet gönderilirken bir hata meydana geldi' });
        }

        const assignment = new AssignmentModel({
            description,
            senderId: userId,
            receiverInfo,
            badgeId,
            assignDate: new Date(),
        });

        await assignment.save();

        res.status(201).json({ message: 'Rozet gönderildi' });
    } catch (error) {
        res.status(500).json({ message: 'Rozet gönderilirken bir hata oluştu' });
    }
}


const getMyReceived = async (req: IRequestWithUser, res: Response) => {
    const receiverEmail = req.user?.email;
    const receiverPhone = req.user?.phone;
    if (!receiverEmail) {
        return res.status(401).json({ message: 'Alıcı iletişim adreslerini kontrol edin' });
    }

    try {
        const receivedBadges = await AssignmentModel.find({ receiverInfo: { $in: receiverEmail || [receiverPhone] } })
            .populate({
                path: 'badgeId',
                model: 'Badge', // Badge model adı
            })
            .populate({
                path: 'senderId',
                model: 'User', // User model adı
                select: 'nickName name surname email profileImg',
            });
        if (!receivedBadges) {
            return res.status(204).json({ message: 'Henüz hiç rozet almadınız' });
        }

        res.status(200).json(receivedBadges);
    } catch (error) {
        res.status(500).json({ message: 'Rozet bilgileri getirilirken bir hata oluştu' });
    }
}

const getMySent = async (req: IRequestWithUser, res: Response) => {
    const senderId = req.user?._id;
    if (!senderId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }

    try {
        // tüm göndermeleri rozet bilgilerini badgeId ye açarak çek
        const sentBadges = await AssignmentModel.find({ senderId })
            .populate({
                path: 'badgeId',
                model: 'Badge', // Badge model adı
            })

        var sentBadgesWithReceiver: any[] = [];

        if (!sentBadges) {
            return res.status(204).json([]);
        }
        try {
            //her rozet gönderimi için user bilgisini çekmeye çalış, çekilemeyenler için receiverInfo içinde yalnızca alıcı emaili barındırsın
            sentBadges.forEach(async (data) => {
                const receiver = await UserModel.findOne({ email: { $elemMatch: data.receiverInfo } })
                if (receiver) {
                    sentBadgesWithReceiver.push({ ...data, receiverInfo: { nickName: receiver.nickName, name: receiver.name, surname: receiver.surname, email: data.receiverInfo, profileImg: receiver.profileImg } })
                }
                else {
                    sentBadgesWithReceiver.push({ ...data, receiverInfo: { email: data.receiverInfo } })
                }
            })
        } catch (error) {
            return res.status(500).json({ message: 'Rozet alıcı bilgisini çekerken beklenmeyen bir hata meydana geldi' });
        }

        res.status(200).json(sentBadgesWithReceiver)
    } catch (error) {
        res.status(500).json({ message: 'Rozet bilgileri getirilirken bir hata oluştu' });
    }
}

export { getMyReceived, getMySent, newAssign }