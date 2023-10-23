import { Response } from "express";
import { IBadge, IRequestWithUser } from "../interfaces";
import { BadgeModel } from "../models";

const createBadge = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id
    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }
    try {
        const { title, imgUrl, categoryId, totalCount, price, attainerRoles } = req.body;
        const newBadge = new BadgeModel({ title, imgUrl, categoryId, totalCount, restCount:totalCount, price, attainerRoles });
        await newBadge.save();
        res.status(201).json({ message: 'Rozet oluşturma başarılı' });
    } catch (error) {
        res.status(500).json({ message: 'Rozet oluşturulurken bir hata oluştu' });
    }
}

const deleteBadge = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id
    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }
    try {
        const { badgeId } = req.body
        const deletedBadge: IBadge | null = await BadgeModel.findByIdAndDelete(badgeId);
        if (!deletedBadge) {
            return res.status(404).json({ message: 'Rozet bulunamadı' });
        }
        res.status(204).json({ message: 'Rozet başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Rozet silinirken bir hata oluştu' });
    }
}

const deactiveBadge = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id
    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }

    try {
        const { badgeId } = req.body
        const deactivatedBadge: IBadge | null = await BadgeModel.findByIdAndUpdate(
            badgeId,
            { isActive: false },
            { new: true }
        ).populate({
            path: "categoryId",
            model: "Category"
        })

        if (!deactivatedBadge) {
            return res.status(404).json({ message: 'Rozet bulunamadı' });
        }

        res.status(200).json(deactivatedBadge);
    } catch (error) {
        res.status(500).json({ message: 'Rozet devre dışı bırakılırken bir hata oluştu' });
    }
}

const updateBadge = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id
    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }


    try {
        const { badgeId } = req.body
        const updatedBadge: IBadge | null = await BadgeModel.findByIdAndUpdate(
            badgeId,
            req.body,
            { new: true }
        ).populate({
            path: "categoryId",
            model: "Category"
        })

        if (!updatedBadge) {
            return res.status(404).json({ message: 'Rozet bulunamadı' });
        }

        res.status(200).json(updatedBadge);
    } catch (error) {
        res.status(500).json({ message: 'Rozet güncellenirken bir hata oluştu' });
    }
}

const getAllBadges = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id
    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }

    try {
        const badges = await BadgeModel.find().populate({
            path: "categoryId",
            model: "Category"
        });
        res.status(200).json(badges);
    } catch (error) {
        res.status(500).json({ message: 'Rozetler getirilirken bir hata oluştu' });
    }

}

const getAvailableBadges = async (req: IRequestWithUser, res: Response) => {
    const userId = req.user?._id
    const userRole = req.user?.role
    if (!userId) {
        return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }
    if (!userRole) {
        return res.status(401).json({ message: 'Yetkilendirilmemiş kullanıcı' });
    }

    try {
        const badges = await BadgeModel.find().populate({
            path: "categoryId",
            model: "Category"
        });

        const availableBadges = badges.filter((badge => badge.attainerRoles.includes(userRole)))
        res.status(200).json(availableBadges);
    } catch (error) {
        res.status(500).json({ message: 'Rozetler getirilirken bir hata oluştu' });
    }

}

export { getAllBadges, createBadge, deleteBadge, deactiveBadge, updateBadge,getAvailableBadges }