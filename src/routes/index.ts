import express from "express"
import userRouter from "./userRoutes"
import badgeRouter from "./badgeRoutes"
import assignRouter from "./assignmentRoutes"
const router = express.Router();

router.use('/user', userRouter)
router.use('/badge', badgeRouter)
router.use('/assign', assignRouter)


export default router