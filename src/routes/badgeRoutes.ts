import express from "express"
import { createBadge, deactiveBadge, deleteBadge, getAllBadges, updateBadge } from "../controllers/badge.controller";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";
import multer from "multer";
import { badgeImgStorage } from "../helpers/storage.helper";
const uploadBadge = multer({ storage: badgeImgStorage })

const router = express.Router();


router.get('/getAll', authMiddleware, getAllBadges)

router.post('/create', uploadBadge.single('badgeImg'), createBadge)
router.delete('/delete', deleteBadge)
router.post('/deactive', deactiveBadge)
router.put('/update', updateBadge)

export default router;