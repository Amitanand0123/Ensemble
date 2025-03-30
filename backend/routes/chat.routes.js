import express from 'express'
import {protect} from '../middlewares/auth.js'
import { getPersonalMessages,getProjectMessages,getWorkspaceMessages,markMessagesAsread } from '../controllers/chatController.js'

const router=express.Router()

router.use(protect)

router.get('/personal/:userId',getPersonalMessages)
router.get('/project/:projectId',getProjectMessages)
router.get('/workspace/:workspaceId',getWorkspaceMessages)
router.patch('/read/:chatId',markMessagesAsread)

export default router; 