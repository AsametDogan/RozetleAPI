import express from "express"
import { getMyInfo, login, register, updateProfile, deactiveProfile, deleteProfile, getAllUsers, deleteAnEmail, addAnEmail, forgottenPassMailSender, verifyPassCode, setNewPass, verifyMailSender, getAllVerification } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import multer from "multer";
import { profileImgStorage } from "../helpers/storage.helper";
import { getProfileImg } from "../controllers/image.controller";
const uploadProfile = multer({ storage: profileImgStorage })

const router = express.Router();

router.post('/register', uploadProfile.single('profileImg'), register)
router.post('/login', login)

router.get('/getAllUsers', getAllUsers)
router.get('/getImage/profile/:id', getProfileImg)

router.post('/addEmail', authMiddleware, addAnEmail)
router.delete('/deleteEmail', authMiddleware, deleteAnEmail)
router.get('/getMyInfo', authMiddleware, getMyInfo)
router.put('/update', authMiddleware, updateProfile)
router.delete('/delete', authMiddleware, deleteProfile)
router.put('/deactive', authMiddleware, deactiveProfile)

router.post("/sendVerifyCode", verifyMailSender)

router.post("/forgottenPass", forgottenPassMailSender)
router.post("/verifyCode", verifyPassCode)
router.post("/setNewPass", setNewPass)


router.get("/getAllVerification", getAllVerification)

export default router;


/* export {
    login, ++
    getMyInfo, ++
    deleteAnEmail, ++
    addAnEmail, ++
    getAllUsers, ++
    getAllVerification, ++
    verifyPassCode, ++
    verifyMailSender ++
    deactiveProfile, +
    deleteProfile, +
    register, +
    updateProfile, +
    forgottenPassMailSender, +
    setNewPass, +
} */