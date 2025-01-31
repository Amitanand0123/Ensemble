import express from 'express'
import {protect} from '../middlewares/auth.js'
import { getPersonalMessages,getProjectMessages,markMessagesAsread } from '../controllers/chatController.js'

const router=express.Router()

router.use(protect)

router.get('/personal/:userId',getPersonalMessages)
router.get('/project/:projectId',getProjectMessages)
router.patch('/read/:chatId',markMessagesAsread)

export default router; 