import express from "express"
import { createBadge, deactiveBadge, deleteBadge, getAllBadges, updateBadge } from "../controllers/badge.controller";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();


router.get('/getAllBadges', authMiddleware, getAllBadges)
router.get('/getAllBadges', authMiddleware, getAllBadges)

router.post('/createBadge', adminMiddleware, createBadge)
router.delete('/deleteBadge', adminMiddleware, deleteBadge)
router.post('/deactiveBadge', adminMiddleware, deactiveBadge)
router.put('/updateBadge', adminMiddleware, updateBadge)

export default router;