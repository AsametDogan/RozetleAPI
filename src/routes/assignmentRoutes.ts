import express from "express"
import { getMyReceived, getMySent, newAssign } from "../controllers/assignment.controller";
import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();



router.get('/myReceived', authMiddleware, getMyReceived)
router.get('/mySent', authMiddleware, getMySent)
router.post('/newAssign', authMiddleware, newAssign)

export default router;