import express from "express"
import { getMyInfo, login, register, updateProfile, deactiveProfile, deleteProfile, getAllUsers, deleteAnEmail, addAnEmail } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { upload } from "../helpers/storage.helper";
const router = express.Router();

router.post('/register',upload.single('profileImg'),  register)
router.post('/login', login)

router.get('/getAllUsers', getAllUsers)

router.post('/addEmail', authMiddleware, addAnEmail)
router.delete('/deleteEmail', authMiddleware, deleteAnEmail)
router.get('/getMyInfo', authMiddleware, getMyInfo)
router.put('/update', authMiddleware, updateProfile)
router.delete('/delete', authMiddleware, deleteProfile)
router.put('/deactive', authMiddleware, deactiveProfile)

export default router;